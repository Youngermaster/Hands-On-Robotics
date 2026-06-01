// React glue: subscribes a component to a Transport's status updates.

import { useEffect, useState } from 'react';

import type { Transport, TransportStatus } from './types';

export function useTransportStatus(transport: Transport | null): TransportStatus {
  const [status, setStatus] = useState<TransportStatus>(() =>
    transport?.getStatus() ?? { state: 'disconnected' },
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
