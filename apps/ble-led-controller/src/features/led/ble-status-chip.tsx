// Adapter: turns a BleStatus into StatusPill props.
//
// Keeps the generic StatusPill decoupled from BLE terminology (states
// are 'idle' / 'busy' / 'active' / 'error') while letting the LED
// screen render one line: <BleStatusChip status={status} name={...} />.

import { StatusPill, type StatusTone } from '@/design/status-pill';
import type { BleStatus } from '@/transports/ble';

export interface BleStatusChipProps {
  status: BleStatus;
  /** Device name to show under the label when connected/idle. */
  name: string;
}

export function BleStatusChip({ status, name }: BleStatusChipProps) {
  const { tone, label, detail } = describe(status, name);
  return <StatusPill tone={tone} label={label} detail={detail} />;
}

function describe(
  status: BleStatus,
  name: string,
): { tone: StatusTone; label: string; detail: string } {
  switch (status.state) {
    case 'connecting':
      return { tone: 'busy', label: 'Connecting', detail: status.detail ?? name };
    case 'connected':
      return { tone: 'active', label: 'Connected', detail: status.detail ?? name };
    case 'error':
      return { tone: 'error', label: 'Error', detail: status.error ?? 'unknown' };
    case 'disconnected':
    default:
      return { tone: 'idle', label: 'Idle', detail: name };
  }
}
