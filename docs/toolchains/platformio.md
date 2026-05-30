# PlatformIO

PlatformIO is the canonical build tool for **Arduino Uno**, **ESP32**, and
**Raspberry Pi Pico** in this repo. One CLI (`pio`) targets all three with
pinned library versions and reproducible builds.

## Why PlatformIO and not the Arduino IDE?

- **Lockfile-style dependency pinning** in `platformio.ini`.
- **One CLI** for compile + upload + serial monitor + test.
- **CI-friendly** — installable via `pip` / `pipx` with no GUI.
- **Multi-platform** — same workflow for AVR, ESP32, and RP2040.

Trade-off: heavier first install than the Arduino IDE. Mitigated by
`scripts/host/bootstrap.sh`.

## Install

`scripts/host/bootstrap.sh` does it for you. Manually:

```bash
pipx install platformio   # preferred
# or
pip install --user platformio
```

Verify:

```bash
pio --version
```

## Per-module structure

Each MCU platform variant has its own `platformio.ini`:

```text
modules/NN-name/platforms/<board>/
├── platformio.ini
├── src/
│   └── main.cpp
└── scripts/flash.sh
```

## `platformio.ini` conventions

```ini
; What this file does:
;   - Targets one board.
;   - Pins every library to an explicit version.
;   - Sets compile flags once, here, not in code.

[platformio]
default_envs = uno   ; Single env per file — keep variants in sibling folders.

[env:uno]
platform           = atmelavr@^4.2.0   ; Pin major+minor; ^ allows patch updates.
board              = uno
framework          = arduino
upload_speed       = 115200
monitor_speed      = 9600
build_flags        =
  -Wall -Wextra -Wpedantic
  -DSERIAL_BAUD=9600
lib_deps           =
  ; Add libraries here with explicit versions:
  ; bblanchon/ArduinoJson @ ^7.0.0
```

## Common commands

```bash
cd modules/01-digital-io/platforms/arduino-uno

pio run                       # compile
pio run --target upload       # compile + flash
pio device monitor            # open serial monitor
pio device list               # see attached boards
pio run --target clean        # remove build artifacts
```

A short wrapper lives at `scripts/flash.sh` inside each platform folder.

## Per-board tips

- **Arduino Uno** — auto-detected on macOS as `/dev/cu.usbmodem*`. If
  `pio` doesn't find it, install the CH340 driver (clone boards) or just
  pass `--upload-port`.
- **ESP32** — first-time upload sometimes needs holding the BOOT button.
  Add `upload_resetmethod = ck` to `[env:esp32]` if your board doesn't
  auto-reset.
- **Pico** — flashes via UF2 (the Pico mounts as a USB drive). PlatformIO
  handles this; just plug the Pico in **while holding BOOTSEL** the first time.

## CI

`.github/workflows/build.yml` runs `pio run` in a matrix across the three
MCU targets. PlatformIO's GitHub action caches `~/.platformio` between runs.
