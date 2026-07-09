// Discovery-only BLE scanner. Filters by the LED service UUID so the
// list stays short — every HOR-LED-BLE firmware in range shows up, and
// nothing else. Dedupes by device id (stable within a session on both
// iOS and Android) and emits sorted-by-RSSI snapshots to subscribers.

import type { Device } from 'react-native-ble-plx';

import { HOR_LED_SERVICE_UUID } from '@/protocol/led';

import { getBleManager } from './ble-manager';

export interface DiscoveredDevice {
  /** Stable identifier for this session. On Android = MAC. On iOS = a per-central UUID. */
  id: string;
  /** Advertised name (`kDeviceName` in the ESP32 firmware). */
  name: string;
  /** Signal strength in dBm. Larger = closer. Null if the OS didn't report it. */
  rssi: number | null;
  /** Wall-clock stamp of the most recent advertisement we saw. */
  seenAtMs: number;
}

export type ScannerState = 'idle' | 'scanning' | 'error';

export interface ScannerSnapshot {
  state: ScannerState;
  error?: string;
  devices: DiscoveredDevice[];
}

export class LedBleScanner {
  private snapshot: ScannerSnapshot = { state: 'idle', devices: [] };
  private listeners = new Set<(s: ScannerSnapshot) => void>();
  private devices = new Map<string, DiscoveredDevice>();
  private timeoutId: ReturnType<typeof setTimeout> | null = null;

  /** Default 10 s. Long enough for slow phones, short enough that idle draws are rare. */
  constructor(private readonly scanDurationMs: number = 10_000) {}

  getSnapshot(): ScannerSnapshot {
    return this.snapshot;
  }

  subscribe(listener: (s: ScannerSnapshot) => void): () => void {
    this.listeners.add(listener);
    listener(this.snapshot);
    return () => {
      this.listeners.delete(listener);
    };
  }

  start(): void {
    if (this.snapshot.state === 'scanning') return;
    const manager = getBleManager();

    this.devices.clear();
    this.emit({ state: 'scanning', devices: [] });

    // Auto-stop so we don't drain the battery if the user forgets.
    this.timeoutId = setTimeout(() => this.stop(), this.scanDurationMs);

    manager.startDeviceScan(
      [HOR_LED_SERVICE_UUID],
      { allowDuplicates: true },
      (err, device) => {
        if (err) {
          this.stopInternal();
          this.emit({ state: 'error', error: err.message, devices: this.sorted() });
          return;
        }
        if (!device) return;
        // Some devices report their name only in the scan response.
        const name = device.name ?? device.localName ?? 'Unknown';
        const now = Date.now();
        this.devices.set(device.id, {
          id: device.id,
          name,
          rssi: device.rssi ?? null,
          seenAtMs: now,
        });
        this.emit({ state: 'scanning', devices: this.sorted() });
      },
    );
  }

  stop(): void {
    if (this.snapshot.state !== 'scanning') return;
    this.stopInternal();
    this.emit({ state: 'idle', devices: this.sorted() });
  }

  private stopInternal(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    getBleManager().stopDeviceScan();
  }

  private sorted(): DiscoveredDevice[] {
    // Strongest signal first — the device the user is holding.
    return [...this.devices.values()].sort(
      (a, b) => (b.rssi ?? -Infinity) - (a.rssi ?? -Infinity),
    );
  }

  private emit(s: ScannerSnapshot): void {
    this.snapshot = s;
    for (const l of this.listeners) l(s);
  }
}

// Helper: react-native-ble-plx exposes `Device` — reference it so
// consumers of this file don't need a second import to type things.
export type { Device };
