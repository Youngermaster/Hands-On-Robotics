# Module 06 firmware — ESP32 BLE LED

| Pin    | Role                    |
| ------ | ----------------------- |
| GPIO 2 | onboard LED (active-HIGH) |

No external wiring required. If you want a larger, visible LED, wire one
from GPIO 2 → 220 Ω → LED anode → LED cathode → GND. The onboard LED and
the external LED will move together.

## Build & run

```bash
pio run --target upload
pio device monitor
```

Successful boot:

```text
[boot] hands-on-robotics m06 wireless-ble
[ble] advertising as HOR-LED-BLE
```

When the app connects and taps a mode:

```text
[ble] connected
[ble] mode -> slow
```

## Useful for testing without the app

**nRF Connect** (iOS / Android): scan → connect to `HOR-LED-BLE` → open
the service `9a70b2e0-…-0001` → write a single byte to characteristic
`…-0002`:

| Byte | Effect        |
| ---- | ------------- |
| `00` | LED off       |
| `01` | LED solid on  |
| `02` | slow blink    |
| `03` | fast blink    |

Subscribe to characteristic `…-0003` (NOTIFY) to watch the confirmed
state come back.

## Design notes

- **Non-blocking blinker.** The main loop uses `millis()` comparison
  instead of `delay(500)` so the BLE stack keeps running smoothly. A
  delay-based blinker would stall connection handling for hundreds of ms.
- **State-owning firmware.** The phone only sets the *desired* mode; the
  firmware owns the timing. That means the LED keeps behaving correctly
  even if the phone disconnects — this is the right pattern for
  "settings" but the wrong one for "live teleop" (compare Module 07's
  watchdog approach).
- **`huge_app.csv` partition.** BLE + Arduino framework overshoots the
  default 1.2 MB app partition on some builds; `huge_app.csv` raises it
  to 3 MB. We give up OTA update capability — not needed here.
