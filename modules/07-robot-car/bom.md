# Module 07 — Bill of Materials

| Part                                          | Qty | Notes                                                     |
| --------------------------------------------- | --- | --------------------------------------------------------- |
| ESP32 dev board (WROOM-32D)                   | 1   | same one used in Modules 00, 01, 05                       |
| 2WD or 4WD robot chassis                      | 1   | "smart car chassis" kit — yellow gear motors + wheels     |
| Yellow DC gear motor (TT-style, 3–6 V, 1:48)  | 2   | typically pre-mounted on the chassis                      |
| L298N H-bridge motor driver module            | 1   | red breakout w/ heatsink                                  |
| 18650 battery holder (2× cell, series, 7.4 V) | 1   | or any 6–12 V pack with >1 A continuous                   |
| 18650 cells, protected                        | 2   | mid-grade like Samsung 30Q is fine                        |
| Toggle switch (for battery)                   | 1   | optional but recommended                                  |
| Jumper wires (M-M and M-F)                    | 10+ | ESP32 ↔ L298N + power                                     |
| USB cable for ESP32                           | 1   | for flashing + initial monitoring                         |
| Phone running iOS or Android                  | 1   | must support BLE (basically anything from the last decade) |

## Power notes

- **Do not** power the L298N motor side from the ESP32's USB 5 V. Motors stall and you'll brown out the chip.
- The L298N's onboard 5 V regulator can power the ESP32 if you bridge `+5V` to ESP32 `5V`/`VIN`. Cleaner is to keep USB connected during testing and switch to battery once it works.
- 2× 18650s in series gives ~7.4 V — sweet spot for these motors. A single LiPo 2S (also 7.4 V nominal) works identically.

## Why these motors?

The "yellow TT" gear motors are the standard for hobby robot cars. They
draw ~200 mA per motor unloaded, ~1 A stall. The L298N can sink that
comfortably (~2 A per channel).
