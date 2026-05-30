# Arduino Uno (R3)

8-bit ATmega328P @ 16 MHz, 32 KB flash, 2 KB SRAM. The reference platform
for "first microcontroller" work in this repo.

## At a glance

| Spec               | Value                       |
| ------------------ | --------------------------- |
| MCU                | ATmega328P (AVR, 8-bit)     |
| Clock              | 16 MHz                      |
| Flash / SRAM       | 32 KB / 2 KB                |
| Digital pins       | 14 (6 PWM)                  |
| Analog inputs      | 6 (10-bit ADC)              |
| Logic level        | 5 V                         |
| Onboard LED        | D13 (`LED_BUILTIN`)         |
| USB-to-serial      | ATmega16U2                  |

## Pinout (Quick reference)

```
                +-----+
   RESET  -----| 1   |----- +5V (logic & low-current peripherals)
   RX0/D0 -----| 2   |
   TX1/D1 -----| 3   |
   D2     -----| 4   |  <-- external interrupt INT0
   D3 PWM -----| 5   |  <-- external interrupt INT1
   D4     -----| 6   |
   D5 PWM -----| 7   |
   D6 PWM -----| 8   |
   D7     -----| 9   |
   D8     -----|10   |
   D9 PWM -----|11   |
   D10 PWM/SS -|12   |
   D11 PWM/MOSI|13   |
   D12 MISO ---|14   |
   D13 SCK ----|15   |  <-- onboard LED
   GND    -----|16   |
                +-----+
```

Full image: https://docs.arduino.cc/static/2c6c5b3b5d5dc1a7d1e8a4f6e1a3a4f3/pinout-UNO.png

## Build & flash

PlatformIO (canonical):

```bash
cd modules/00-getting-started/platforms/arduino-uno
pio run --target upload
pio device monitor      # 9600 baud unless overridden
```

The board appears on macOS as `/dev/cu.usbmodem*` or `/dev/cu.wchusbserial*`
(clone boards need the CH340 driver: https://github.com/WCHSoftGroup/ch34xser_macos).

## Quirks

- **Only D2 and D3** support hardware external interrupts (`attachInterrupt`).
- **Serial uses D0/D1** — never wire other things there if you're using `Serial`.
- **SRAM is 2 KB**. `String` concatenation will eat it. Prefer `char[]` + `snprintf`.
- The on-board regulator can deliver ~500 mA total on 5 V. For motors and servos,
  use an external supply with a common ground.

## Modules that target this board

- [00 getting-started](../../modules/00-getting-started/platforms/arduino-uno/)
- [01 digital-io](../../modules/01-digital-io/platforms/arduino-uno/)
- Planned: 02 analog-and-pwm, 03 serial-uart, 07 motors-and-drivers
