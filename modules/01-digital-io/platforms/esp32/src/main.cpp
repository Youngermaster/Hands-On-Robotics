// Module 01 — ESP32
// Press the button → toggle the LED. Interrupt-driven with software debounce.
//
// Pins:
//   GPIO 4  ── button ── GND   (input, pull-up)
//   GPIO 2  ── 220 Ω ── LED ── GND
//
// Why GPIO 4 (not GPIO 0)? GPIO 0 is a strapping pin — pulling it LOW at
// boot puts the chip in download mode. Using it for a regular button works
// but causes "won't reboot after upload" surprises.

#include <Arduino.h>

namespace {

constexpr uint8_t kBtnPin = 4;
constexpr uint8_t kLedPin = 2;
constexpr uint32_t kDebounceMs = 30;

// `IRAM_ATTR` keeps the ISR in instruction RAM (faster, mandatory on ESP32).
volatile bool g_press_pending = false;
volatile uint32_t g_last_isr_ms = 0;

void IRAM_ATTR on_button_press() {
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
    delay(200);
    Serial.println("ready");
}

void loop() {
    if (!g_press_pending) {
        delay(1);
        return;
    }
    if (digitalRead(kBtnPin) == LOW) {
        const bool now_on = !digitalRead(kLedPin);
        digitalWrite(kLedPin, now_on ? HIGH : LOW);
        Serial.printf("toggle -> %s\n", now_on ? "on" : "off");
    }
    noInterrupts();
    g_press_pending = false;
    interrupts();
}
