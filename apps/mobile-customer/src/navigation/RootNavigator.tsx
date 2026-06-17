import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
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
import { colors } from '@/theme';


const Stack = createNativeStackNavigator<RootStackParamList>();

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.card,
    text: colors.text,
    border: colors.border,
  },
};

export function RootNavigator() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((s: RootState) => s.auth.isAuthenticated);
  const requiresProfileCompletion = useSelector((s: RootState) => s.auth.requiresProfileCompletion);
  const { ready, showOnboarding: initialOnboarding } = useAuthBootstrap();
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const showOnboarding = initialOnboarding && !onboardingComplete;

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
        {isAuthenticated && !requiresProfileCompletion ? (
          <Stack.Screen name="Main" component={MainTabNavigator} />
        ) : isAuthenticated && requiresProfileCompletion ? (
          <Stack.Screen name="Auth">
            {() => <AuthNavigator initialRouteName="ProfileCompletion" />}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  boot: { flex: 1, backgroundColor: colors.background },
  loader: { position: 'absolute', bottom: 80, alignSelf: 'center' },
});
