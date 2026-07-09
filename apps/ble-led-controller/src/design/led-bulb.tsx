// Big animated "LED bulb" that mirrors the current firmware mode.
//
//   Off  → dim gray disc, no glow.
//   On   → solid coral disc + steady halo.
//   Slow → coral disc + halo pulsing at 1 Hz (500 ms half-period).
//   Fast → coral disc + halo pulsing at 5 Hz (100 ms half-period).
//
// Built on the Reanimated worklets that already ship in the Expo
// template, so no extra native deps.

import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { glow, useTokens } from '@/design/tokens';
import { LedMode } from '@/protocol/led';

export interface LedBulbProps {
  mode: LedMode | undefined;
  size?: number;
}

export function LedBulb({ mode, size = 220 }: LedBulbProps) {
  const t = useTokens();
  const brightness = useSharedValue(0);

  useEffect(() => {
    cancelAnimation(brightness);
    switch (mode) {
      case LedMode.Off:
        brightness.value = withTiming(0, { duration: 260 });
        break;
      case LedMode.On:
        brightness.value = withTiming(1, { duration: 260 });
        break;
      case LedMode.Slow:
        // Snap bright, then repeat between bright and dim.
        brightness.value = 1;
        brightness.value = withRepeat(
          withTiming(0.15, { duration: 500, easing: Easing.inOut(Easing.sin) }),
          -1,
          true,
        );
        break;
      case LedMode.Fast:
        brightness.value = 1;
        brightness.value = withRepeat(
          withTiming(0.15, { duration: 100, easing: Easing.inOut(Easing.sin) }),
          -1,
          true,
        );
        break;
      case undefined:
      default:
        brightness.value = withTiming(0, { duration: 260 });
        break;
    }
    return () => cancelAnimation(brightness);
    // brightness is a shared value (stable ref) — safe to omit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const isOn = mode !== LedMode.Off && mode !== undefined;
  const activeColor = isOn ? t.colors.accent : t.colors.textMuted;

  const haloStyle = useAnimatedStyle(() => ({
    opacity: 0.12 + brightness.value * 0.55,
    transform: [{ scale: 0.9 + brightness.value * 0.15 }],
  }));

  const coreStyle = useAnimatedStyle(() => ({
    opacity: 0.35 + brightness.value * 0.65,
    transform: [{ scale: 0.85 + brightness.value * 0.15 }],
  }));

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      {/* Halo — soft, larger, generates the glow effect. */}
      <Animated.View
        style={[
          styles.halo,
          {
            width: size * 1.3,
            height: size * 1.3,
            borderRadius: size,
            backgroundColor: activeColor,
          },
          isOn ? glow(t.colors.accent, 0.55) : undefined,
          haloStyle,
        ]}
      />
      {/* Ring — clean outline around the core, always visible. */}
      <View
        style={[
          styles.ring,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: t.colors.surface,
            borderColor: t.colors.border,
          },
        ]}
      />
      {/* Core — the "bulb". */}
      <Animated.View
        style={[
          styles.core,
          {
            width: size * 0.68,
            height: size * 0.68,
            borderRadius: size,
            backgroundColor: activeColor,
          },
          coreStyle,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  halo: {
    position: 'absolute',
  },
  ring: {
    position: 'absolute',
    borderWidth: 1,
  },
  core: {
    position: 'absolute',
  },
});
