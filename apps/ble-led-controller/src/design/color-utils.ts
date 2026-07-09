// Small colour utilities used across design primitives.

/**
 * Return `hex` with the given alpha (0..1) baked in as an 8-digit hex string.
 * Assumes `hex` is a 7-char `#RRGGBB`; other forms are returned unchanged.
 */
export function withOpacity(hex: string, alpha: number): string {
  if (hex.length !== 7 || !hex.startsWith('#')) return hex;
  const clamped = Math.round(Math.max(0, Math.min(1, alpha)) * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hex}${clamped}`;
}
