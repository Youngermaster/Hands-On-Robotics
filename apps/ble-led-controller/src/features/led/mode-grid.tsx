// 2×2 grid of ModeCards. Owns layout only; each card owns its own state.

import { StyleSheet, View } from 'react-native';

import { LED_MODES, LedMode } from '@/protocol/led';

import { ModeCard } from './mode-card';

export interface ModeGridProps {
  selected: LedMode | undefined;
  disabled: boolean;
  /** True while an optimistic write for `selected` is in flight. */
  pending: boolean;
  onSelect: (mode: LedMode) => void;
}

export function ModeGrid({ selected, disabled, pending, onSelect }: ModeGridProps) {
  return (
    <View style={styles.grid}>
      {LED_MODES.map((mode) => (
        <ModeCard
          key={mode}
          mode={mode}
          active={selected === mode}
          disabled={disabled}
          pending={pending && selected === mode}
          onPress={() => onSelect(mode)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
});
