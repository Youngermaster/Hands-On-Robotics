// Settings screen — matches the LED screen's design language.
// Section-based layout with soft cream cards and uppercase eyebrows.

import { Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTokens } from '@/design/tokens';
import { useNetworkInfo } from '@/hooks/use-network-info';
import { useSettings } from '@/hooks/use-settings';
import { BottomTabInset, MaxContentWidth } from '@/constants/theme';

// ---------------------------------------------------------------------------

export default function SettingsScreen() {
  const t = useTokens();
  const { settings, update, loading } = useSettings();
  const insets = useSafeAreaInsets();
  const network = useNetworkInfo();

  const contentInsets = {
    ...insets,
    bottom: insets.bottom + BottomTabInset + 16,
  };

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
        <Text style={{ color: t.colors.textMuted }}>loading…</Text>
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
          <View style={styles.header}>
            <Text style={[styles.eyebrow, { color: t.colors.textMuted }]}>Preferences</Text>
            <Text style={[styles.title, { color: t.colors.text }]}>Settings</Text>
          </View>

          <Section eyebrow="Device">
            <Card>
              <Text style={[styles.rowLabel, { color: t.colors.textMuted }]}>BLE name</Text>
              <TextInput
                value={settings.bleDeviceName}
                onChangeText={(v) => update('bleDeviceName', v)}
                placeholder="HOR-LED-BLE"
                autoCapitalize="none"
                autoCorrect={false}
                spellCheck={false}
                style={[
                  styles.input,
                  { color: t.colors.text, borderColor: t.colors.border },
                ]}
                placeholderTextColor={t.colors.textMuted}
              />
            </Card>
            <Caption>Must match the name the firmware advertises. Default: HOR-LED-BLE.</Caption>
          </Section>

          <Section eyebrow="Network">
            <Card>
              <Row label="Type" value={network.type} accent />
              <Divider />
              <Row label="Connected" value={network.isConnected ? 'Yes' : 'No'} />
              <Divider />
              <Row
                label="Internet reachable"
                value={network.isInternetReachable ? 'Yes' : 'No'}
              />
            </Card>
            <Caption>
              BLE doesn&apos;t use Wi-Fi. This panel is here because the sibling
              robot-car-controller uses <Mono>expo-network</Mono> to reach its Rust server.
            </Caption>
          </Section>

          <Section eyebrow="About">
            <Card>
              <Row label="Repo" value="Hands-On-Robotics" />
              <Divider />
              <Row label="Module" value="06 · wireless-ble" />
              <Divider />
              <Row label="Firmware" value="modules/06-wireless-ble" />
            </Card>
          </Section>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------

function Section({ eyebrow, children }: { eyebrow: string; children: React.ReactNode }) {
  const t = useTokens();
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionEyebrow, { color: t.colors.textMuted }]}>{eyebrow}</Text>
      {children}
    </View>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  const t = useTokens();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: t.colors.surface, borderColor: t.colors.border },
        t.shadows.card,
      ]}>
      {children}
    </View>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  const t = useTokens();
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, { color: t.colors.textMuted }]}>{label}</Text>
      <Text
        style={[
          accent ? styles.rowValueAccent : styles.rowValue,
          { color: accent ? t.colors.accent : t.colors.text },
        ]}>
        {value}
      </Text>
    </View>
  );
}

function Divider() {
  const t = useTokens();
  return <View style={[styles.divider, { backgroundColor: t.colors.border }]} />;
}

function Caption({ children }: { children: React.ReactNode }) {
  const t = useTokens();
  return <Text style={[styles.caption, { color: t.colors.textMuted }]}>{children}</Text>;
}

function Mono({ children }: { children: React.ReactNode }) {
  const t = useTokens();
  return (
    <Text
      style={[
        {
          fontFamily: Platform.select({ ios: 'ui-monospace', default: 'monospace' }),
          color: t.colors.text,
          fontSize: 13,
          fontWeight: '600',
        },
      ]}>
      {children}
    </Text>
  );
}

// ---------------------------------------------------------------------------

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
  header: { gap: 4, marginTop: 8 },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.6,
  },
  section: { gap: 8 },
  sectionEyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  rowLabel: { fontSize: 13, fontWeight: '600' },
  rowValue: { fontSize: 15, fontWeight: '600' },
  rowValueAccent: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  divider: { height: 1, opacity: 0.55 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontFamily: Platform.select({ ios: 'ui-monospace', default: 'monospace' }),
    fontSize: 15,
  },
  caption: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 19,
    paddingHorizontal: 4,
  },
});
