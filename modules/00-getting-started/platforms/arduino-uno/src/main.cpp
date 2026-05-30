// Module 00 — Arduino Uno
// Blink the onboard LED at 1 Hz and print a heartbeat over USB serial.
//
// Pins:
//   LED_BUILTIN (D13) — onboard LED, no wiring needed.
//
// Serial: 9600 baud (matches the platformio.ini monitor_speed).

#include <Arduino.h>

namespace {
constexpr unsigned long kBlinkPeriodMs = 1000;  // total period; toggle every half.
constexpr unsigned long kHalfPeriodMs  = kBlinkPeriodMs / 2;
}  // namespace

void setup() {
    pinMode(LED_BUILTIN, OUTPUT);
    Serial.begin(SERIAL_BAUD);
    // Give the host serial a moment to settle. Crucial on macOS where the
    // ATmega328P resets on USB-CDC enumeration.
    delay(200);
    Serial.println(F("hello, hands-on-robotics"));
}

void loop() {
    digitalWrite(LED_BUILTIN, HIGH);
    Serial.println(F("tick"));
    delay(kHalfPeriodMs);
    digitalWrite(LED_BUILTIN, LOW);
    delay(kHalfPeriodMs);
}
