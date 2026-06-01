# Project 01 firmware — ESP32 BLE car

| Pin    | Role                |
| ------ | ------------------- |
| GPIO 22 | L298N ENA (right PWM) |
| GPIO 16 | L298N IN1            |
| GPIO 17 | L298N IN2            |
| GPIO 23 | L298N ENB (left PWM) |
| GPIO 18 | L298N IN3            |
| GPIO 19 | L298N IN4            |
| GND     | L298N GND + battery GND |

## Build & run

```bash
pio run --target upload
pio device monitor
```

You should see:

```text
[boot] hands-on-robotics m07/01 ble-control
[ble] advertising as HOR-Car-BLE
```

When the app connects:

```text
[ble] connected
```

When you drive (silent unless something goes wrong):

```text
[ble] bad frame: '...'   # only on parse errors
```

## Useful client tools for testing without the app

- **nRF Connect** (iOS / Android): scan, connect, write to the
  characteristic with the raw UTF-8 string `200,200`. Confirms the
  firmware works before you blame the app.
- **bluetoothctl** on Linux: `scan on`, `connect <MAC>`, `gatt-select-attribute …`, `gatt-write 0x32 0x30 0x30 0x2c 0x32 0x30 0x30`.

## Partition table

`board_build.partitions = huge_app.csv` is set in `platformio.ini`
because the BLE stack pushes the firmware close to the default 1.2 MB
partition. `huge_app.csv` raises it to 3 MB at the cost of OTA — we
don't do OTA here.
