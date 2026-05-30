# Module 00 — Jetson Nano

Drives an LED on **GPIO 18** (BCM numbering). The Nano has no
user-controllable onboard LED, so external wiring is required.

## Wiring

```
GPIO 18 ──[ 220 Ω ]── LED ──┐
                            │
                           GND
```

## Build & run

On the Jetson:

```bash
./scripts/platform/jetson-setup.sh         # only first time
uv run python modules/00-getting-started/platforms/jetson-nano/src/main.py
```

## What you should see

```text
12:34:56 INFO  m00.jetson-nano: hello, hands-on-robotics
12:34:56 INFO  m00.jetson-nano: tick
…
```

LED blinks at 1 Hz; Ctrl-C exits cleanly.

## Quirks

- `hor_common.gpio.open_gpio("auto")` picks the `JetsonGpio` backend on
  this board (via `Jetson.GPIO`).
- BCM numbering. GPIO 18 is **physical pin 12** on the 40-pin header.
- If you get `Permission denied`: `sudo usermod -aG gpio $USER`, then log out / back in.
