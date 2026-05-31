// Module 07 — Project 01 — BLE Robot Car (ESP32)
//
// Advertises one BLE service with one WRITE characteristic. Each write
// is a UTF-8 text frame "<left>,<right>" with values in [-255, 255].
// 500 ms watchdog: motors zero if no frame arrives.
//
// Pins (L298N):
//   ENA=22 IN1=16 IN2=17 (right motor)
//   ENB=23 IN3=18 IN4=19 (left motor)
//
// See: ../../../../README.md and ../../../../docs/motor-driver.md

#include <Arduino.h>
#include <BLE2902.h>
#include <BLECharacteristic.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>

namespace {

// ---------- motor pins -----------------------------------------------------
constexpr uint8_t kEnaPin = 22;  // right PWM
constexpr uint8_t kIn1Pin = 16;
constexpr uint8_t kIn2Pin = 17;
constexpr uint8_t kEnbPin = 23;  // left PWM
constexpr uint8_t kIn3Pin = 18;
constexpr uint8_t kIn4Pin = 19;

// ---------- PWM (ledc) -----------------------------------------------------
constexpr uint32_t kPwmFreqHz       = 1000;
constexpr uint8_t  kPwmResolutionBits = 8;
constexpr uint8_t  kRightPwmChannel = 4;
constexpr uint8_t  kLeftPwmChannel  = 5;

// ---------- safety ---------------------------------------------------------
constexpr uint32_t kWatchdogMs = 500;

// ---------- BLE UUIDs ------------------------------------------------------
// Random base UUID — change the last hex digit to add more characteristics.
constexpr const char* kServiceUuid     = "12345678-1234-5678-1234-56789abcdef0";
constexpr const char* kCommandCharUuid = "12345678-1234-5678-1234-56789abcdef1";
constexpr const char* kDeviceName      = "HOR-Car-BLE";

// ---------- shared between BLE callback and loop ---------------------------
volatile int      g_target_left   = 0;
volatile int      g_target_right  = 0;
volatile uint32_t g_last_cmd_ms   = 0;

// ---------- motor helpers --------------------------------------------------
void set_pin_modes() {
    pinMode(kEnaPin, OUTPUT);
    pinMode(kIn1Pin, OUTPUT);
    pinMode(kIn2Pin, OUTPUT);
    pinMode(kEnbPin, OUTPUT);
    pinMode(kIn3Pin, OUTPUT);
    pinMode(kIn4Pin, OUTPUT);

    ledcSetup(kRightPwmChannel, kPwmFreqHz, kPwmResolutionBits);
    ledcSetup(kLeftPwmChannel,  kPwmFreqHz, kPwmResolutionBits);
    ledcAttachPin(kEnaPin, kRightPwmChannel);
    ledcAttachPin(kEnbPin, kLeftPwmChannel);
}

int clamp_speed(int v) {
    if (v >  255) return  255;
    if (v < -255) return -255;
    return v;
}

void drive_motors(int right, int left) {
    right = clamp_speed(right);
    left  = clamp_speed(left);

    // Right motor direction
    if (right > 0)       { digitalWrite(kIn1Pin, HIGH); digitalWrite(kIn2Pin, LOW);  }
    else if (right < 0)  { digitalWrite(kIn1Pin, LOW);  digitalWrite(kIn2Pin, HIGH); }
    else                 { digitalWrite(kIn1Pin, LOW);  digitalWrite(kIn2Pin, LOW);  }

    // Left motor direction
    if (left > 0)        { digitalWrite(kIn3Pin, HIGH); digitalWrite(kIn4Pin, LOW);  }
    else if (left < 0)   { digitalWrite(kIn3Pin, LOW);  digitalWrite(kIn4Pin, HIGH); }
    else                 { digitalWrite(kIn3Pin, LOW);  digitalWrite(kIn4Pin, LOW);  }

    ledcWrite(kRightPwmChannel, abs(right));
    ledcWrite(kLeftPwmChannel,  abs(left));
}

// ---------- BLE callbacks --------------------------------------------------
class CommandCallback : public BLECharacteristicCallbacks {
    void onWrite(BLECharacteristic* chr) override {
        const std::string value = chr->getValue();
        // Parse "<left>,<right>". `strtol` skips leading whitespace and
        // tolerates an optional trailing '\n'.
        char* end = nullptr;
        const long left  = std::strtol(value.c_str(), &end, 10);
        if (!end || *end != ',') {
            Serial.printf("[ble] bad frame: '%s'\n", value.c_str());
            return;
        }
        const long right = std::strtol(end + 1, nullptr, 10);

        g_target_left  = static_cast<int>(left);
        g_target_right = static_cast<int>(right);
        g_last_cmd_ms  = millis();
    }
};

class ServerCallback : public BLEServerCallbacks {
    void onConnect(BLEServer* /*srv*/) override {
        Serial.println("[ble] connected");
    }
    void onDisconnect(BLEServer* srv) override {
        Serial.println("[ble] disconnected — re-advertising");
        // Force motors off immediately; don't wait for the watchdog.
        g_target_left  = 0;
        g_target_right = 0;
        g_last_cmd_ms  = 0;
        srv->getAdvertising()->start();
    }
};

void start_ble() {
    BLEDevice::init(kDeviceName);
    BLEServer*  server  = BLEDevice::createServer();
    server->setCallbacks(new ServerCallback());

    BLEService* service = server->createService(kServiceUuid);
    BLECharacteristic* cmd = service->createCharacteristic(
        kCommandCharUuid,
        BLECharacteristic::PROPERTY_WRITE | BLECharacteristic::PROPERTY_WRITE_NR);
    cmd->setCallbacks(new CommandCallback());
    cmd->addDescriptor(new BLE2902());

    service->start();

    BLEAdvertising* adv = BLEDevice::getAdvertising();
    adv->addServiceUUID(kServiceUuid);
    adv->setScanResponse(true);
    adv->setMinPreferred(0x06);  // helps iOS connect faster
    BLEDevice::startAdvertising();

    Serial.printf("[ble] advertising as %s\n", kDeviceName);
}

}  // namespace

void setup() {
    Serial.begin(SERIAL_BAUD);
    delay(200);
    Serial.println("\n[boot] hands-on-robotics m07/01 ble-control");

    set_pin_modes();
    drive_motors(0, 0);
    start_ble();
}

void loop() {
    const uint32_t now = millis();
    const bool stale = (g_last_cmd_ms == 0) || (now - g_last_cmd_ms > kWatchdogMs);
    const int right = stale ? 0 : g_target_right;
    const int left  = stale ? 0 : g_target_left;
    drive_motors(right, left);
    delay(20);  // 50 Hz control loop is plenty for hobby motors
}
