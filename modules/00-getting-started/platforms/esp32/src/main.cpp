// Module 00 — ESP32
// Blink the onboard LED (usually GPIO 2) and print a heartbeat over USB-CDC.

#include <Arduino.h>

namespace {
constexpr uint8_t kLedPin = 2;            // onboard LED on most DOIT-style boards
constexpr uint32_t kHalfPeriodMs = 500;   // 1 Hz overall
}  // namespace

void setup() {
    pinMode(kLedPin, OUTPUT);
    Serial.begin(SERIAL_BAUD);
    delay(200);
    Serial.println("hello, hands-on-robotics");
    Serial.printf("chip: %s rev %d, %d cores @ %d MHz\n",
                  ESP.getChipModel(), ESP.getChipRevision(),
                  ESP.getChipCores(), getCpuFrequencyMhz());
}

void loop() {
    digitalWrite(kLedPin, HIGH);
    Serial.println("tick");
    delay(kHalfPeriodMs);
    digitalWrite(kLedPin, LOW);
    delay(kHalfPeriodMs);
}
