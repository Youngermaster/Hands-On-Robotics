// Settings screen — sections + cards, all built from design primitives.
// This file owns state hooks and layout only.

import { Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomTabInset, MaxContentWidth } from '@/constants/theme';
import { Card } from '@/design/card';
import { ScreenHeader } from '@/design/screen-header';
import { Section } from '@/design/section';
import { SettingsDivider, SettingsRow } from '@/design/settings-row';
import { useTokens } from '@/design/tokens';
import { Body, Mono } from '@/design/typography';
import { useNetworkInfo } from '@/hooks/use-network-info';
import { useSettings } from '@/hooks/use-settings';

export default function SettingsScreen() {
  const t = useTokens();
  const { settings, update, loading } = useSettings();
  const insets = useSafeAreaInsets();
  const network = useNetworkInfo();

  const contentInsets = { ...insets, bottom: insets.bottom + BottomTabInset + 16 };
  const contentPlatformStyle = Platform.select({
    android: {
      paddingTop: contentInsets.top,
      paddingLeft: contentInsets.left,
      paddingRight: contentInsets.right,
      paddingBottom: contentInsets.bottom,
    },
    web: { paddingTop: 32, paddingBottom: 24 },
  });

  if (loading) {
    return (
      <View style={[styles.loading, { backgroundColor: t.colors.bg }]}>
        <Body>loading…</Body>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: t.colors.bg }]}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView
          contentInset={contentInsets}
          contentContainerStyle={[styles.scroll, contentPlatformStyle]}
          showsVerticalScrollIndicator={false}>
          <ScreenHeader eyebrow="Preferences" title="Settings" />

          <Section
            eyebrow="Device"
            caption="Must match the name the firmware advertises. Default: HOR-LED-BLE.">
            <Card>
              <BleNameInput
                value={settings.bleDeviceName}
                onChange={(v) => update('bleDeviceName', v)}
              />
            </Card>
          </Section>

          <Section
            eyebrow="Network"
            caption={
              <>
                BLE doesn&apos;t use Wi-Fi. This panel is here because the sibling
                robot-car-controller uses <Mono>expo-network</Mono> to reach its Rust server.
              </>
            }>
            <Card>
              <SettingsRow label="Type" value={network.type} accent />
              <SettingsDivider />
              <SettingsRow label="Connected" value={network.isConnected ? 'Yes' : 'No'} />
              <SettingsDivider />
              <SettingsRow
                label="Internet reachable"
                value={network.isInternetReachable ? 'Yes' : 'No'}
              />
            </Card>
          </Section>

          <Section eyebrow="About">
            <Card>
              <SettingsRow label="Repo" value="Hands-On-Robotics" />
              <SettingsDivider />
              <SettingsRow label="Module" value="06 · wireless-ble" />
              <SettingsDivider />
              <SettingsRow label="Firmware" value="modules/06-wireless-ble" />
            </Card>
          </Section>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

/**
 * Extracted so the Settings screen doesn't carry the TextInput's styling.
 * If we grow to more inputs, promote this to `src/design/text-input.tsx`.
 */
function BleNameInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const t = useTokens();
  return (
    <TextInput
      value={value}
      onChangeText={onChange}
      placeholder="HOR-LED-BLE"
      autoCapitalize="none"
      autoCorrect={false}
      spellCheck={false}
      placeholderTextColor={t.colors.textMuted}
      style={[
        styles.input,
        { color: t.colors.text, borderColor: t.colors.border },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 28,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontFamily: Platform.select({ ios: 'ui-monospace', default: 'monospace' }),
    fontSize: 15,
  },
});
