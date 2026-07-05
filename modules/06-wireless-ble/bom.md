# Module 06 — Bill of Materials

| Part                                | Qty | Notes                                                 |
| ----------------------------------- | --- | ----------------------------------------------------- |
| ESP32 dev board (WROOM-32D)         | 1   | onboard LED on GPIO 2                                 |
| USB cable                           | 1   | for flashing + power                                  |
| Phone (iOS or Android)              | 1   | must support BLE (basically anything from the last decade) |

Optional if you want a larger, visible LED off the board:

| Part                    | Qty | Notes                          |
| ----------------------- | --- | ------------------------------ |
| LED, 5 mm               | 1   | any color                      |
| 220 Ω resistor          | 1   | current limiter                |
| Jumper wires            | 2   | GPIO 2 → LED → GND             |

The firmware always drives GPIO 2, so the onboard LED and any external
LED wired to GPIO 2 will move together.
