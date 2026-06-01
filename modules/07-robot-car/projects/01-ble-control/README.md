# Project 01 — BLE Control

ESP32 advertises a custom BLE GATT service. The phone connects, writes
`"<left>,<right>"` text frames to a single characteristic, and the
firmware drives the motors.

## Identifiers

| Thing                 | Value                                          |
| --------------------- | ---------------------------------------------- |
| Advertised name       | `HOR-Car-BLE`                                  |
| Service UUID          | `12345678-1234-5678-1234-56789abcdef0`         |
| Command characteristic| `12345678-1234-5678-1234-56789abcdef1`         |
| Characteristic perms  | `WRITE` + `WRITE_NR` (write-without-response)  |

Write-without-response is preferred at runtime — it's lower-latency and
non-blocking on the central. The standard `WRITE` op is supported as a
fallback for tools that don't offer the no-response variant (e.g. nRF Connect).

## Files

```text
projects/01-ble-control/
├── README.md
└── platforms/
    └── esp32/
        ├── platformio.ini
        ├── src/main.cpp
        ├── scripts/flash.sh
        └── README.md
```

## Run

```bash
cd modules/07-robot-car/projects/01-ble-control/platforms/esp32
pio run --target upload
pio device monitor
```

Then in the app: Drive tab → Mode: **BLE** → Scan → tap `HOR-Car-BLE`.
See [`apps/robot-car-controller/README.md`](../../../../apps/robot-car-controller/README.md).

## BLE quirks worth knowing

- On iOS the device name doesn't always show; **filter on service UUID** instead.
- A BLE central can hold an exclusive connection. If your Mac auto-connects to the ESP32 (it shows up in Bluetooth settings) it will steal the phone's connection. Forget the device on every host except the phone.
- BLE has a small MTU (~23 B default, ~185 B negotiated). Our frames are <16 bytes so this is never a constraint, but if you extend the protocol, keep frames small.

## How it works

1. `setup()` registers a BLE server with one service and one characteristic.
2. A write callback parses `"<L>,<R>"` and updates two `volatile int` globals + a `g_last_cmd_ms` timestamp.
3. `loop()` reads the globals, drives the L298N, and zeros the motors if `millis() - g_last_cmd_ms > 500`.

The motor code is the same straight-line decoder used in the WiFi
variant — kept duplicated (40 lines) instead of factored out to avoid
introducing a custom PlatformIO library structure for the second project.
If a third firmware variant arrives, promote it.
