# Hands-On-Robotics

A **curriculum-led, hardware-modular** monorepo for learning robotics from
"blink an LED" to "autonomous driving" — across six hardware platforms and
three languages (C++, Python, Rust).

The repo is organized as a sequence of numbered learning **modules**.
Each module teaches one concept and ships an implementation for every
hardware platform that concept makes sense on. New developers walk the
ladder; experienced developers cherry-pick what their hardware supports.

```mermaid
flowchart LR
  A[00 getting-started] --> B[01 digital-io]
  B --> C[02 analog-and-pwm]
  C --> D[03 serial-uart]
  D --> E[04 i2c-spi]
  E --> F[05 wireless-wifi]
  E --> G[06 wireless-ble]
  G --> H[07 motors-and-drivers]
  H --> I[08 robot-car-kinematics]
  I --> J[09 sensors-and-fusion]
  J --> K[10 computer-vision]
  K --> L[11 lidar-and-slam]
  L --> M[12 ros2-integration]
  M --> N[13 autonomous-driving]
```

## Why this layout?

The most common mistake in robotics repos is **hardware-first** organization
(`Arduino/`, `ESP32/`, `RaspberryPi4/` at the top). It fragments concepts:
the same "blink the LED" lesson lives in three places with no narrative.

This repo is **concept-first**: each module is a lesson, and hardware
variants live inside it. A learner reads `modules/01-digital-io/README.md`
and chooses their board; a quick-reference user opens `docs/hardware/esp32.md`
and links out to the modules that target it.

## Curriculum

| #  | Module                                                                | Concepts                                              | Primary platforms                       |
| -- | --------------------------------------------------------------------- | ----------------------------------------------------- | --------------------------------------- |
| 00 | [getting-started](./modules/00-getting-started/)                      | Toolchain bootstrap, blink onboard LED + serial hello | **all six**                             |
| 01 | [digital-io](./modules/01-digital-io/)                                | LED + button, debouncing, polling vs interrupt        | Arduino, ESP32, Pico, RPi Zero W / 4, Jetson |
| 02 | analog-and-pwm                                                        | Servo sweep, LED fade, ADC reads                      | Arduino, ESP32, Pico, RPi 4             |
| 03 | serial-uart                                                           | printf debugging, host ↔ MCU protocol                 | Arduino, ESP32, Pico, RPi 4             |
| 04 | i2c-spi                                                               | OLED SSD1306, BME280, MPU6050                         | ESP32, Pico, RPi Zero W, RPi 4          |
| 05 | [wireless-wifi](./modules/05-wireless-wifi/)                          | HTTP client + Rust Axum server (two mini-projects)    | **ESP32** (others planned)              |
| 06 | wireless-ble                                                          | GATT LED service + [React Native Expo app](./apps/ble-led-controller/) | ESP32, RPi 4                            |
| 07 | motors-and-drivers                                                    | DC via L298N/TB6612, stepper, servo control           | Arduino, ESP32, Pico, RPi 4             |
| 08 | robot-car-kinematics                                                  | Differential drive, encoder odometry, PID             | ESP32, RPi 4                            |
| 09 | sensors-and-fusion                                                    | HC-SR04, IMU complementary/Kalman filter              | ESP32, RPi 4, Jetson                    |
| 10 | computer-vision                                                       | OpenCV (face detect, lane lines)                      | RPi 4, Jetson Nano                      |
| 11 | lidar-and-slam                                                        | RPLidar A1, 2D occupancy grid, ICP                    | RPi 4, Jetson Nano                      |
| 12 | ros2-integration                                                      | Nodes, topics, tf, rviz                               | RPi 4, Jetson Nano                      |
| 13 | autonomous-driving                                                    | Path planning, Nav2, perception + control fusion      | Jetson Nano, RPi 4                      |

Only modules 00 and 01 are implemented in the initial scaffold; the rest are
planned in [`docs/curriculum.md`](./docs/curriculum.md). Each new module is a
copy-paste-modify of the module 01 template.

## Hardware quickstart matrix

| Platform           | Language     | Build tool                       | Reference doc                                 |
| ------------------ | ------------ | -------------------------------- | --------------------------------------------- |
| Arduino Uno        | C++          | PlatformIO                       | [arduino-uno.md](./docs/hardware/arduino-uno.md) |
| ESP32              | C++ / Python | PlatformIO (later ESP-IDF)       | [esp32.md](./docs/hardware/esp32.md)          |
| Raspberry Pi Pico  | C++          | PlatformIO (or raw pico-sdk)     | [pico.md](./docs/hardware/pico.md)            |
| Raspberry Pi Zero W| Python / C++ | uv / native CMake                | [rpi-zero-w.md](./docs/hardware/rpi-zero-w.md) |
| Raspberry Pi 4 2GB | Python / C++ | uv / native CMake                | [rpi-4.md](./docs/hardware/rpi-4.md)          |
| Jetson Nano        | Python / C++ | uv / native CMake / CUDA toolkit | [jetson-nano.md](./docs/hardware/jetson-nano.md) |

## First-time setup

```bash
git clone https://github.com/Youngermaster/Hands-On-Robotics.git
cd Hands-On-Robotics
./scripts/host/bootstrap.sh        # installs uv, pre-commit, arduino-cli, pio
pre-commit install
uv sync                            # creates .venv with hor_common + dev tools
uv run pytest                      # green = workspace is healthy
```

Per-platform setup (run on the target board, not your laptop):

```bash
# Raspberry Pi Zero W / 4
./scripts/platform/rpi-setup.sh

# Jetson Nano
./scripts/platform/jetson-setup.sh
```

## Repo layout

```text
.
├── modules/                    # the curriculum (numbered, ordered)
│   ├── 00-getting-started/
│   └── 01-digital-io/
├── apps/                       # long-lived applications referenced by modules
│   └── ble-led-controller/     # React Native + Expo BLE companion
├── common/                     # shared libraries — used by 2+ modules
│   ├── python/hor_common/
│   ├── cpp/include/hor/
│   └── rust/                   # empty until first Rust module lands
├── docs/                       # reference material independent of any module
│   ├── curriculum.md
│   ├── hardware/               # one page per board
│   ├── toolchains/
│   └── conventions/            # module template, CMake style, Python style
├── scripts/                    # automation
│   ├── host/                   # runs on your laptop
│   ├── platform/               # runs on the target SBC
│   └── lib/common.sh           # shared sh utilities
└── .github/                    # CI workflows, PR template
```

Detailed layout & module template: [`docs/conventions/module-template.md`](./docs/conventions/module-template.md).

## Contributing

Read [`CONTRIBUTING.md`](./CONTRIBUTING.md). The short version:

1. Every module follows the same skeleton — copy `modules/01-digital-io/` and modify.
2. `common/` is for code used by **two or more** modules. Hardware-specific
   code lives in module folders, never in `common/`.
3. CMakeLists are teaching artifacts — comment them.
4. Run `pre-commit run --all-files` before pushing.

## License

MIT — see [LICENSE](./LICENSE).
