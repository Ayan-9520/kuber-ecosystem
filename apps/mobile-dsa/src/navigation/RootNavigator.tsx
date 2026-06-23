import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { AuthNavigator } from './AuthNavigator';
import { linking } from './linking';
import { MainTabNavigator } from './MainTabNavigator';
import type { RootStackParamList } from './types';

import { OfflineBanner } from '@/components/OfflineBanner';
import { OnboardingScreen } from '@/features/auth/screens/OnboardingScreen';
import { SplashScreen } from '@/features/auth/screens/SplashScreen';
import { useAuthBootstrap } from '@/hooks';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { setSessionExpiredHandler } from '@/lib/api';
import type { RootState } from '@/store';
import { clearCredentials } from '@/store/slices/authSlice';
import { useAppTheme } from '@/theme/ThemeProvider';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const dispatch = useDispatch();
  const { colors, resolved } = useAppTheme();
  const isAuthenticated = useSelector((s: RootState) => s.auth.isAuthenticated);
  const requiresPartnerKyc = useSelector((s: RootState) => s.auth.requiresPartnerKyc);
  const { ready, showOnboarding: initialOnboarding } = useAuthBootstrap();
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const showOnboarding = initialOnboarding && !onboardingComplete;

  const navTheme = useMemo(() => {
    const base = resolved === 'dark' ? DarkTheme : DefaultTheme;
    return {
      ...base,
      dark: resolved === 'dark',
      colors: {
        ...base.colors,
        primary: colors.primary,
        background: colors.background,
        card: colors.card,
        text: colors.text,
        border: colors.border,
      },
    };
  }, [colors, resolved]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        boot: { flex: 1, backgroundColor: colors.background },
        loader: { position: 'absolute', bottom: 80, alignSelf: 'center' },
      }),
    [colors.background],
  );

  useEffect(() => {
    setSessionExpiredHandler(() => {
      dispatch(clearCredentials());
      Alert.alert('Session expired', 'Please sign in again.');
    });
  }, [dispatch]);

  usePushNotifications();

  if (!ready) {
    return (
      <View style={styles.boot}>
        <SplashScreen />
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme} linking={linking}>
      <OfflineBanner />
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
        {showOnboarding && !isAuthenticated ? (
          <Stack.Screen name="Onboarding">
            {() => <OnboardingScreen onDone={() => setOnboardingComplete(true)} />}
          </Stack.Screen>
        ) : null}
        {isAuthenticated && !requiresPartnerKyc ? (
          <Stack.Screen name="Main" component={MainTabNavigator} />
        ) : isAuthenticated && requiresPartnerKyc ? (
          <Stack.Screen name="Auth">
            {() => <AuthNavigator initialRouteName="PartnerKyc" />}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
