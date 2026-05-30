# Module 01 — Bill of Materials

| Part                                   | Qty | Notes                                    |
| -------------------------------------- | --- | ---------------------------------------- |
| LED, 5 mm (any color)                  | 1   | red / green / yellow work the same       |
| Resistor, 220 Ω (or 330 Ω)             | 1   | current limiter for the LED              |
| Tactile push-button, 6 mm              | 1   | the 4-pin breadboard-friendly kind       |
| Breadboard, half-size                  | 1   | optional but recommended                 |
| Jumper wires (M-M for MCUs, F-M for RPi/Jetson) | 4 | board → breadboard               |
| Target board + USB cable               | 1   | see per-platform README                  |

## Why these values?

- **220 Ω with a 3.3 V or 5 V supply** gives ~9–15 mA through a standard
  red LED — well below the 20 mA absolute max.
- **Tactile buttons** (the small "click" type) bounce for 5–20 ms on
  press and release; our debounce filter assumes that range.

## Where to buy

Generic kits like "Elegoo Super Starter" or "Sunfounder Raphael" include
everything in this BoM. Avoid kits with tiny SMD components — those are
hard to wire reliably on a breadboard.
