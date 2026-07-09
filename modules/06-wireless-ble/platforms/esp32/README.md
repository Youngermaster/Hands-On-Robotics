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

---

## How the firmware advertises itself

While no central is connected, the ESP32 broadcasts small radio packets
called **advertisements** roughly every 100 ms. Each packet carries
three pieces of identity so a scanner can tell one peripheral from
another without connecting:

| Field                | Where it's set in `main.cpp`            |
| -------------------- | --------------------------------------- |
| Device name          | `BLEDevice::init(kDeviceName)` (line ~103) |
| Service UUID         | `adv->addServiceUUID(kServiceUuid)` (line ~123) |
| Random device ID     | picked by the ESP-IDF BLE stack per boot |

The name is **not always in the first advertisement packet** — iOS in
particular waits for the "scan response" packet, which the ESP32
provides via `adv->setScanResponse(true)`. That's why apps should scan
by **service UUID** first, then match names as they come in.

`adv->setMinPreferred(0x06)` bumps the connection interval hint so iOS
connects faster (Apple's Core Bluetooth prefers intervals in the 20-40 ms
range for foreground UIs).

## GATT layout

One service, two characteristics:

```text
HOR-LED service   9a70b2e0-4b1a-4b0e-9a2a-1c1c1c1c0001
 ├─ Mode          …-0002    WRITE | WRITE_NR
 │                          payload: 1 byte (0..3)
 └─ State         …-0003    READ | NOTIFY
                            payload: 1 byte (0..3), latest confirmed mode
```

**Why WRITE + WRITE_NR both?** `WRITE_NR` (write-without-response) is
fire-and-forget — lowest latency, ideal for a button press in a UI.
`WRITE` waits for an ACK — useful for third-party tools like nRF Connect
that don't offer the no-response variant. Supporting both costs
nothing.

**Why a separate NOTIFY characteristic instead of just letting the
client re-read?** Notify is push-based — the ESP32 tells the client
about a change the instant it happens. If we used only WRITE, the app
would have to poll to know whether its command was applied, which is
wasteful over BLE.

## What happens on connect / disconnect

Both events fire through `ServerCallback` (`main.cpp` line ~95):

- **onConnect** — immediately notify the current mode on the STATE
  characteristic. This means the app's UI starts in sync without polling.
- **onDisconnect** — call `getAdvertising()->start()` so a *new* central
  can find us. The LED keeps its last mode; we do **not** reset it here.
  That's a design choice — the firmware owns behaviour, the phone is
  just a remote.

## Testing without the app

**nRF Connect** (iOS / Android) is the reference debugging tool:

1. Scan → filter by name "HOR-LED-BLE" or by service UUID `9a70…0001`.
2. Connect.
3. Find the service, expand it.
4. On characteristic `…-0002`, tap the up-arrow (write). Send a single
   byte:
   - `00` → off
   - `01` → on
   - `02` → slow blink
   - `03` → fast blink
5. On characteristic `…-0003`, tap the down-arrow (subscribe to notify).
   The value will update after each write.

If nRF Connect works but the Expo app doesn't, the bug is in the app,
not the firmware.

## Design notes

- **Non-blocking blinker.** `main.cpp` uses `millis()` comparisons
  instead of `delay(500)` so the BLE stack keeps running. A
  delay-based blinker would stall connection handling.
- **`huge_app.csv` partition.** The BLE stack plus the Arduino
  framework overshoots the default 1.2 MB app partition. `huge_app.csv`
  raises it to 3 MB. We drop OTA update capability — not needed here.
- **Random device ID per boot.** The ESP-IDF picks a fresh 48-bit
  address each time. This is fine for a demo (name + service UUID are
  what the app filters on) but means the OS-level "paired devices"
  list on your phone will grow if you re-flash frequently. Forget the
  old entries occasionally.
- **`WRITE_NR` accepted through the same callback.** Both write ops
  land in `ModeCallback::onWrite` regardless of whether the client
  asked for a response. The response (or lack of one) is handled by
  the BLE stack, not our code.
