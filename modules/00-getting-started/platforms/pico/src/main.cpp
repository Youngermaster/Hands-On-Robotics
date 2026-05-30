// Module 00 — Raspberry Pi Pico (RP2040)
// Blink the onboard LED and print a heartbeat over USB-CDC.

#include <Arduino.h>

namespace {
constexpr uint8_t kLedPin = LED_BUILTIN;  // GPIO 25 on the bare Pico
constexpr uint32_t kHalfPeriodMs = 500;
}  // namespace

void setup() {
    pinMode(kLedPin, OUTPUT);
    Serial.begin(SERIAL_BAUD);
    // USB-CDC on the Pico can take ~1 s to enumerate on the host.
    // Wait for it (with a timeout) so the greeting isn't lost.
    const uint32_t deadline = millis() + 2000;
    while (!Serial && millis() < deadline) {
        delay(10);
    }
    Serial.println("hello, hands-on-robotics");
}

void loop() {
    digitalWrite(kLedPin, HIGH);
    Serial.println("tick");
    delay(kHalfPeriodMs);
    digitalWrite(kLedPin, LOW);
    delay(kHalfPeriodMs);
}
