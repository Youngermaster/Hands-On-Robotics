# Module 01 — Arduino Uno

| Pin | Role                            |
| --- | ------------------------------- |
| D2  | button input (INT0, pull-up)    |
| D13 | LED output (`LED_BUILTIN` too)  |

Why D2: Uno only has hardware external interrupts on D2 (INT0) and D3 (INT1).
We use INT0 here.

## Build & run

```bash
pio run --target upload
pio device monitor
```

Wire as in [`../../wiring/mcu.svg`](../../wiring/mcu.svg):

- LED: D13 → 220 Ω → LED anode (longer leg) → LED cathode → GND.
- Button: D2 → button → GND. (No external pull-up; the code uses `INPUT_PULLUP`.)

## What you should see

```text
ready
toggle -> on
toggle -> off
toggle -> on
```

One log line per press; LED state flips on each.

## How it works

1. `attachInterrupt(... FALLING)` registers `on_button_press` to fire when
   the input goes HIGH → LOW (button pressed).
2. The ISR sets a `volatile bool` flag — keeps the ISR itself tiny.
3. `loop()` notices the flag, re-reads the pin to confirm it's still LOW
   (filters fast bounces), toggles the LED, and clears the flag.
4. The `kDebounceMs` check inside the ISR catches contact-bounce edges
   that fire dozens of times in quick succession.
