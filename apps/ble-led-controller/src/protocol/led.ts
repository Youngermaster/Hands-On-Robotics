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

/** Short, capitalised name for buttons and card titles. */
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

/** One-sentence prose for the hero label under the LED bulb. */
export function ledModeDescription(mode: LedMode | undefined): string {
  switch (mode) {
    case LedMode.Off:
      return 'The LED is dark.';
    case LedMode.On:
      return 'Steady glow.';
    case LedMode.Slow:
      return 'Pulsing at 1 Hz.';
    case LedMode.Fast:
      return 'Rapid flashing.';
    default:
      return 'Not connected.';
  }
}

/** Compact technical hint shown on each mode card (period / behaviour). */
export function ledModeHint(mode: LedMode): string {
  switch (mode) {
    case LedMode.Off:
      return 'Dark';
    case LedMode.On:
      return 'Steady';
    case LedMode.Slow:
      return '500 ms';
    case LedMode.Fast:
      return '100 ms';
  }
}

/** Normalise any incoming byte to a defined mode; unknown → Off. */
export function coerceLedMode(byte: number): LedMode {
  return byte === 1 || byte === 2 || byte === 3 ? (byte as LedMode) : LedMode.Off;
}
