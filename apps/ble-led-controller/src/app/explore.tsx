// Settings screen — BLE device name + informational network state via
// expo-network.

import { Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useNetworkInfo } from '@/hooks/use-network-info';
import { useSettings } from '@/hooks/use-settings';
import { useTheme } from '@/hooks/use-theme';

export default function SettingsScreen() {
  const { settings, update, loading } = useSettings();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const network = useNetworkInfo();

  const contentInsets = {
    ...insets,
    bottom: insets.bottom + BottomTabInset + Spacing.three,
  };
  const contentPlatformStyle = Platform.select({
    android: {
      paddingTop: contentInsets.top,
      paddingLeft: contentInsets.left,
      paddingRight: contentInsets.right,
      paddingBottom: contentInsets.bottom,
    },
    web: { paddingTop: Spacing.six, paddingBottom: Spacing.four },
  });

  if (loading) {
    return (
      <ThemedView style={styles.loading}>
        <ThemedText>loading…</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentInset={contentInsets}
      contentContainerStyle={[styles.contentContainer, contentPlatformStyle]}>
      <ThemedView style={styles.container}>
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">BLE device name</ThemedText>
          <ThemedText type="small" style={styles.hint}>
            Exact name advertised by the firmware. Default:{' '}
            <ThemedText type="code">HOR-LED-BLE</ThemedText>.
          </ThemedText>
          <TextInput
            value={settings.bleDeviceName}
            onChangeText={(v) => update('bleDeviceName', v)}
            placeholder="HOR-LED-BLE"
            autoCapitalize="none"
            autoCorrect={false}
            style={[
              styles.input,
              { color: theme.text, borderColor: theme.backgroundElement },
            ]}
            placeholderTextColor={theme.textSecondary}
          />
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Network (informational)</ThemedText>
          <ThemedText type="small" style={styles.hint}>
            BLE doesn't need Wi-Fi — this is just here to introduce{' '}
            <ThemedText type="code">expo-network</ThemedText>, which the
            Module 05 companion uses to reach the Rust Axum server.
          </ThemedText>
          <NetworkRow label="Type" value={network.type} />
          <NetworkRow
            label="Connected"
            value={network.isConnected ? 'yes' : 'no'}
          />
          <NetworkRow
            label="Internet reachable"
            value={network.isInternetReachable ? 'yes' : 'no'}
          />
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">About</ThemedText>
          <ThemedText type="small" style={styles.hint}>
            Hands-On-Robotics · Module 06 · drives the ESP32 BLE firmware in{' '}
            <ThemedText type="code">modules/06-wireless-ble/</ThemedText>.
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

function NetworkRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <ThemedText type="small">{label}</ThemedText>
      <ThemedText type="code">{value}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scrollView: { flex: 1 },
  contentContainer: { flexDirection: 'row', justifyContent: 'center' },
  container: {
    maxWidth: MaxContentWidth,
    flexGrow: 1,
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
    paddingTop: Spacing.four,
  },
  section: { gap: Spacing.two },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.one,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: Spacing.three,
    fontFamily: 'monospace',
    fontSize: 14,
  },
  hint: { opacity: 0.7 },
});
