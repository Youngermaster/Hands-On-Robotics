// React glue for LedBleScanner. Owns the scanner instance so a mounted
// component can subscribe with a stable reference, and exposes tiny
// `start`/`stop` bindings.

import { useEffect, useMemo, useState } from 'react';

import { LedBleScanner, type ScannerSnapshot } from './ble-scanner';

export function useLedScanner(): {
  snapshot: ScannerSnapshot;
  start: () => void;
  stop: () => void;
} {
  const scanner = useMemo(() => new LedBleScanner(), []);
  const [snapshot, setSnapshot] = useState<ScannerSnapshot>(() => scanner.getSnapshot());

  useEffect(() => {
    const unsubscribe = scanner.subscribe(setSnapshot);
    return () => {
      scanner.stop();
      unsubscribe();
    };
  }, [scanner]);

  return {
    snapshot,
    start: () => scanner.start(),
    stop: () => scanner.stop(),
  };
}
