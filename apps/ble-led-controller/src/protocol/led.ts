// Shared LED-mode protocol. Matches the ESP32 firmware exactly.
// See modules/06-wireless-ble/platforms/esp32/src/main.cpp.

export const HOR_LED_SERVICE_UUID = '9a70b2e0-4b1a-4b0e-9a2a-1c1c1c1c0001';
export const HOR_LED_MODE_CHARACTERISTIC_UUID = '9a70b2e0-4b1a-4b0e-9a2a-1c1c1c1c0002';
export const HOR_LED_STATE_CHARACTERISTIC_UUID = '9a70b2e0-4b1a-4b0e-9a2a-1c1c1c1c0003';

export enum LedMode {
  Off = 0,
  On = 1,
  Slow = 2,
  Fast = 3,
}

export const LED_MODES: readonly LedMode[] = [
  LedMode.Off,
  LedMode.On,
  LedMode.Slow,
  LedMode.Fast,
] as const;

export function ledModeLabel(mode: LedMode): string {
  switch (mode) {
    case LedMode.Off:
      return 'Off';
    case LedMode.On:
      return 'On';
    case LedMode.Slow:
      return 'Slow blink';
    case LedMode.Fast:
      return 'Fast blink';
  }
}

export function ledModeColor(mode: LedMode): string {
  switch (mode) {
    case LedMode.Off:
      return '#475569';
    case LedMode.On:
      return '#22c55e';
    case LedMode.Slow:
      return '#f59e0b';
    case LedMode.Fast:
      return '#ef4444';
  }
}

/** Normalize any incoming byte to a defined mode; unknown → Off. */
export function coerceLedMode(byte: number): LedMode {
  return byte === 1 || byte === 2 || byte === 3 ? (byte as LedMode) : LedMode.Off;
}
