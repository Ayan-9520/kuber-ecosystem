import { createNativeStackNavigator } from '@react-navigation/native-stack';

import type { AuthStackParamList } from './types';

import { OtpLoginScreen } from '@/features/auth/screens/OtpLoginScreen';
import { PartnerKycScreen } from '@/features/auth/screens/PartnerKycScreen';
import { PartnerRegisterScreen } from '@/features/auth/screens/PartnerRegisterScreen';


const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="OtpLogin"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#071A1F' },
      }}
    >
      <Stack.Screen name="OtpLogin" component={OtpLoginScreen} />
      <Stack.Screen name="PartnerRegister" component={PartnerRegisterScreen} />
      <Stack.Screen name="PartnerKyc" component={PartnerKycScreen} />
    </Stack.Navigator>
  );
}
