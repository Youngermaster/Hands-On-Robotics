# Module 00 — Raspberry Pi Zero W

Single Python script. Drives an LED on **GPIO 17** (BCM) — wire LED anode →
220 Ω → GPIO 17, LED cathode → GND.

## Build & run

On the Pi:

```bash
./scripts/platform/rpi-setup.sh        # only first time
uv run python modules/00-getting-started/platforms/rpi-zero-w/src/main.py
```

Or:

```bash
./modules/00-getting-started/platforms/rpi-zero-w/scripts/run.sh
```

## What you should see

```text
12:34:56 INFO  m00.rpi-zero-w: hello, hands-on-robotics
12:34:56 INFO  m00.rpi-zero-w: tick
12:34:57 INFO  m00.rpi-zero-w: tick
…
```

LED blinks at 1 Hz. Ctrl-C exits cleanly with the LED OFF.

## Quirks

- Uses `hor_common.gpio.open_gpio("auto")`. On the Pi, that resolves to
  the `lgpio` backend. On your laptop (no `lgpio` installed), it falls
  back to `MockGpio` so you can dry-run without crashing.
- BCM pin numbering. GPIO 17 is **physical pin 11** on the 40-pin header.
