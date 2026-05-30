# Module 01 — Raspberry Pi Zero W

| Pin     | Role                                                |
| ------- | --------------------------------------------------- |
| GPIO 17 | LED output (physical pin 11)                        |
| GPIO 27 | button input with internal pull-up (physical pin 13)|

## Build & run

On the Pi:

```bash
uv sync --extra m01-rpi-zero-w
uv run python modules/01-digital-io/platforms/rpi-zero-w/src/main.py
```

## What you should see

```text
12:34:56 INFO  m01.rpi-zero-w: ready (button=GPIO27, led=GPIO17)
12:34:58 INFO  m01.rpi-zero-w: toggle -> on
12:34:59 INFO  m01.rpi-zero-w: toggle -> off
```

LED state flips on every confirmed press; bounces are filtered.

## Why polling, not interrupts?

`lgpio` does support edge callbacks, but polling at 200 Hz:

- Is dead-easy to unit-test (the debouncer is fed a stream of timestamps
  and raw values — see `tests/test_debounce.py`).
- Matches the Jetson variant exactly, so the two READMEs and codepaths
  read the same.
- Costs negligible CPU on a Pi (<0.1 %).

If you wanted nanosecond latency, you'd go interrupt-driven. For a human
finger you do not.

## Quirks

- The `hor_common.gpio.open_gpio("auto")` factory picks the `lgpio`
  backend when it's importable, otherwise falls back to `MockGpio` —
  meaning this same file runs on your laptop and just doesn't see any
  button presses.
