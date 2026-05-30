// Module 01 — Arduino Uno
// Press the button → toggle the LED. Interrupt-driven with software debounce.
//
// Wiring (no external resistors required for the button — internal pull-up):
//   D2  ── button ── GND
//   D13 ── 220 Ω ── LED ── GND
//
// D2 is one of the two pins on the Uno that supports hardware external
// interrupts (the other is D3).

#include <Arduino.h>

namespace {

constexpr uint8_t kBtnPin = 2;            // INT0
constexpr uint8_t kLedPin = LED_BUILTIN;  // D13
constexpr unsigned long kDebounceMs = 30;

// `volatile` because written by the ISR and read by `loop()`. Without
// `volatile` the compiler may cache the value in a register and miss the update.
volatile bool g_press_pending = false;
volatile unsigned long g_last_isr_ms = 0;

void on_button_press() {
    // Cheap in-ISR debounce: ignore edges within `kDebounceMs` of the last.
    // Real cleanup happens in loop() where we can call `digitalRead`.
    const unsigned long now = millis();
    if (now - g_last_isr_ms < kDebounceMs) return;
    g_last_isr_ms = now;
    g_press_pending = true;
}

}  // namespace

void setup() {
    pinMode(kLedPin, OUTPUT);
    digitalWrite(kLedPin, LOW);
    pinMode(kBtnPin, INPUT_PULLUP);
    attachInterrupt(digitalPinToInterrupt(kBtnPin), on_button_press, FALLING);

    Serial.begin(SERIAL_BAUD);
    delay(200);
    Serial.println(F("ready"));
}

void loop() {
    if (!g_press_pending) return;

    // Confirm the button really is still down (filters fast bounces).
    if (digitalRead(kBtnPin) == LOW) {
        const bool now_on = !digitalRead(kLedPin);
        digitalWrite(kLedPin, now_on ? HIGH : LOW);
        Serial.print(F("toggle -> "));
        Serial.println(now_on ? F("on") : F("off"));
    }

    noInterrupts();
    g_press_pending = false;
    interrupts();
}
