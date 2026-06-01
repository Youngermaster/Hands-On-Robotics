// BLE transport using react-native-ble-plx.
//
// Requires a CUSTOM DEV BUILD — does NOT work in Expo Go. Run
// `npx expo prebuild` then `pnpm ios` / `pnpm android` for a dev build.
//
// Service / characteristic UUIDs must match the ESP32 firmware
// (modules/07-robot-car/projects/01-ble-control/platforms/esp32/src/main.cpp).

import { BleManager, type Device } from 'react-native-ble-plx';

import { formatFrame } from '@/protocol/drive';

import type { Transport, TransportStatus } from './types';

export const HOR_CAR_SERVICE_UUID = '12345678-1234-5678-1234-56789abcdef0';
export const HOR_CAR_COMMAND_CHARACTERISTIC_UUID =
  '12345678-1234-5678-1234-56789abcdef1';

export class BleTransport implements Transport {
  private static manager: BleManager | null = null;

  private status: TransportStatus = { state: 'disconnected' };
  private listeners = new Set<(s: TransportStatus) => void>();
  private device: Device | null = null;
  private scanTimeoutMs = 8000;

  /** Filter by exact advertised name (default: "HOR-Car-BLE"). */
  constructor(private readonly deviceName: string = 'HOR-Car-BLE') {}

  getStatus(): TransportStatus {
    return this.status;
  }

  subscribe(listener: (s: TransportStatus) => void): () => void {
    this.listeners.add(listener);
    listener(this.status);
    return () => this.listeners.delete(listener);
  }

  async connect(): Promise<void> {
    const manager = BleTransport.getManager();
    this.setStatus({ state: 'connecting', detail: `scanning for ${this.deviceName}` });

    let found: Device | null = null;
    try {
      found = await this.scanForDevice(manager);
    } catch (e) {
      this.fail(e);
      throw e;
    }
    if (!found) {
      const msg = `device "${this.deviceName}" not found in ${this.scanTimeoutMs} ms`;
      this.setStatus({ state: 'error', error: msg });
      throw new Error(msg);
    }

    try {
      const connected = await found.connect({ requestMTU: 100 });
      await connected.discoverAllServicesAndCharacteristics();
      this.device = connected;

      connected.onDisconnected(() => {
        this.device = null;
        if (this.status.state !== 'error') {
          this.setStatus({ state: 'disconnected' });
        }
      });

      this.setStatus({
        state: 'connected',
        detail: connected.name ?? connected.id,
      });
    } catch (e) {
      this.fail(e);
      throw e;
    }
  }

  async disconnect(): Promise<void> {
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

  send(left: number, right: number): void {
    if (!this.device) return;
    // Our payload is pure ASCII (digits, '-', ',', '\n') so btoa() is safe;
    // no need for a Buffer polyfill.
    const payload = globalThis.btoa(formatFrame(left, right));
    // writeCharacteristicWithoutResponse is fire-and-forget — lowest latency.
    void this.device.writeCharacteristicWithoutResponseForService(
      HOR_CAR_SERVICE_UUID,
      HOR_CAR_COMMAND_CHARACTERISTIC_UUID,
      payload,
    ).catch((e) => {
      const msg = e instanceof Error ? e.message : String(e);
      this.setStatus({ state: 'error', error: msg });
    });
  }

  // ---------------------------------------------------------------------------

  private static getManager(): BleManager {
    BleTransport.manager ??= new BleManager();
    return BleTransport.manager;
  }

  private scanForDevice(manager: BleManager): Promise<Device | null> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        manager.stopDeviceScan();
        resolve(null);
      }, this.scanTimeoutMs);

      manager.startDeviceScan(
        [HOR_CAR_SERVICE_UUID],
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

  private fail(e: unknown): void {
    const msg = e instanceof Error ? e.message : String(e);
    this.setStatus({ state: 'error', error: msg });
  }

  private setStatus(next: TransportStatus): void {
    this.status = next;
    for (const l of this.listeners) l(next);
  }
}
