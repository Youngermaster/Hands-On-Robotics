// Module 06 — Wireless BLE (ESP32)
//
// Advertises one BLE GATT service with two characteristics:
//   - MODE (WRITE):   1 byte — desired LED behavior (0..3)
//   - STATE (NOTIFY): 1 byte — the current mode, echoed after every change
//
// LED modes:
//   0 = off
//   1 = on
//   2 = blink at 500 ms period (slow)
//   3 = blink at 100 ms period (fast)
//
// The blink runs in the main loop (no delay-based blocking) so BLE stays
// responsive. Disconnects do NOT reset the mode — the LED keeps its
// last-set behavior even when the phone walks away. Re-advertise
// immediately so the next client can connect.

#include <Arduino.h>
#include <BLE2902.h>
#include <BLECharacteristic.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>

namespace {

// ---------- pins & modes ---------------------------------------------------
constexpr uint8_t kLedPin = 2;

enum class LedMode : uint8_t {
    kOff  = 0,
    kOn   = 1,
    kSlow = 2,
    kFast = 3,
};

constexpr uint32_t kSlowHalfPeriodMs = 500;  // 1 Hz overall
constexpr uint32_t kFastHalfPeriodMs = 100;  // 5 Hz overall

// ---------- BLE UUIDs ------------------------------------------------------
constexpr const char* kServiceUuid   = "9a70b2e0-4b1a-4b0e-9a2a-1c1c1c1c0001";
constexpr const char* kModeCharUuid  = "9a70b2e0-4b1a-4b0e-9a2a-1c1c1c1c0002";
constexpr const char* kStateCharUuid = "9a70b2e0-4b1a-4b0e-9a2a-1c1c1c1c0003";
constexpr const char* kDeviceName    = "HOR-LED-BLE";

// ---------- shared state ---------------------------------------------------
volatile LedMode g_mode = LedMode::kOff;

BLECharacteristic* g_state_char = nullptr;

// ---------- helpers --------------------------------------------------------
LedMode clamp_mode(uint8_t b) {
    switch (b) {
        case 0: return LedMode::kOff;
        case 1: return LedMode::kOn;
        case 2: return LedMode::kSlow;
        case 3: return LedMode::kFast;
        default: return LedMode::kOff;  // safe default
    }
}

const char* mode_name(LedMode m) {
    switch (m) {
        case LedMode::kOff:  return "off";
        case LedMode::kOn:   return "on";
        case LedMode::kSlow: return "slow";
        case LedMode::kFast: return "fast";
    }
    return "?";
}

// Notify the connected central of the current mode.
void notify_state(LedMode m) {
    if (!g_state_char) return;
    uint8_t byte = static_cast<uint8_t>(m);
    g_state_char->setValue(&byte, 1);
    g_state_char->notify();
}

// ---------- BLE callbacks --------------------------------------------------
class ModeCallback : public BLECharacteristicCallbacks {
    void onWrite(BLECharacteristic* chr) override {
        const std::string value = chr->getValue();
        if (value.empty()) return;
        const LedMode requested = clamp_mode(static_cast<uint8_t>(value[0]));
        g_mode = requested;
        Serial.printf("[ble] mode -> %s\n", mode_name(requested));
        notify_state(requested);
    }
};

class ServerCallback : public BLEServerCallbacks {
    void onConnect(BLEServer* /*srv*/) override {
        Serial.println("[ble] connected");
        // Push the current state to the newly-connected client so its UI
        // starts in sync even before the user touches a button.
        notify_state(g_mode);
    }
    void onDisconnect(BLEServer* srv) override {
        Serial.println("[ble] disconnected — re-advertising");
        srv->getAdvertising()->start();
    }
};

void start_ble() {
    BLEDevice::init(kDeviceName);
    BLEServer*  server  = BLEDevice::createServer();
    server->setCallbacks(new ServerCallback());

    BLEService* service = server->createService(kServiceUuid);

    // Mode = write-only from the central's perspective.
    BLECharacteristic* mode_char = service->createCharacteristic(
        kModeCharUuid,
        BLECharacteristic::PROPERTY_WRITE | BLECharacteristic::PROPERTY_WRITE_NR);
    mode_char->setCallbacks(new ModeCallback());
    mode_char->addDescriptor(new BLE2902());

    // State = read + notify. The central subscribes; we emit on every change.
    g_state_char = service->createCharacteristic(
        kStateCharUuid,
        BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_NOTIFY);
    g_state_char->addDescriptor(new BLE2902());
    uint8_t initial = static_cast<uint8_t>(LedMode::kOff);
    g_state_char->setValue(&initial, 1);

    service->start();

    BLEAdvertising* adv = BLEDevice::getAdvertising();
    adv->addServiceUUID(kServiceUuid);
    adv->setScanResponse(true);
    adv->setMinPreferred(0x06);  // helps iOS connect faster
    BLEDevice::startAdvertising();

    Serial.printf("[ble] advertising as %s\n", kDeviceName);
}

// ---------- blink loop -----------------------------------------------------
// State for the non-blocking blinker. `last_toggle_ms` tracks when we
// most-recently flipped the LED so we can decide when the next flip is due.
uint32_t g_last_toggle_ms = 0;
bool     g_led_hi         = false;

void run_blink_loop() {
    const uint32_t now = millis();
    switch (g_mode) {
        case LedMode::kOff:
            if (g_led_hi) {
                digitalWrite(kLedPin, LOW);
                g_led_hi = false;
            }
            break;
        case LedMode::kOn:
            if (!g_led_hi) {
                digitalWrite(kLedPin, HIGH);
                g_led_hi = true;
            }
            break;
        case LedMode::kSlow:
        case LedMode::kFast: {
            const uint32_t half =
                (g_mode == LedMode::kSlow) ? kSlowHalfPeriodMs : kFastHalfPeriodMs;
            if (now - g_last_toggle_ms >= half) {
                g_led_hi = !g_led_hi;
                digitalWrite(kLedPin, g_led_hi ? HIGH : LOW);
                g_last_toggle_ms = now;
            }
            break;
        }
    }
}

}  // namespace

void setup() {
    pinMode(kLedPin, OUTPUT);
    digitalWrite(kLedPin, LOW);

    Serial.begin(SERIAL_BAUD);
    delay(200);
    Serial.println("\n[boot] hands-on-robotics m06 wireless-ble");

    start_ble();
}

void loop() {
    run_blink_loop();
    // 5 ms tick is well below our fastest half-period (100 ms) so timing
    // stays crisp, and still light on the CPU.
    delay(5);
}
