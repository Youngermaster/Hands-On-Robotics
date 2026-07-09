// Primary action button. Two visual variants:
//   accent — coral fill (use for the CTA on a screen)
//   ghost  — surface fill with a subtle border (use for secondary actions
//            like Disconnect, or when the button sits next to another accent)
//
// One button component with a variant prop is simpler than two — the
// caller doesn't repeat button chrome (height / radius / press feedback)
// per screen.

import { Pressable, StyleSheet, Text } from 'react-native';

import { useTokens } from './tokens';

export type PillButtonVariant = 'accent' | 'ghost';

export interface PillButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: PillButtonVariant;
  /** Accessibility hint, e.g. "Connects to the ESP32 over BLE". */
  hint?: string;
}

export function PillButton({
  label,
  onPress,
  disabled,
  variant = 'accent',
  hint,
}: PillButtonProps) {
  const t = useTokens();
  const isAccent = variant === 'accent';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={hint}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        isAccent
          ? { backgroundColor: t.colors.accent }
          : {
              backgroundColor: t.colors.surface,
              borderWidth: 1,
              borderColor: t.colors.border,
            },
        isAccent ? t.shadows.cardActive : t.shadows.card,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}>
      <Text
        style={[
          styles.label,
          { color: isAccent ? t.colors.textInverse : t.colors.text },
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 56,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.5 },
  label: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
});
