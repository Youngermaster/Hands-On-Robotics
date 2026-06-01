# Robot Car Controller (Expo)

React Native + Expo app that drives the two ESP32 robot-car firmwares
shipped in [`modules/07-robot-car`](../../modules/07-robot-car/). One app,
two transports, identical UX — switch between Wi-Fi (WebSocket) and BLE
in the Settings tab.

## Stack

- Expo SDK **56** (scaffolded via `pnpm create expo-app --template default@sdk-56`).
- React Native 0.85, TypeScript strict.
- expo-router (file-based routing).
- `react-native-ble-plx` for BLE (requires a dev build — see below).
- Built-in `WebSocket` for the Wi-Fi mode.
- `@react-native-async-storage/async-storage` for settings persistence.
- Joystick uses `react-native-gesture-handler` + `react-native-reanimated`
  (already in the template).

## Quick start

```bash
cd apps/robot-car-controller
pnpm install
pnpm start          # Expo dev server / QR code
```

### Wi-Fi mode (works in Expo Go)

1. Flash and run the WiFi-WebSocket ESP32 firmware
   (`modules/07-robot-car/projects/02-wifi-websocket-control/platforms/esp32/`).
   Note the IP printed in the serial monitor.
2. In the app: Settings tab → Transport: **Wi-Fi** → Wi-Fi server URL:
   `ws://<that-ip>:81/`.
3. Drive tab → Connect → drag joystick.

This path runs in Expo Go — no native build required.

### BLE mode (needs a dev build)

> `react-native-ble-plx` is a native module; it does **not** run inside
> Expo Go. You need a custom dev client. One-time setup:

```bash
cd apps/robot-car-controller
npx expo prebuild --clean
pnpm ios            # builds + runs on an iOS simulator/device
# or
pnpm android        # builds + runs on Android
```

After that, the same `pnpm start` workflow opens the dev client instead
of Expo Go.

Then:

1. Flash and run the BLE ESP32 firmware
   (`modules/07-robot-car/projects/01-ble-control/platforms/esp32/`).
2. In the app: Settings → Transport: **BLE** → BLE device name:
   `HOR-Car-BLE` (or whatever your firmware advertises).
3. Drive tab → Connect → drag joystick.

## What the app does

- **Drive screen** (`src/app/index.tsx`)
  - Joystick centred on screen. Drag = move; release = stop (spring-back).
  - 20 Hz send loop while connected: maps `(x, y) → (left, right)` via
    differential-drive mixing and pushes a `"L,R\n"` text frame.
  - Status badge: disconnected / connecting / connected / error.
  - E-stop button forces `0, 0` immediately.
- **Settings screen** (`src/app/explore.tsx`)
  - Transport mode toggle (Wi-Fi ⇄ BLE).
  - Editable Wi-Fi URL and BLE device name.
  - Persisted via AsyncStorage.

## Wire protocol (shared with both firmwares)

```text
"<left>,<right>\n"     where each is a signed integer in [-255, 255]
```

Both transports send the same text. The firmware has a 500 ms watchdog
that zeros the motors if no frame arrives — the app sends a frame every
50 ms (20 Hz) including zeros when the joystick is centred, which keeps
the watchdog fed and the car responsive.

## File layout

```text
src/
├── app/
│   ├── _layout.tsx           # wraps everything in GestureHandlerRootView
│   ├── index.tsx             # Drive screen
│   └── explore.tsx           # Settings screen
├── components/
│   ├── joystick.tsx          # 2-axis joystick with spring-back
│   └── app-tabs.tsx          # bottom tabs (Drive / Settings)
├── hooks/
│   └── use-settings.ts       # AsyncStorage-backed settings
├── protocol/
│   ├── drive.ts              # mixDifferentialDrive + formatFrame
│   └── drive.test.md         # quick sanity table
└── transports/
    ├── types.ts              # Transport interface + status type
    ├── websocket.ts          # WebSocket impl
    ├── ble.ts                # BLE impl (ble-plx)
    └── useTransport.ts       # React glue for status updates
```

## Why this isn't merged with `apps/ble-led-controller`

Different lifecycles. The LED controller is the companion to Module 06
(BLE-only, one tiny GATT service). This app is the companion to Module 07
(motor control over two transports, joystick UI, safety-critical
watchdog). Sharing a codebase would force one app's churn on the other.

If you find yourself building a *third* mobile app for the curriculum,
that's the right time to extract a shared `apps/common/` package.

## Why not WebRTC / MQTT?

- **WebRTC** gives the lowest latency but adds ~150 KB of native code and
  a STUN/TURN server in the mix. Overkill for LAN-only car control.
- **MQTT** is great for fleets and many-to-many, but a 1:1 phone↔ESP32
  link with no broker is what we want here. WebSocket is simpler.

Both will land in later modules (probably 08+ once kinematics and
telemetry need persistence).
