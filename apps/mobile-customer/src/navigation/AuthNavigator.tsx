import { createNativeStackNavigator } from '@react-navigation/native-stack';

import type { AuthStackParamList } from './types';

import { ForgotPasswordScreen } from '@/features/auth/screens/ForgotPasswordScreen';
import { OtpLoginScreen } from '@/features/auth/screens/OtpLoginScreen';
import { ProfileCompletionScreen } from '@/features/auth/screens/ProfileCompletionScreen';
import { RegisterScreen } from '@/features/auth/screens/RegisterScreen';


const Stack = createNativeStackNavigator<AuthStackParamList>();

type AuthNavigatorProps = {
  initialRouteName?: keyof AuthStackParamList;
};

export function AuthNavigator({ initialRouteName = 'OtpLogin' }: AuthNavigatorProps) {
  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="OtpLogin" component={OtpLoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ProfileCompletion" component={ProfileCompletionScreen} />
    </Stack.Navigator>
  );
}
