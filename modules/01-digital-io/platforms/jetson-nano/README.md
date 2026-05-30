# Module 01 — Jetson Nano

| Pin     | Role                                  |
| ------- | ------------------------------------- |
| GPIO 18 | LED output (physical pin 12)          |
| GPIO 23 | button input, internal pull-up (physical pin 16) |

## Build & run

On the Jetson:

```bash
uv sync --extra m01-jetson-nano
uv run python modules/01-digital-io/platforms/jetson-nano/src/main.py
```

## What you should see

```text
12:34:56 INFO  m01.jetson-nano: ready (button=GPIO23, led=GPIO18)
12:34:58 INFO  m01.jetson-nano: toggle -> on
```

## Quirks

- Internal pull-ups on the Nano go through `Jetson.GPIO` and require the
  pin to be **configured as input** before pull-up is set — already handled
  by `hor_common.gpio.JetsonGpio.setup_input`.
- If you see "Permission denied": `sudo usermod -aG gpio $USER` and log
  out / back in.
- The Nano's 40-pin header maps differently to BCM than the Pi — always
  consult the [Nano pinout](https://www.jetsonhacks.com/nvidia-jetson-nano-j41-header-pinout/).
