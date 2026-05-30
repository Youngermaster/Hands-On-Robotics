# Module 00 — Arduino Uno

| Pin           | Role                       |
| ------------- | -------------------------- |
| `LED_BUILTIN` | onboard LED on D13         |
| D0/D1         | USB-serial (don't touch)   |

## Build & run

```bash
pio run --target upload
pio device monitor    # 9600 baud
```

Or use the wrapper:

```bash
./scripts/flash.sh
```

## What you should see

LED blinks at 1 Hz. Serial prints:

```text
hello, hands-on-robotics
tick
tick
tick
…
```

## Quirks

- Uno SRAM is 2 KB. We use `F("...")` macros to keep strings in flash.
- Auto-reset on serial open means messages printed in the first ~150 ms
  of `setup()` are usually lost — that's why we `delay(200)` before the
  greeting.
