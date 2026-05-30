# Curriculum

The curriculum is a single ladder. Each module is self-contained but
assumes you understood the previous one.

## Prerequisite graph

```mermaid
flowchart TD
  M00[00 getting-started]:::done --> M01[01 digital-io]:::done
  M01 --> M02[02 analog-and-pwm]
  M01 --> M03[03 serial-uart]
  M02 --> M04[04 i2c-spi]
  M03 --> M04
  M04 --> M05[05 wireless-wifi]
  M04 --> M06[06 wireless-ble]
  M02 --> M07[07 motors-and-drivers]
  M07 --> M08[08 robot-car-kinematics]
  M04 --> M09[09 sensors-and-fusion]
  M08 --> M09
  M09 --> M10[10 computer-vision]
  M10 --> M11[11 lidar-and-slam]
  M11 --> M12[12 ros2-integration]
  M12 --> M13[13 autonomous-driving]
  M06 -.uses.-> APP[apps/ble-led-controller]:::app

  classDef done fill:#0a7,stroke:#063,color:#fff
  classDef app fill:#06c,stroke:#024,color:#fff
```

Modules in green are implemented; the rest are planned.

## Status

| #  | Module                 | Status      | Folder                                                              |
| -- | ---------------------- | ----------- | ------------------------------------------------------------------- |
| 00 | getting-started        | implemented | [`modules/00-getting-started`](../modules/00-getting-started/)      |
| 01 | digital-io             | implemented | [`modules/01-digital-io`](../modules/01-digital-io/)                |
| 02 | analog-and-pwm         | planned     | —                                                                   |
| 03 | serial-uart            | planned     | —                                                                   |
| 04 | i2c-spi                | planned     | —                                                                   |
| 05 | wireless-wifi          | planned     | —                                                                   |
| 06 | wireless-ble           | planned     | — (companion app scaffolded in [`apps/ble-led-controller`](../apps/ble-led-controller/)) |
| 07 | motors-and-drivers     | planned     | —                                                                   |
| 08 | robot-car-kinematics   | planned     | —                                                                   |
| 09 | sensors-and-fusion     | planned     | —                                                                   |
| 10 | computer-vision        | planned     | — (will refactor face-detection code from the older Raspberry-Pi-Codes repo) |
| 11 | lidar-and-slam         | planned     | —                                                                   |
| 12 | ros2-integration       | planned     | —                                                                   |
| 13 | autonomous-driving     | planned     | —                                                                   |

## Module slots vs folders

The folder `modules/02-analog-and-pwm/` is **not** created until module 02 is
actually implemented. Reserving numbers in this table (without empty folders)
keeps the repo from looking abandoned.

## Adding a module

See [`CONTRIBUTING.md`](../CONTRIBUTING.md#adding-a-new-module).
