# Module 05 — Bill of Materials

| Part                                  | Qty | Notes                                        |
| ------------------------------------- | --- | -------------------------------------------- |
| ESP32 dev board (WROOM-32D or similar) | 1  | 2.4 GHz Wi-Fi, USB cable                     |
| LED, 5 mm                             | 1   | only for Project 02                          |
| 220 Ω resistor                        | 1   | LED current limiter                          |
| Tactile push-button, 6 mm             | 1   | Project 02 only                              |
| Breadboard + jumper wires             | —   | optional                                     |
| 2.4 GHz Wi-Fi network                 | 1   | both ESP32 and laptop must be on it          |
| Laptop running the Axum server       | 1   | macOS / Linux / WSL — needs Rust toolchain   |

## Notes

- **WROOM-32D specifically**: this is the spec'd module on most generic
  "ESP32 DevKit V1" boards. If you have a different ESP32 variant
  (WROVER, S2, S3, C3), the same code should work — only the chip-info
  log line will differ.
- **No 5 GHz**: classic ESP32 (Xtensa) does not do Wi-Fi 5 GHz. If your
  home Wi-Fi is 5 GHz-only, set up a 2.4 GHz guest SSID on the router or
  use a 2.4 GHz hotspot from your phone.
- **No external pull-up needed** on the button — we use `INPUT_PULLUP`.
