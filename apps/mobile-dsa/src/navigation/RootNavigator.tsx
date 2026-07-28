import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  useNavigationContainerRef,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useMemo, useRef, useState } from 'react';
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

function currentRootName(
  ref: ReturnType<typeof useNavigationContainerRef<RootStackParamList>>,
): keyof RootStackParamList | undefined {
  const state = ref.getRootState();
  if (!state?.routes?.length) return undefined;
  const index = state.index ?? 0;
  return state.routes[index]?.name as keyof RootStackParamList | undefined;
}

export function RootNavigator() {
  const dispatch = useDispatch();
  const { colors, resolved } = useAppTheme();
  const navigationRef = useNavigationContainerRef<RootStackParamList>();
  const isAuthenticated = useSelector((s: RootState) => s.auth.isAuthenticated);
  const requiresPartnerKyc = useSelector((s: RootState) => s.auth.requiresPartnerKyc);
  const { ready, showOnboarding: initialOnboarding } = useAuthBootstrap();
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [navReady, setNavReady] = useState(false);
  const showOnboarding = initialOnboarding && !onboardingComplete;
  const bootRouteRef = useRef<keyof RootStackParamList | null>(null);

  const initialRouteName = useMemo(
    () => resolveInitialRoute(showOnboarding, onboardingComplete, isAuthenticated, requiresPartnerKyc),
    [showOnboarding, onboardingComplete, isAuthenticated, requiresPartnerKyc],
  );

  if (bootRouteRef.current === null) {
    bootRouteRef.current = initialRouteName;
  }

  const authInitialRoute: keyof AuthStackParamList | undefined =
    isAuthenticated && requiresPartnerKyc ? 'PartnerKyc' : undefined;

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

  // Soft switch after login/logout — never remount NavigationContainer (that crashed resetRoot/routes).
  useEffect(() => {
    if (!ready || !navReady || !navigationRef.isReady()) return;

    const target = resolveInitialRoute(
      showOnboarding,
      onboardingComplete,
      isAuthenticated,
      requiresPartnerKyc,
    );
    const current = currentRootName(navigationRef);

    if (current === target) {
      if (target === 'Auth' && isAuthenticated && requiresPartnerKyc) {
        navigationRef.navigate('Auth', { screen: 'PartnerKyc' } as never);
      }
      syncWebPath(target);
      return;
    }

    if (target === 'Main') {
      navigationRef.reset({ index: 0, routes: [{ name: 'Main' }] });
    } else if (target === 'Onboarding') {
      navigationRef.reset({ index: 0, routes: [{ name: 'Onboarding' }] });
    } else if (isAuthenticated && requiresPartnerKyc) {
      navigationRef.reset({
        index: 0,
        routes: [
          {
            name: 'Auth',
            state: { index: 0, routes: [{ name: 'PartnerKyc' }] },
          },
        ],
      });
    } else {
      navigationRef.reset({ index: 0, routes: [{ name: 'Auth' }] });
    }

    syncWebPath(target);
  }, [
    ready,
    navReady,
    isAuthenticated,
    requiresPartnerKyc,
    showOnboarding,
    onboardingComplete,
    navigationRef,
  ]);

  if (!ready) {
    return (
      <View style={styles.boot}>
        <SplashScreen />
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      </View>
    );
  }

  return (
    <NavigationContainer
      ref={navigationRef}
      theme={navTheme}
      linking={linking}
      onReady={() => {
        setNavReady(true);
        syncWebPath(bootRouteRef.current ?? initialRouteName);
      }}
    >
      <OfflineBanner />
      <Stack.Navigator
        initialRouteName={bootRouteRef.current ?? initialRouteName}
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
