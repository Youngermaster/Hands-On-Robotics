# BLE LED Controller (Expo)

React Native + Expo app that controls the ESP32 onboard LED over BLE
GATT. Paired with the firmware in
[`modules/06-wireless-ble/`](../../modules/06-wireless-ble/).

Four modes: **off**, **on**, **slow blink**, **fast blink**. The ESP32
notifies its confirmed state back to the app, so the UI always reflects
the truth.

## Stack

- Expo SDK **57** (scaffolded via `pnpm create expo-app --template default@sdk-57`).
- React Native 0.86, TypeScript strict.
- expo-router (file-based routing).
- `react-native-ble-plx` for BLE (requires a dev build — see below).
- `@react-native-async-storage/async-storage` for the persisted BLE device name.
- `expo-network` for the informational network-state panel in Settings.

## Quick start

```bash
cd apps/ble-led-controller
pnpm install
```

BLE is a native module, so you cannot use Expo Go. You need a custom
dev client. One-time setup:

```bash
pnpm expo prebuild --clean
pnpm ios         # builds + runs on iOS simulator/device
# or
pnpm android     # builds + runs on Android device (BLE won't work in an emulator)
```

After that, `pnpm start` opens the dev server against your new dev client.

## Using it

1. Flash the ESP32 firmware:
   ```bash
   cd modules/06-wireless-ble/platforms/esp32
   pio run --target upload && pio device monitor
   ```
   Confirm you see `[ble] advertising as HOR-LED-BLE`.
2. Open the app on your phone → **LED** tab → tap **Connect**.
3. Tap **Off / On / Slow / Fast**. The active tile fills with its color.
   The ESP32 notifies its confirmed state so if the write races with a
   disconnect you'll see it snap back.

## Wire protocol

Matches the firmware exactly (see [`modules/06-wireless-ble/README.md`](../../modules/06-wireless-ble/README.md)):

| Char | UUID | Op | Payload |
| ---- | ---- | -- | ------- |
| Service | `9a70b2e0-…-0001` | — | — |
| Mode | `9a70b2e0-…-0002` | WRITE | 1 byte: 0=off, 1=on, 2=slow, 3=fast |
| State | `9a70b2e0-…-0003` | NOTIFY | 1 byte: current mode as reported by firmware |

## Why `expo-network` shows up in Settings

Bluetooth isn't a "network" in Expo's sense; `expo-network` reports
Wi-Fi / cellular / airplane-mode state and has **nothing to do with BLE**.
It's on the Settings screen purely as a teaching hook — the Module 05
Wi-Fi companion (`apps/robot-car-controller`) uses the same API to reach
its Axum server, so it's worth being aware of.

## File layout

```text
src/
├── app/
│   ├── _layout.tsx           # tab navigator
│   ├── index.tsx             # LED Control screen
│   └── explore.tsx           # Settings screen
├── components/
│   ├── app-tabs.tsx          # bottom tabs (LED / Settings)
│   └── themed-{text,view}.tsx (template)
├── hooks/
│   ├── use-settings.ts       # AsyncStorage-backed device name
│   └── use-network-info.ts   # expo-network wrapper
├── protocol/
│   └── led.ts                # UUIDs + LedMode enum + labels
└── transports/
    ├── ble.ts                # LedBleTransport (ble-plx)
    └── useTransport.ts       # React glue for status updates
```

## Two Expo apps in the repo?

Yes:

| App | Module | Transport | Purpose |
| --- | ------ | --------- | ------- |
| `apps/ble-led-controller` (this app) | 06 | BLE only | Learn BLE GATT — 4-state LED, no motors |
| `apps/robot-car-controller` | 07 | BLE **or** WebSocket | Drive a car — joystick + differential drive |

Different lifecycles, different threat models (car needs a watchdog,
LED doesn't). Sharing a codebase would force one app's churn on the
other. If you find yourself building a third mobile app for the
curriculum, that's the right time to extract a common package.
