# Module 01 — ESP32

| Pin    | Role                              |
| ------ | --------------------------------- |
| GPIO 4 | button input (pull-up enabled)    |
| GPIO 2 | LED output (onboard LED too)      |

## Build & run

```bash
pio run --target upload
pio device monitor    # 115200 baud
```

Hold **BOOT** during the connect phase if upload fails.

## What you should see

```text
ready
toggle -> on
toggle -> off
```

LED state flips on every press.

## How it works

Same pattern as the Arduino, with ESP32-specific tweaks:

- `IRAM_ATTR` on the ISR — required so the handler resides in IRAM (the
  ESP32 flash isn't always memory-mapped during ISRs).
- 32-bit `millis()` (vs Arduino's `unsigned long`, which on AVR is also
  32-bit but only because `unsigned long` happens to be 32-bit there).
- We `delay(1)` in `loop()` when idle so other tasks (Wi-Fi later) get a
  chance to run. On a bare-metal AVR this isn't needed.
