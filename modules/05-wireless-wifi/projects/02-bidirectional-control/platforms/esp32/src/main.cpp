// Module 05 — Project 02 — Bidirectional Control (ESP32)
//
// Two channels:
//   1. button press → POST /events  (uplink)
//   2. periodic GET /led → drive onboard LED  (downlink, polled)
//
// Polling cadence ≈ 500 ms; latency for a curl → LED flip averages ~250 ms.
//
// Pins:
//   GPIO 2  ── 220 Ω ── LED ── GND (or use onboard LED)
//   GPIO 4  ── button ── GND       (INPUT_PULLUP)
//
// Configure WIFI_SSID / WIFI_PASSWORD / SERVER_BASE_URL in `secrets.h`.

#include <Arduino.h>
#include <ArduinoJson.h>
#include <HTTPClient.h>
#include <WiFi.h>

#include "secrets.h"

namespace {

constexpr uint8_t  kLedPin       = 2;
constexpr uint8_t  kBtnPin       = 4;
constexpr uint32_t kDebounceMs   = 30;
constexpr uint32_t kPollPeriodMs = 500;
constexpr uint32_t kWifiRetryMs  = 500;

// Shared between ISR and loop. `volatile` is required.
volatile bool     g_press_pending = false;
volatile uint32_t g_last_isr_ms   = 0;

// Current LED state as commanded by the server. We track it locally so
// we don't keep slamming the GPIO on every poll.
bool g_led_on = false;

void IRAM_ATTR on_button_press() {
    const uint32_t now = millis();
    if (now - g_last_isr_ms < kDebounceMs) {
        return;
    }
    g_last_isr_ms = now;
    g_press_pending = true;
}

void wait_for_wifi() {
    Serial.printf("[wifi] connecting to %s", WIFI_SSID);
    WiFi.mode(WIFI_STA);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    while (WiFi.status() != WL_CONNECTED) {
        Serial.print('.');
        delay(kWifiRetryMs);
    }
    Serial.printf("\n[wifi] connected, ip=%s rssi=%d\n",
                  WiFi.localIP().toString().c_str(), WiFi.RSSI());
}

bool post_button_event() {
    StaticJsonDocument<128> doc;
    doc["event"]     = "button_pressed";
    doc["uptime_ms"] = millis();

    char body[128];
    const size_t n = serializeJson(doc, body, sizeof(body));

    const String url = String(SERVER_BASE_URL) + "/events";
    HTTPClient http;
    if (!http.begin(url)) {
        Serial.println("[event] http.begin failed");
        return false;
    }
    http.addHeader("Content-Type", "application/json");
    const int code = http.POST(reinterpret_cast<uint8_t*>(body), n);
    http.end();
    Serial.printf("[event] POST /events -> %d\n", code);
    return code >= 200 && code < 300;
}

// Returns true if the request succeeded; sets `*out_on` from the response.
bool fetch_led_state(bool* out_on) {
    const String url = String(SERVER_BASE_URL) + "/led";
    HTTPClient http;
    if (!http.begin(url)) {
        Serial.println("[led] http.begin failed");
        return false;
    }
    const int code = http.GET();
    if (code != HTTP_CODE_OK) {
        Serial.printf("[led] GET /led -> %d\n", code);
        http.end();
        return false;
    }
    const String body = http.getString();
    http.end();

    StaticJsonDocument<64> doc;
    const DeserializationError err = deserializeJson(doc, body);
    if (err) {
        Serial.printf("[led] bad JSON: %s\n", err.c_str());
        return false;
    }
    *out_on = doc["on"] | false;
    return true;
}

}  // namespace

void setup() {
    pinMode(kLedPin, OUTPUT);
    digitalWrite(kLedPin, LOW);

    pinMode(kBtnPin, INPUT_PULLUP);
    attachInterrupt(digitalPinToInterrupt(kBtnPin), on_button_press, FALLING);

    Serial.begin(SERIAL_BAUD);
    delay(200);
    Serial.println("\n[boot] hands-on-robotics m05/02 bidirectional-control");

    wait_for_wifi();
}

void loop() {
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("[wifi] dropped, reconnecting");
        wait_for_wifi();
    }

    // 1) Uplink: drain the button event if any.
    if (g_press_pending) {
        // Confirm the button is still down before posting (fast-bounce filter).
        if (digitalRead(kBtnPin) == LOW) {
            post_button_event();
        }
        noInterrupts();
        g_press_pending = false;
        interrupts();
    }

    // 2) Downlink: poll for desired LED state and apply changes only.
    bool desired = g_led_on;
    if (fetch_led_state(&desired) && desired != g_led_on) {
        g_led_on = desired;
        digitalWrite(kLedPin, g_led_on ? HIGH : LOW);
        Serial.printf("[led] -> %s\n", g_led_on ? "on" : "off");
    }

    delay(kPollPeriodMs);
}
