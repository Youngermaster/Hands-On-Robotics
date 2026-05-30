# Raspberry Pi Pico (RP2040)

Dual-core Arm Cortex-M0+ @ 133 MHz. 26 multifunction GPIO. Flashed via UF2
(drag-and-drop bootloader). The cheap, easy entry point for serious MCU
work.

## At a glance

| Spec            | Value                                  |
| --------------- | -------------------------------------- |
| MCU             | RP2040 (dual-core Cortex-M0+)          |
| Clock           | 133 MHz                                |
| Flash / SRAM    | 2 MB / 264 KB                          |
| GPIO            | 26                                     |
| PIO             | 2 blocks × 4 state machines            |
| ADC             | 12-bit, 4 channels (+ temperature)     |
| Logic level     | 3.3 V                                  |
| Onboard LED     | GPIO 25 (Pico) / WL_GPIO0 (Pico W)     |

## Pinout

```
                Raspberry Pi Pico
              +-------------------+
       GP0 ---| 1 UART0 TX   VBUS |--- 40 +5V (USB)
       GP1 ---| 2 UART0 RX   VSYS |--- 39 +1.8-5.5V supply
       GND ---| 3            GND  |--- 38
       GP2 ---| 4            3V3EN|--- 37
       GP3 ---| 5            3V3  |--- 36 +3.3V out
       GP4 ---| 6 I2C0 SDA   ADC_VREF|- 35
       GP5 ---| 7 I2C0 SCL   GP28 |--- 34 ADC2
       GND ---| 8            GND  |--- 33
       GP6 ---| 9            GP27 |--- 32 ADC1
       GP7 ---|10            GP26 |--- 31 ADC0
       GP8 ---|11            RUN  |--- 30
       GP9 ---|12            GP22 |--- 29
       GND ---|13            GND  |--- 28
       GP10---|14            GP21 |--- 27 I2C0 SCL
       GP11---|15            GP20 |--- 26 I2C0 SDA
       GP12---|16            GP19 |--- 25 SPI0 MOSI
       GP13---|17            GP18 |--- 24 SPI0 SCK
       GND ---|18            GND  |--- 23
       GP14---|19            GP17 |--- 22
       GP15---|20            GP16 |--- 21
              +-------------------+
                     USB-B
```

## Build & flash

PlatformIO (canonical, uses Wizio-Pico / arduino-pico under the hood):

```bash
cd modules/00-getting-started/platforms/pico
pio run --target upload    # PlatformIO copies the .uf2 to the Pico drive
pio device monitor         # USB-CDC serial
```

Manual UF2 flash:

1. Hold **BOOTSEL** and plug in the Pico → it mounts as `RPI-RP2`.
2. Drag `.pio/build/pico/firmware.uf2` onto it.
3. The Pico reboots into the new firmware automatically.

## Quirks

- **No reset button** on the bare Pico — unplug + replug to reset, or hold
  BOOTSEL while plugging in to re-enter bootloader mode.
- **GPIO 23/24/29** are wired internally on Pico W (Wi-Fi). Avoid on Pico W.
- **PIO** (Programmable I/O) is a superpower — covered in module 04 (SPI/I2C)
  and module 11 (LiDAR pulse capture). Worth knowing it exists from day one.
- **Logic is 3.3 V only.** Use level shifters for 5 V peripherals.

## Modules that target this board

- [00 getting-started](../../modules/00-getting-started/platforms/pico/)
- [01 digital-io](../../modules/01-digital-io/platforms/pico/)
- Planned: 02 analog-and-pwm, 03 serial-uart, 04 i2c-spi, 07 motors-and-drivers
