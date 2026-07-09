// Shared BleManager singleton.
//
// ble-plx recommends a single manager per app. Both the connect-flow
// (`ble.ts`) and the discovery-flow (`ble-scanner.ts`) go through this.

import { BleManager } from 'react-native-ble-plx';

let manager: BleManager | null = null;

export function getBleManager(): BleManager {
  manager ??= new BleManager();
  return manager;
}
