// Module 05 — Project 01 — Telemetry Uplink (ESP32)
//
// Connects to Wi-Fi, then every 5 seconds POSTs a JSON heartbeat to the
// Axum server. The onboard LED flashes briefly on each successful POST.
//
// Configure SSID / password / server URL in `secrets.h` (copy from
// `secrets.h.example`).

#include <Arduino.h>
#include <ArduinoJson.h>
#include <HTTPClient.h>
#include <WiFi.h>

#include "secrets.h"

namespace {

constexpr uint8_t  kLedPin       = 2;
constexpr uint32_t kPostPeriodMs = 5000;
constexpr uint32_t kWifiRetryMs  = 500;

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

void blink_ok() {
    digitalWrite(kLedPin, HIGH);
    delay(40);
    digitalWrite(kLedPin, LOW);
}

bool post_telemetry() {
    // Build the JSON document. 256 B is plenty for these fields.
    StaticJsonDocument<256> doc;
    doc["chip"]      = ESP.getChipModel();
    doc["rev"]       = ESP.getChipRevision();
    doc["cores"]     = ESP.getChipCores();
    doc["freq_mhz"]  = getCpuFrequencyMhz();
    doc["uptime_ms"] = millis();
    doc["rssi"]      = WiFi.RSSI();

    char body[256];
    const size_t n = serializeJson(doc, body, sizeof(body));

    HTTPClient http;
    if (!http.begin(SERVER_URL)) {
        Serial.println("[uplink] http.begin failed");
        return false;
    }
    http.addHeader("Content-Type", "application/json");
    const int code = http.POST(reinterpret_cast<uint8_t*>(body), n);
    http.end();

    Serial.printf("[uplink] POST %s -> %d\n", SERVER_URL, code);
    return code >= 200 && code < 300;
}

}  // namespace

void setup() {
    pinMode(kLedPin, OUTPUT);
    digitalWrite(kLedPin, LOW);

    Serial.begin(SERIAL_BAUD);
    delay(200);
    Serial.println("\n[boot] hands-on-robotics m05/01 telemetry-uplink");

    wait_for_wifi();
}

void loop() {
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("[wifi] dropped, reconnecting");
        wait_for_wifi();
    }
    if (post_telemetry()) {
        blink_ok();
    }
    delay(kPostPeriodMs);
}
