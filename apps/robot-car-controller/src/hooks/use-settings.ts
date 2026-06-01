// Persistent app settings (server URL, BLE device name, last-used transport).
// Backed by AsyncStorage; read once on mount, write through on every update.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

export type TransportMode = 'wifi' | 'ble';

export interface Settings {
  mode: TransportMode;
  serverUrl: string;     // ws://host:port/
  bleDeviceName: string; // exact advertised name
}

const DEFAULTS: Settings = {
  mode: 'wifi',
  serverUrl: 'ws://192.168.1.123:81/',
  bleDeviceName: 'HOR-Car-BLE',
};

const STORAGE_KEY = '@hor/robot-car-controller/settings/v1';

export function useSettings(): {
  settings: Settings;
  loading: boolean;
  update: <K extends keyof Settings>(key: K, value: Settings[K]) => Promise<void>;
} {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!cancelled && raw) {
          const parsed = JSON.parse(raw) as Partial<Settings>;
          setSettings({ ...DEFAULTS, ...parsed });
        }
      } catch {
        // Corrupt storage → fall back to defaults.
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const update = useCallback(
    async <K extends keyof Settings>(key: K, value: Settings[K]) => {
      setSettings((prev) => {
        const next = { ...prev, [key]: value };
        void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    [],
  );

  return { settings, loading, update };
}
