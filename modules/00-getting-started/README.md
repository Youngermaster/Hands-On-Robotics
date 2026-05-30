# Module 00 — Getting Started

## Goal

Prove your toolchain works on every board you own. Each platform variant
blinks the onboard LED and prints `hello, hands-on-robotics` over the
serial console once per second. No external wiring required.

If you can complete this module on a board, you can do every other module
on that board.

## Concepts

- Installing the host-side toolchain via `scripts/host/bootstrap.sh`.
- Compiling, flashing, and opening a serial monitor on each MCU/SBC.
- The minimum loop structure: `setup() → loop()` (MCU) or `main()` (SBC).

## Prerequisites

- Read [`README.md`](../../README.md) and run `./scripts/host/bootstrap.sh`.
- Have the board you want to target plugged in (USB for MCUs, SSH'd into for SBCs).

## Hardware Matrix

| Board               | Folder                                                                  | Onboard LED         | Notes                              |
| ------------------- | ----------------------------------------------------------------------- | ------------------- | ---------------------------------- |
| Arduino Uno         | [`platforms/arduino-uno`](./platforms/arduino-uno/)   | D13                 | classic AVR baseline               |
| ESP32 (DevKit V1)   | [`platforms/esp32`](./platforms/esp32/)               | GPIO 2              | also exercises Wi-Fi MAC log line  |
| Raspberry Pi Pico   | [`platforms/pico`](./platforms/pico/)                 | GPIO 25             | RP2040, UF2 flash                  |
| Raspberry Pi Zero W | [`platforms/rpi-zero-w`](./platforms/rpi-zero-w/)     | ACT LED + a wired LED on GPIO 17 | run on the Pi itself  |
| Raspberry Pi 4 (2GB)| [`platforms/rpi-4`](./platforms/rpi-4/)               | same as Zero W      | reuses Zero W code path            |
| Jetson Nano         [`platforms/jetson-nano`](./platforms/jetson-nano/) | wired LED on GPIO 18 | onboard LED isn't user-controllable |

## Bill of Materials

- For MCUs and the Jetson: only the board + USB cable. (The Jetson 40-pin
  header has no user-controllable onboard LED, so the SBC variants drive a
  small external LED on a GPIO for visible feedback — see [`bom.md`](./bom.md).)

## Wiring

MCU variants: no external wiring required (uses onboard LED + USB serial).

SBC variants: optional — wire a single LED + 220 Ω resistor between
GPIO 17 (Raspberry Pi) or GPIO 18 (Jetson) and ground. Identical wiring
to Module 01; see [`modules/01-digital-io/wiring/`](../01-digital-io/wiring/).

## Build & Run

### Microcontrollers (PlatformIO)

```bash
cd modules/00-getting-started/platforms/<board>
pio run --target upload          # compile + flash
pio device monitor               # open serial console
```

### Raspberry Pi (Zero W / 4)

On the Pi itself:

```bash
cd ~/Hands-On-Robotics
./scripts/platform/rpi-setup.sh   # only first time
uv run python modules/00-getting-started/platforms/rpi-zero-w/src/main.py
# (Pi 4 is identical — the rpi-4 README just points back here.)
```

### Jetson Nano

On the Jetson itself:

```bash
cd ~/Hands-On-Robotics
./scripts/platform/jetson-setup.sh   # only first time
uv run python modules/00-getting-started/platforms/jetson-nano/src/main.py
```

## Expected Behavior

- The onboard or wired LED blinks at 1 Hz (500 ms on, 500 ms off).
- The serial console prints `hello, hands-on-robotics` once per second.
- Pressing Ctrl-C on the SBC variants exits cleanly with the LED OFF.

## Common Pitfalls

- **Permission denied on `/dev/cu.usbmodem*` (macOS Sonoma+).** Allow
  Terminal in System Settings → Privacy & Security → Files and Folders.
- **PlatformIO can't find the board.** Run `pio device list`. If the board
  isn't there, install the USB-serial driver (CH340 for clone boards).
- **Pico doesn't enter bootloader.** Hold BOOTSEL while plugging in.
- **`Jetson.GPIO` permission error.** Add your user to the `gpio` group:
  `sudo usermod -aG gpio $USER` then log out / back in.
- **No serial output on RPi.** Bookworm disables UART by default — but the
  Python variant here prints to stdout over SSH, not UART. If you're
  watching `/dev/ttyAMA0`, you're in the wrong place; just look at the SSH
  terminal.

## Next Module

[Module 01 — Digital I/O](../01-digital-io/) — adds a button to control the LED.
