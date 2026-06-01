# Module 07 — ESP32 platform notes

This module's ESP32 work is split into two sub-projects sharing the
**same motor wiring and the same wire protocol**:

- [`../../projects/01-ble-control/platforms/esp32/`](../../projects/01-ble-control/platforms/esp32/) — custom BLE GATT service
- [`../../projects/02-wifi-websocket-control/platforms/esp32/`](../../projects/02-wifi-websocket-control/platforms/esp32/) — ESP32-hosted WebSocket server on port 81

Both:

- Use the Arduino-ESP32 framework (PlatformIO `platform = espressif32@^6`).
- Drive an L298N H-bridge with `ledc` PWM. See [`../docs/motor-driver.md`](../docs/motor-driver.md).
- Implement a **500 ms watchdog**: if no command arrives in that window, both motors go to 0.
- Parse `"<left>,<right>"` text frames; clamp to `[-255, 255]`.

## Why split firmware files instead of `#ifdef`-ing one binary?

Two reasons:

1. **Different library sets.** The BLE binary needs `BLEDevice.h` (~50 KB
   of flash); the WS binary needs `WebSocketsServer` and Wi-Fi (~120 KB).
   Compiling both in is wasted flash on a 4 MB chip.
2. **Readability.** A `main.cpp` that toggles between BLE and WS in the
   same file is harder to read than two ~120-line files that each tell
   one story end-to-end.

The shared motor code is small enough (~40 lines) that duplicating it is
cheaper than packaging it as a PIO library at this stage. If a third
firmware variant arrives, promote it to `lib/motor/` per project.

## See also

- [`docs/hardware/esp32.md`](../../../../docs/hardware/esp32.md) — full pinout, strapping pins, quirks.
- [`docs/conventions/cmake-style.md`](../../../../docs/conventions/cmake-style.md) — applies to native pico-sdk modules, not PlatformIO. Linked for completeness.
