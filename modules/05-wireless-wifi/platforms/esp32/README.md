# Module 05 — ESP32 platform notes

This module's ESP32 work is split into two sub-projects:

- [`../../projects/01-telemetry-uplink/platforms/esp32/`](../../projects/01-telemetry-uplink/platforms/esp32/) — fire-and-forget POST
- [`../../projects/02-bidirectional-control/platforms/esp32/`](../../projects/02-bidirectional-control/platforms/esp32/) — button POST + LED poll

Both firmwares share:

- **Framework**: Arduino-ESP32 via PlatformIO (`platformio.ini` per project).
- **Wi-Fi stack**: stock `WiFi.h` and `HTTPClient.h` from Arduino-ESP32.
- **JSON**: `bblanchon/ArduinoJson@^7` pinned in `platformio.ini`.
- **Secrets**: each firmware has a `src/secrets.h.example` that you copy
  to `src/secrets.h` and fill in. `secrets.h` is git-ignored.

## Why Arduino-ESP32 and not ESP-IDF?

This module is a beginner Wi-Fi lesson. The Arduino-ESP32 framework gives
you a working HTTP client in three lines. ESP-IDF is more powerful but
adds 100+ lines of `esp_http_client_*` boilerplate for the same goal.
Module 06 (BLE) sticks with Arduino-ESP32 for the same reason; Module 09+
may introduce ESP-IDF where the extra control is worth it.

## Pin reference for this module

| Pin     | Role                                |
| ------- | ----------------------------------- |
| GPIO 2  | onboard LED (Project 02)            |
| GPIO 4  | button input, INPUT_PULLUP (Project 02) |
| GND     | button return + LED cathode         |

Same wiring as [Module 01](../../../01-digital-io/wiring/mcu.svg) — if
that worked, this will too.

## See also

- [`docs/hardware/esp32.md`](../../../../docs/hardware/esp32.md) — full pinout, quirks, strapping pins.
