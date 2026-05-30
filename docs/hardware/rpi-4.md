# Raspberry Pi 4 (2 GB)

Quad-core ARMv8 SBC. The main "robot brain" target — runs OpenCV at usable
frame rates, supports ROS2 Humble, has Wi-Fi + BLE + Gigabit Ethernet.

## At a glance

| Spec         | Value                                                   |
| ------------ | ------------------------------------------------------- |
| SoC          | Broadcom BCM2711 (quad Cortex-A72, ARMv8 64-bit)        |
| Clock        | 1.5 GHz (1.8 GHz on later revisions)                    |
| RAM          | 2 GB LPDDR4 (this repo targets the 2 GB model)          |
| Wireless     | 2.4/5 GHz Wi-Fi + Bluetooth 5.0 / BLE                   |
| Ethernet     | Gigabit                                                 |
| USB          | 2× USB 3.0 + 2× USB 2.0                                 |
| Video        | 2× micro-HDMI (4K)                                      |
| GPIO         | same 40-pin header as Zero W (pinout below)             |

## Pinout

Identical 40-pin header to the [Pi Zero W](./rpi-zero-w.md#pinout-40-pin-gpio-header-bcm-numbering).

## OS install

1. Flash **Raspberry Pi OS Bookworm (64-bit)** with
   [Raspberry Pi Imager](https://www.raspberrypi.com/software/).
2. Imager advanced options: hostname, SSH, Wi-Fi, user.
3. After boot:

```bash
./scripts/platform/rpi-setup.sh   # enables I2C/SPI, installs uv, lgpio, ffmpeg
```

For ROS2 modules later, you'll also run `./scripts/platform/ros2-install.sh`.

## GPIO from Python

Same `lgpio` / `hor_common.gpio` setup as the Zero W — code is identical
between the two boards. The module 01 RPi 4 README just links back to the
Zero W implementation.

## When to pick this board

- **OpenCV** (modules 10–13).
- **ROS2** (modules 12+).
- **LiDAR** (module 11) — needs USB-3 bandwidth for some scanners.
- Anything Wi-Fi-heavy or that wants Ethernet.

When you don't:

- Battery-powered tiny robot → Pico or ESP32.
- Pure GPIO + Wi-Fi → Zero W (cheaper, less power).

## Quirks

- **Power**: needs a 5 V / 3 A USB-C supply. Under-powered Pi 4s reboot
  randomly under camera + Wi-Fi load.
- **Heat**: pegs the CPU during ML inference → throttles. Add a heatsink
  or active cooler before module 10.
- **64-bit OS**: use Bookworm 64-bit. ROS2 Humble requires it.
- **PoE HAT** is available if you want one-wire deployment.

## Modules that target this board

- [00 getting-started](../../modules/00-getting-started/platforms/rpi-4/)
- [01 digital-io](../../modules/01-digital-io/platforms/rpi-4/)
- Planned: 02–13 (this is the main SBC for the rest of the curriculum)
