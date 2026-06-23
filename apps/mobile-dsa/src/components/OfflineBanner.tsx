import NetInfo from '@react-native-community/netinfo';
import { onlineManager } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { typography } from '@/theme';
import { useAppTheme } from '@/theme/ThemeProvider';

onlineManager.setEventListener((setOnline) =>
  NetInfo.addEventListener((state) => {
    setOnline(!!state.isConnected);
  }),
);

export function OfflineBanner() {
  const { colors } = useAppTheme();
  const [offline, setOffline] = useState(false);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        banner: {
          backgroundColor: colors.warning,
          paddingVertical: 8,
          paddingHorizontal: 16,
        },
        text: { ...typography.bodySm, color: colors.background, textAlign: 'center', fontWeight: '600' },
      }),
    [colors.background, colors.warning],
  );

  useEffect(() => {
    const unsub = NetInfo.addEventListener((state) => {
      setOffline(!(state.isConnected && state.isInternetReachable !== false));
    });
    return () => unsub();
  }, []);

  if (!offline) return null;

  return (
    <View style={styles.banner}>
      <Text style={styles.text}>You are offline. Some features may be unavailable.</Text>
    </View>
  );
}
