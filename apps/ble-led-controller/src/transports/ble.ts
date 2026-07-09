// BLE transport for the ESP32 LED module.
//
// Runtime:
//   - Scans for the HOR-LED-BLE service UUID.
//   - Connects to the first device that matches the configured name.
//   - Subscribes to the STATE (notify) characteristic to learn the ESP32's
//     current mode without polling.
//   - Writes single-byte MODE commands with write-without-response for
//     the lowest latency.
//
// Requires a CUSTOM DEV BUILD (react-native-ble-plx is a native module).
// See ../../README.md for `pnpm expo prebuild` steps.

import type { BleManager, Device, Subscription } from 'react-native-ble-plx';

import {
  coerceLedMode,
  HOR_LED_MODE_CHARACTERISTIC_UUID,
  HOR_LED_SERVICE_UUID,
  HOR_LED_STATE_CHARACTERISTIC_UUID,
  LedMode,
} from '@/protocol/led';

import { getBleManager } from './ble-manager';

export type BleState = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface BleStatus {
  state: BleState;
  error?: string;
  detail?: string;
  /** Latest mode reported by the ESP32 via notify. undefined until we've heard from it. */
  currentMode?: LedMode;
}

const DEFAULT_SCAN_TIMEOUT_MS = 8000;

export class LedBleTransport {
  private status: BleStatus = { state: 'disconnected' };
  private listeners = new Set<(s: BleStatus) => void>();
  private device: Device | null = null;
  private notifySub: Subscription | null = null;

  constructor(private readonly deviceName: string = 'HOR-LED-BLE') {}

  getStatus(): BleStatus {
    return this.status;
  }

  subscribe(listener: (s: BleStatus) => void): () => void {
    this.listeners.add(listener);
    listener(this.status);
    return () => {
      this.listeners.delete(listener);
    };
  }

  async connect(): Promise<void> {
    const manager = getBleManager();
    this.setStatus({ state: 'connecting', detail: `scanning for ${this.deviceName}` });

    let found: Device | null;
    try {
      found = await this.scanForDevice(manager);
    } catch (e) {
      this.fail(e);
      throw e;
    }
    if (!found) {
      const msg = `device "${this.deviceName}" not found in ${DEFAULT_SCAN_TIMEOUT_MS} ms`;
      this.setStatus({ state: 'error', error: msg });
      throw new Error(msg);
    }

    try {
      const connected = await found.connect({ requestMTU: 100 });
      await connected.discoverAllServicesAndCharacteristics();
      this.device = connected;

      connected.onDisconnected(() => {
        this.tearDownNotify();
        this.device = null;
        if (this.status.state !== 'error') {
          this.setStatus({ state: 'disconnected' });
        }
      });

      this.subscribeToState(connected);

      this.setStatus({
        state: 'connected',
        detail: connected.name ?? connected.id,
        currentMode: this.status.currentMode,
      });
    } catch (e) {
      this.fail(e);
      throw e;
    }
  }

  async disconnect(): Promise<void> {
    this.tearDownNotify();
    if (this.device) {
      try {
        await this.device.cancelConnection();
      } catch {
        // best-effort
      }
      this.device = null;
    }
    this.setStatus({ state: 'disconnected' });
  }

  /** Send a mode-change to the ESP32 (fire-and-forget). */
  setMode(mode: LedMode): void {
    if (!this.device) return;
    // Byte → base64 payload. The value fits in ASCII, so `btoa` on a
    // one-char string works and we avoid a Buffer polyfill.
    const payload = globalThis.btoa(String.fromCharCode(mode));
    void this.device
      .writeCharacteristicWithoutResponseForService(
        HOR_LED_SERVICE_UUID,
        HOR_LED_MODE_CHARACTERISTIC_UUID,
        payload,
      )
      .catch((e) => {
        const msg = e instanceof Error ? e.message : String(e);
        this.setStatus({ ...this.status, state: 'error', error: msg });
      });
  }

  // ---------------------------------------------------------------------------

  private scanForDevice(manager: BleManager): Promise<Device | null> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        manager.stopDeviceScan();
        resolve(null);
      }, DEFAULT_SCAN_TIMEOUT_MS);

      manager.startDeviceScan(
        [HOR_LED_SERVICE_UUID],
        { allowDuplicates: false },
        (err, device) => {
          if (err) {
            clearTimeout(timeoutId);
            manager.stopDeviceScan();
            reject(err);
            return;
          }
          if (device && (device.name === this.deviceName || device.localName === this.deviceName)) {
            clearTimeout(timeoutId);
            manager.stopDeviceScan();
            resolve(device);
          }
        },
      );
    });
  }

  private subscribeToState(device: Device): void {
    this.notifySub = device.monitorCharacteristicForService(
      HOR_LED_SERVICE_UUID,
      HOR_LED_STATE_CHARACTERISTIC_UUID,
      (err, char) => {
        if (err) {
          // Suppress the "operation cancelled" that fires on graceful disconnect.
          if (this.device !== null) {
            this.setStatus({ ...this.status, state: 'error', error: err.message });
          }
          return;
        }
        if (!char?.value) return;
        const first = globalThis.atob(char.value).charCodeAt(0);
        this.setStatus({ ...this.status, currentMode: coerceLedMode(first) });
      },
    );
  }

  private tearDownNotify(): void {
    if (this.notifySub) {
      this.notifySub.remove();
      this.notifySub = null;
    }
  }

  private fail(e: unknown): void {
    const msg = e instanceof Error ? e.message : String(e);
    this.setStatus({ state: 'error', error: msg });
  }

  private setStatus(next: BleStatus): void {
    this.status = next;
    for (const l of this.listeners) l(next);
  }
}
