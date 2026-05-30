# Module 00 — Raspberry Pi Pico

| Pin   | Role                                       |
| ----- | ------------------------------------------ |
| GP 25 | onboard LED (`LED_BUILTIN`)                |
| USB   | CDC serial — no extra UART pins needed     |

## Build & run

First time only: hold **BOOTSEL** while plugging in the Pico so it appears
as a USB drive.

```bash
pio run --target upload
pio device monitor    # 115200 baud
```

## What you should see

```text
hello, hands-on-robotics
tick
tick
…
```

## Quirks

- After the first flash, PlatformIO uses the picotool path — you no longer
  need to hold BOOTSEL.
- Pico **W** uses a different pin for the LED (it's wired through the CYW43
  Wi-Fi chip). For the W, replace `kLedPin = LED_BUILTIN;` with
  `kLedPin = 25; /* WL_GPIO0 is not directly drivable */` — module 01
  shows the Pico W variant.
