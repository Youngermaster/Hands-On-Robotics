// Module 01 — Raspberry Pi Pico (RP2040)
// Press the button → toggle the LED. Interrupt-driven with software debounce.
//
// Pins:
//   GP 14 ── button ── GND   (input, pull-up)
//   GP 25 ── 220 Ω ── LED ── GND   (also the onboard LED — works either way)
//
// On Pico W, GP 25 is not directly drivable (LED is behind the CYW43 Wi-Fi
// chip). Use any free GPIO instead, or use the WiFi.h LED helpers.

#include <Arduino.h>

namespace {

constexpr uint8_t kBtnPin = 14;
constexpr uint8_t kLedPin = LED_BUILTIN;  // GP 25 on bare Pico
constexpr uint32_t kDebounceMs = 30;

volatile bool g_press_pending = false;
volatile uint32_t g_last_isr_ms = 0;

void on_button_press() {
    const uint32_t now = millis();
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
    const uint32_t deadline = millis() + 2000;
    while (!Serial && millis() < deadline) delay(10);
    Serial.println("ready");
}

void loop() {
    if (!g_press_pending) return;
    if (digitalRead(kBtnPin) == LOW) {
        const bool now_on = !digitalRead(kLedPin);
        digitalWrite(kLedPin, now_on ? HIGH : LOW);
        Serial.printf("toggle -> %s\n", now_on ? "on" : "off");
    }
    noInterrupts();
    g_press_pending = false;
    interrupts();
}
