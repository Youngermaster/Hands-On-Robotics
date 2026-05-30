# Module 01 — Raspberry Pi Pico

| Pin   | Role                              |
| ----- | --------------------------------- |
| GP 14 | button input (pull-up enabled)    |
| GP 25 | LED output (`LED_BUILTIN`)        |

## Build & run

```bash
pio run --target upload   # hold BOOTSEL while plugging in first time
pio device monitor
```

## What you should see

```text
ready
toggle -> on
toggle -> off
```

## Pico W note

GPIO 25 on the **Pico W** is wired through the CYW43 Wi-Fi chip, so
`digitalWrite(25, HIGH)` won't drive an external LED on that board.
Either pick a free GPIO for your external LED (e.g. GP 16) or use the
arduino-pico `LED_BUILTIN` helper which goes through the Wi-Fi driver.

## How it works

Same shape as the Arduino/ESP32 — the Pico has plenty of interrupt-capable
pins, so GPIO 14 is purely a convenience choice.
