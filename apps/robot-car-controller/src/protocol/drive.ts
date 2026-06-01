// Shared wire-protocol helpers. Exactly what both ESP32 firmwares expect.
//
// One frame = "<left>,<right>\n" where each value is a signed integer in [-255, 255].
// Differential-drive mixing turns a 2-axis joystick into (left, right) wheel commands.

export const MAX_MOTOR_SPEED = 255;

/**
 * Mix a joystick (x, y) into (left, right) motor commands.
 *
 *   x in [-1, +1]  — steering: -1 = full left, +1 = full right
 *   y in [-1, +1]  — throttle: -1 = full reverse, +1 = full forward
 *
 * Saturation preserves the input ratio so hard-turn-at-full-throttle still
 * rotates correctly instead of clipping one wheel.
 */
export function mixDifferentialDrive(
  x: number,
  y: number,
  maxSpeed: number = MAX_MOTOR_SPEED,
): { left: number; right: number } {
  const cx = clamp(x, -1, 1);
  const cy = clamp(y, -1, 1);

  let left = cy + cx;
  let right = cy - cx;

  // Scale down if either wheel command exceeds ±1 (preserves ratio).
  const peak = Math.max(Math.abs(left), Math.abs(right));
  if (peak > 1) {
    left /= peak;
    right /= peak;
  }

  return {
    left: Math.round(left * maxSpeed),
    right: Math.round(right * maxSpeed),
  };
}

/** Format a frame ready for the wire. Always includes the trailing newline. */
export function formatFrame(left: number, right: number): string {
  return `${clampInt(left, -MAX_MOTOR_SPEED, MAX_MOTOR_SPEED)},${clampInt(right, -MAX_MOTOR_SPEED, MAX_MOTOR_SPEED)}\n`;
}

function clamp(v: number, lo: number, hi: number): number {
  if (v < lo) return lo;
  if (v > hi) return hi;
  return v;
}

function clampInt(v: number, lo: number, hi: number): number {
  return Math.round(clamp(v, lo, hi));
}
