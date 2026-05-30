# Module 00 — ESP32

| Pin      | Role                                            |
| -------- | ----------------------------------------------- |
| GPIO 2   | onboard LED (varies by board — confirm yours)   |
| GPIO 1/3 | USB-serial (don't touch)                        |

## Build & run

```bash
pio run --target upload
pio device monitor    # 115200 baud
```

If upload fails: hold **BOOT** while PlatformIO connects.

## What you should see

```text
hello, hands-on-robotics
chip: ESP32-D0WD-V3 rev 3, 2 cores @ 240 MHz
tick
tick
…
```

## Quirks

- Onboard LED pin varies by board. If GPIO 2 doesn't blink, check your
  board's silkscreen / datasheet. WROOM-32U dev boards often use GPIO 5.
- USB-CDC: serial output appears as `/dev/cu.SLAB_USBtoUART` (CP2102) or
  `/dev/cu.usbserial-*` (CH340).
