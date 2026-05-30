# Raspberry Pi Zero W

ARMv6 single-core Linux SBC with Wi-Fi + Bluetooth. Low power, tiny form
factor. Great for headless GPIO + small Python services. Not powerful
enough for OpenCV-heavy or ROS2 work — use the RPi 4 or Jetson for those.

## At a glance

| Spec            | Value                                      |
| --------------- | ------------------------------------------ |
| SoC             | Broadcom BCM2835 (single core, ARMv6)      |
| Clock           | 1 GHz                                      |
| RAM             | 512 MB                                     |
| Wireless        | 2.4 GHz Wi-Fi + Bluetooth 4.1 / BLE        |
| GPIO            | 40-pin header (28 usable GPIO)             |
| OS              | Raspberry Pi OS Bookworm (32-bit)          |

## Pinout (40-pin GPIO header, BCM numbering)

```
        3V3  (1) (2)  5V
   SDA1 GPIO2 (3) (4)  5V
   SCL1 GPIO3 (5) (6)  GND
        GPIO4 (7) (8)  GPIO14  TXD
          GND (9) (10) GPIO15  RXD
       GPIO17 (11)(12) GPIO18  PWM
       GPIO27 (13)(14) GND
       GPIO22 (15)(16) GPIO23
        3V3  (17)(18) GPIO24
   MOSI GPIO10(19)(20) GND
   MISO GPIO9 (21)(22) GPIO25
   SCLK GPIO11(23)(24) GPIO8   CE0
          GND(25)(26) GPIO7   CE1
   ID_SD GPIO0(27)(28) GPIO1   ID_SC
       GPIO5 (29)(30) GND
       GPIO6 (31)(32) GPIO12
       GPIO13(33)(34) GND
       GPIO19(35)(36) GPIO16
       GPIO26(37)(38) GPIO20
          GND(39)(40) GPIO21
```

## OS install

1. Flash **Raspberry Pi OS Lite (32-bit, Bookworm)** with
   [Raspberry Pi Imager](https://www.raspberrypi.com/software/).
2. In Imager's advanced options: set hostname, enable SSH, configure Wi-Fi,
   create user. This is way faster than headless `wpa_supplicant.conf` hacks.
3. First boot: `ssh user@hostname.local`. Then:

```bash
./scripts/platform/rpi-setup.sh   # enables I2C/SPI, installs uv, lgpio
```

## GPIO from Python

Use [lgpio](https://abyz.me.uk/lg/py_lgpio.html) (the official replacement
for `RPi.GPIO`, works without root on Bookworm).

```python
import lgpio

chip = lgpio.gpiochip_open(0)
lgpio.gpio_claim_output(chip, 17)
lgpio.gpio_write(chip, 17, 1)
```

In this repo, prefer `hor_common.gpio` which wraps `lgpio` and provides a
mock backend so you can develop on macOS.

## Quirks

- **Single core, ARMv6**. NumPy compiles, but anything heavier (PyTorch,
  ROS2) won't run well. Use the Pi 4 or Jetson for those modules.
- **Wi-Fi is 2.4 GHz only.**
- **No hardware video encoding.** Camera modules technically work but
  bandwidth is limited.
- **Power**: a flaky USB power supply is the #1 cause of weird crashes.
  Use a 2.5 A supply.

## Modules that target this board

- [00 getting-started](../../modules/00-getting-started/platforms/rpi-zero-w/)
- [01 digital-io](../../modules/01-digital-io/platforms/rpi-zero-w/)
- Planned: 04 i2c-spi, 05 wireless-wifi
