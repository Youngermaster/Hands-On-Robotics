// BLE LED Controller — about screen.
// Brief roadmap and links. Real BLE wiring lands with Module 06.

import { Platform, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ExternalLink } from '@/components/external-link';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function AboutScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
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

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentInset={contentInsets}
      contentContainerStyle={[styles.contentContainer, contentPlatformStyle]}>
      <ThemedView style={styles.container}>
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">About</ThemedText>
          <ThemedText type="default">
            This is the mobile companion to{' '}
            <ThemedText type="defaultSemiBold">Hands-On-Robotics</ThemedText>. The home tab
            currently logs button presses to the console — Module 06 will replace the stub with
            a real BLE GATT write to the ESP32&apos;s LED service.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Roadmap</ThemedText>
          <ThemedText type="default">
            1. Stub UI (this PR).{'\n'}
            2. Module 06: scan for ESP32, connect, write LED on/off via GATT.{'\n'}
            3. Module 07: extend to motor control commands.{'\n'}
            4. Module 08: full robot-car teleop joystick + telemetry.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Links</ThemedText>
          <ExternalLink href="https://github.com/Youngermaster/Hands-On-Robotics">
            <ThemedText type="linkPrimary">Repo on GitHub</ThemedText>
          </ExternalLink>
          <ExternalLink href="https://docs.expo.dev/versions/v56.0.0/">
            <ThemedText type="linkPrimary">Expo SDK 56 docs</ThemedText>
          </ExternalLink>
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: { flex: 1 },
  contentContainer: { flexDirection: 'row', justifyContent: 'center' },
  container: {
    maxWidth: MaxContentWidth,
    flexGrow: 1,
    paddingHorizontal: Spacing.four,
    gap: Spacing.five,
  },
  section: {
    gap: Spacing.two,
    paddingTop: Spacing.four,
  },
});
