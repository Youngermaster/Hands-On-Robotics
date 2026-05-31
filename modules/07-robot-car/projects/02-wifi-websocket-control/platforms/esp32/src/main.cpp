// Module 07 — Project 02 — Wi-Fi WebSocket Robot Car (ESP32)
//
// Joins Wi-Fi, hosts a WebSocket server on WS_PORT. Each incoming text
// frame is "<left>,<right>" with values in [-255, 255]. 500 ms watchdog
// zeroes both motors if no frame arrives.
//
// Pins (L298N) and protocol match the BLE variant exactly.

#include <Arduino.h>
#include <WebSocketsServer.h>
#include <WiFi.h>

#include "secrets.h"

namespace {

// ---------- motor pins -----------------------------------------------------
constexpr uint8_t kEnaPin = 22;
constexpr uint8_t kIn1Pin = 16;
constexpr uint8_t kIn2Pin = 17;
constexpr uint8_t kEnbPin = 23;
constexpr uint8_t kIn3Pin = 18;
constexpr uint8_t kIn4Pin = 19;

constexpr uint32_t kPwmFreqHz         = 1000;
constexpr uint8_t  kPwmResolutionBits = 8;
constexpr uint8_t  kRightPwmChannel   = 4;
constexpr uint8_t  kLeftPwmChannel    = 5;

constexpr uint32_t kWatchdogMs        = 500;
constexpr uint32_t kWifiRetryMs       = 500;

// ---------- shared state ---------------------------------------------------
volatile int      g_target_left   = 0;
volatile int      g_target_right  = 0;
volatile uint32_t g_last_cmd_ms   = 0;

WebSocketsServer g_ws(WS_PORT);

// ---------- helpers (identical to the BLE variant) -------------------------
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

    if (right > 0)       { digitalWrite(kIn1Pin, HIGH); digitalWrite(kIn2Pin, LOW);  }
    else if (right < 0)  { digitalWrite(kIn1Pin, LOW);  digitalWrite(kIn2Pin, HIGH); }
    else                 { digitalWrite(kIn1Pin, LOW);  digitalWrite(kIn2Pin, LOW);  }

    if (left > 0)        { digitalWrite(kIn3Pin, HIGH); digitalWrite(kIn4Pin, LOW);  }
    else if (left < 0)   { digitalWrite(kIn3Pin, LOW);  digitalWrite(kIn4Pin, HIGH); }
    else                 { digitalWrite(kIn3Pin, LOW);  digitalWrite(kIn4Pin, LOW);  }

    ledcWrite(kRightPwmChannel, abs(right));
    ledcWrite(kLeftPwmChannel,  abs(left));
}

// ---------- Wi-Fi ----------------------------------------------------------
void wait_for_wifi() {
    Serial.printf("[wifi] connecting to %s", WIFI_SSID);
    WiFi.mode(WIFI_STA);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    while (WiFi.status() != WL_CONNECTED) {
        Serial.print('.');
        delay(kWifiRetryMs);
    }
    Serial.printf("\n[wifi] connected, ip=%s\n", WiFi.localIP().toString().c_str());
}

// ---------- WebSocket ------------------------------------------------------
void parse_frame(const char* data, size_t len) {
    // Bounded copy so we can null-terminate without mutating library buffers.
    char buf[32];
    const size_t n = (len < sizeof(buf) - 1) ? len : (sizeof(buf) - 1);
    memcpy(buf, data, n);
    buf[n] = '\0';

    char* end = nullptr;
    const long left = std::strtol(buf, &end, 10);
    if (!end || *end != ',') {
        Serial.printf("[ws] bad frame: '%s'\n", buf);
        return;
    }
    const long right = std::strtol(end + 1, nullptr, 10);

    g_target_left  = static_cast<int>(left);
    g_target_right = static_cast<int>(right);
    g_last_cmd_ms  = millis();
}

void on_ws_event(uint8_t num, WStype_t type, uint8_t* payload, size_t length) {
    switch (type) {
        case WStype_CONNECTED: {
            const IPAddress ip = g_ws.remoteIP(num);
            Serial.printf("[ws] client #%u connected from %s\n", num, ip.toString().c_str());
            break;
        }
        case WStype_DISCONNECTED:
            Serial.printf("[ws] client #%u disconnected — stopping motors\n", num);
            g_target_left  = 0;
            g_target_right = 0;
            g_last_cmd_ms  = 0;
            break;
        case WStype_TEXT:
            parse_frame(reinterpret_cast<const char*>(payload), length);
            break;
        case WStype_ERROR:
            Serial.printf("[ws] client #%u error\n", num);
            break;
        default:
            // PING/PONG/BIN — ignore
            break;
    }
}

}  // namespace

void setup() {
    Serial.begin(SERIAL_BAUD);
    delay(200);
    Serial.println("\n[boot] hands-on-robotics m07/02 wifi-websocket-control");

    set_pin_modes();
    drive_motors(0, 0);

    wait_for_wifi();
    g_ws.begin();
    g_ws.onEvent(on_ws_event);
    Serial.printf("[ws] server listening on :%d\n", WS_PORT);
}

void loop() {
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("[wifi] dropped, reconnecting");
        wait_for_wifi();
    }

    g_ws.loop();

    const uint32_t now = millis();
    const bool stale = (g_last_cmd_ms == 0) || (now - g_last_cmd_ms > kWatchdogMs);
    drive_motors(stale ? 0 : g_target_right, stale ? 0 : g_target_left);

    // No delay — the WS loop wants frequent ticks for responsive comms.
    // The motor write itself is cheap.
}
