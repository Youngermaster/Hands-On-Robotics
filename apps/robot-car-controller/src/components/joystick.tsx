// A reusable 2-axis joystick.
//
// Uses react-native-gesture-handler (already in the Expo template) for the
// pan. Position is reported via `onChange(x, y)` with values in [-1, +1]
// where (0, 0) is the rest position, (0, +1) is full forward, (-1, 0) is
// full left.
//
// The thumb is snapped back to centre when the finger lifts so the car
// stops on release.

import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

export interface JoystickProps {
  /** Outer diameter in px. Thumb is ~1/3 of this. */
  size?: number;
  /** Disable input (greyed out, no events). */
  disabled?: boolean;
  /** Called on every position change with (x, y) in [-1, +1]. */
  onChange?: (x: number, y: number) => void;
}

export function Joystick({ size = 240, disabled = false, onChange }: JoystickProps) {
  const radius = size / 2;
  const thumbSize = size / 3;
  const maxOffset = radius - thumbSize / 2 - 4;

  const tx = useSharedValue(0);
  const ty = useSharedValue(0);

  const [_pos, setPos] = useState({ x: 0, y: 0 });

  const report = useCallback(
    (x: number, y: number) => {
      setPos({ x, y });
      onChange?.(x, y);
    },
    [onChange],
  );

  const pan = Gesture.Pan()
    .enabled(!disabled)
    .onChange((e) => {
      // We use absolute position relative to the centre, not accumulated
      // translation, so the thumb tracks the finger precisely.
      let dx = tx.value + e.changeX;
      let dy = ty.value + e.changeY;
      const dist = Math.hypot(dx, dy);
      if (dist > maxOffset) {
        const s = maxOffset / dist;
        dx *= s;
        dy *= s;
      }
      tx.value = dx;
      ty.value = dy;
      // Y axis: screen y grows downward, so invert for "forward = +y".
      runOnJS(report)(dx / maxOffset, -dy / maxOffset);
    })
    .onFinalize(() => {
      tx.value = withSpring(0, { damping: 18, stiffness: 240 });
      ty.value = withSpring(0, { damping: 18, stiffness: 240 });
      runOnJS(report)(0, 0);
    });

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }, { translateY: ty.value }],
  }));

  return (
    <View
      style={[
        styles.base,
        {
          width: size,
          height: size,
          borderRadius: radius,
          opacity: disabled ? 0.4 : 1,
        },
      ]}
      accessibilityLabel="Drive joystick"
      accessibilityRole="adjustable">
      <View style={styles.crosshair} />
      <GestureDetector gesture={pan}>
        <Animated.View
          style={[
            styles.thumb,
            { width: thumbSize, height: thumbSize, borderRadius: thumbSize / 2 },
            thumbStyle,
          ]}
        />
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: '#1f2937',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  crosshair: {
    position: 'absolute',
    width: '70%',
    height: 1,
    backgroundColor: '#374151',
  },
  thumb: {
    backgroundColor: '#2563eb',
    borderWidth: 2,
    borderColor: '#1d4ed8',
  },
});
