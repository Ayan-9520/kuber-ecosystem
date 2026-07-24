import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Platform, StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { AuthNavigator } from './AuthNavigator';
import { linking } from './linking';
import { MainTabNavigator } from './MainTabNavigator';
import { resolveInitialRoute } from './resolveInitialRoute';
import type { AuthStackParamList, RootStackParamList } from './types';

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

function syncWebPath(route: keyof RootStackParamList) {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return;
  if (route === 'Main') {
    window.history.replaceState(null, '', '/Home/Dashboard');
    return;
  }
  if (route === 'Onboarding') {
    window.history.replaceState(null, '', '/Onboarding');
    return;
  }
  window.history.replaceState(null, '', '/login');
}

export function RootNavigator() {
  const dispatch = useDispatch();
  const { colors, resolved } = useAppTheme();
  const isAuthenticated = useSelector((s: RootState) => s.auth.isAuthenticated);
  const requiresPartnerKyc = useSelector((s: RootState) => s.auth.requiresPartnerKyc);
  const { ready, showOnboarding: initialOnboarding } = useAuthBootstrap();
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const showOnboarding = initialOnboarding && !onboardingComplete;

  const initialRouteName = useMemo(
    () => resolveInitialRoute(showOnboarding, onboardingComplete, isAuthenticated, requiresPartnerKyc),
    [showOnboarding, onboardingComplete, isAuthenticated, requiresPartnerKyc],
  );

  const authInitialRoute: keyof AuthStackParamList | undefined =
    isAuthenticated && requiresPartnerKyc ? 'PartnerKyc' : undefined;

  /** Remount navigator when auth gate changes so login actually lands on Main. */
  const navSessionKey = `${initialRouteName}:${authInitialRoute ?? 'default'}`;

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
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined') {
          window.alert('Session expired. Please sign in again.');
        }
        return;
      }
      Alert.alert('Session expired', 'Please sign in again.');
    });
  }, [dispatch]);

  usePushNotifications();

  useLayoutEffect(() => {
    if (!ready) return;
    syncWebPath(initialRouteName);
  }, [ready, initialRouteName, navSessionKey]);

  if (!ready) {
    return (
      <View style={styles.boot}>
        <SplashScreen />
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      </View>
    );
  }

  return (
    <NavigationContainer key={navSessionKey} theme={navTheme} linking={linking}>
      <OfflineBanner />
      <Stack.Navigator
        initialRouteName={initialRouteName}
        screenOptions={{ headerShown: false, animation: 'fade' }}
      >
        <Stack.Screen name="Onboarding">
          {() => <OnboardingScreen onDone={() => setOnboardingComplete(true)} />}
        </Stack.Screen>
        <Stack.Screen name="Auth">
          {() => <AuthNavigator initialRouteName={authInitialRoute} />}
        </Stack.Screen>
        <Stack.Screen name="Main" component={MainTabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
