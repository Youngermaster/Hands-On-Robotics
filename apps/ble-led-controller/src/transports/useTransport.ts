// React glue: subscribes a component to the BLE transport's status updates.

import { useEffect, useState } from 'react';

import type { BleStatus, LedBleTransport } from './ble';

export function useBleStatus(transport: LedBleTransport | null): BleStatus {
  const [status, setStatus] = useState<BleStatus>(
    () => transport?.getStatus() ?? { state: 'disconnected' },
  );

  useEffect(() => {
    if (!transport) {
      setStatus({ state: 'disconnected' });
      return;
    }
    return transport.subscribe(setStatus);
  }, [transport]);

  return status;
}
