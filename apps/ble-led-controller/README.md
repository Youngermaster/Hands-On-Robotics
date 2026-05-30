# BLE LED Controller (Expo)

React Native + Expo companion app for **Hands-On-Robotics**. The home
screen toggles an "LED" indicator and logs to the console. The actual
BLE GATT call to an ESP32 lands with [Module 06](../../modules/) — for
now this is a UI scaffold so layout and state can iterate independently
from the embedded firmware.

## Stack

- Expo SDK **56** (per `pnpm create expo-app --template default@sdk-56`).
- React Native 0.85.
- expo-router (file-based routing — see `src/app/`).
- TypeScript strict mode.

## Run

```bash
cd apps/ble-led-controller
pnpm install
pnpm start          # opens the dev server / QR code
pnpm ios            # iOS simulator (macOS only)
pnpm android        # Android emulator
pnpm web            # web preview
```

## What you should see

- Tab 1 (Home): big toggle button, indicator circle that switches colors.
- Tab 2 (About): roadmap + links.
- Tapping Toggle logs `[ble-stub] would write LED=on/off to GATT characteristic` to the JS console.

## Wiring up real BLE (Module 06)

When Module 06 lands, replace `writeLedState()` in `src/app/index.tsx` with
a real GATT write using `react-native-ble-plx`:

```ts
import { BleManager } from 'react-native-ble-plx';
// scan → connect → discover → write characteristic
```

The ESP32 firmware will expose a GATT service like:

| UUID                                   | Property        |
| -------------------------------------- | --------------- |
| Service `1234...`                      | LED control     |
| Characteristic `5678...` (uint8)       | 0 = off, 1 = on |

(Exact UUIDs picked when Module 06 is implemented.)

## File layout

```text
src/
├── app/
│   ├── _layout.tsx        # tab navigator
│   ├── index.tsx          # Home → toggle button (this PR)
│   └── explore.tsx        # About / roadmap
├── components/            # shared UI primitives (template-provided)
├── constants/             # theme tokens
└── hooks/                 # template hooks
```

## Why is this app at `apps/` and not inside `modules/06-wireless-ble/`?

Long-lived application code, multi-module reach (Module 07 motor control,
Module 08 robot teleop will all use this same app), and a separate
Expo/npm/EAS lifecycle. Burying it inside a numbered C++/Python module
would couple two unrelated build systems and confuse anyone scanning the
curriculum. See [`CONTRIBUTING.md`](../../CONTRIBUTING.md) for the
broader rationale.
