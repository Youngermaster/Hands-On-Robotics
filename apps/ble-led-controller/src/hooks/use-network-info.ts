// Small wrapper around expo-network for the Settings screen.
//
// Not used for BLE (Bluetooth isn't a "network" in Expo's sense) — this
// is shown as informational context: "your phone thinks it's on
// <type>". Useful for the WiFi companion project (Module 05) and a nice
// hook to introduce learners to the API.

import { useNetworkState } from 'expo-network';

export interface NetworkInfo {
  type: string;
  isConnected: boolean;
  isInternetReachable: boolean;
}

export function useNetworkInfo(): NetworkInfo {
  const state = useNetworkState();
  return {
    type: state.type ?? 'UNKNOWN',
    isConnected: state.isConnected ?? false,
    isInternetReachable: state.isInternetReachable ?? false,
  };
}
