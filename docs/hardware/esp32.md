# ESP32 (generic dev board)

Dual-core Xtensa LX6 @ 240 MHz with Wi-Fi + Bluetooth Classic/BLE. The
workhorse of wireless modules.

## At a glance

| Spec            | Value                                       |
| --------------- | ------------------------------------------- |
| MCU             | ESP32 (Xtensa LX6, dual core)               |
| Clock           | up to 240 MHz                               |
| Flash / SRAM    | typ. 4 MB / 520 KB                          |
| GPIO            | 34 usable (with caveats — see below)        |
| ADC             | 12-bit, 18 channels (ADC1 + ADC2)           |
| Wireless        | Wi-Fi 802.11 b/g/n + Bluetooth 4.2 / BLE    |
| Logic level     | 3.3 V                                       |
| Onboard LED     | usually GPIO 2 (board-dependent)            |

## Pinout (DOIT ESP32-DevKit V1, 30-pin)

```
                            ESP32 DevKit V1
                +-------------------------------------+
   EN (RST)  ---| EN                            GPIO23|--- VSPI MOSI
   GPIO36 ADC --| VP                            GPIO22|--- I2C SCL
   GPIO39 ADC --| VN                            TXD0  |--- USB TX
   GPIO34 IN  --| 34                            RXD0  |--- USB RX
   GPIO35 IN  --| 35                            GPIO21|--- I2C SDA
   GPIO32     --| 32                            GPIO19|--- VSPI MISO
   GPIO33     --| 33                            GPIO18|--- VSPI SCK
   GPIO25 DAC --| 25                            GPIO5 |--- VSPI CS
   GPIO26 DAC --| 26                            GPIO17|--- TXD2
   GPIO27     --| 27                            GPIO16|--- RXD2
   GPIO14     --| 14                            GPIO4 |
   GPIO12     --| 12                            GPIO0 |--- BOOT button
   GND        --| GND                           GPIO2 |--- onboard LED
   GPIO13     --| 13                            GPIO15|
   GPIO9  FLASH-| D2/SD2     (FLASH PINS)       GPIO8 |--- FLASH
   GPIO10 FLASH-| D3/SD3                        GPIO7 |--- FLASH
   GPIO11 FLASH-| CMD/SD_CMD                    GPIO6 |--- FLASH
                +-------------------------------------+
                              USB-C / micro-USB
```

## Build & flash

PlatformIO (canonical):

```bash
cd modules/00-getting-started/platforms/esp32
pio run --target upload
pio device monitor      # 115200 baud
```

If upload fails: hold **BOOT**, tap **EN/RST**, release **BOOT** when
PlatformIO says "Connecting…". Some boards need this every time.

## Quirks (read before wiring)

- **GPIO 6–11 are wired to onboard flash.** Never use them as I/O.
- **GPIO 34–39 are input-only.** No pull-ups/downs, no `digitalWrite`.
- **GPIO 0** controls boot mode — pull LOW at reset to flash. Don't pull it
  LOW from your circuit unintentionally.
- **ADC2** is unusable when Wi-Fi is active (Wi-Fi grabs ADC2). Use ADC1
  (`GPIO32–39`) for analog reads in wireless modules.
- **Strapping pins**: GPIO 0, 2, 5, 12, 15 — these decide boot mode if
  driven at startup. Best to leave floating until after boot.

## Modules that target this board

- [00 getting-started](../../modules/00-getting-started/platforms/esp32/)
- [01 digital-io](../../modules/01-digital-io/platforms/esp32/)
- Planned: 02–09 (this is the main embedded platform for the rest of the curriculum)
