import { createNativeStackNavigator } from '@react-navigation/native-stack';

import type { AuthStackParamList } from './types';

import { OtpLoginScreen } from '@/features/auth/screens/OtpLoginScreen';
import { PartnerKycScreen } from '@/features/auth/screens/PartnerKycScreen';
import { PartnerRegisterScreen } from '@/features/auth/screens/PartnerRegisterScreen';
import { DocumentsScreen } from '@/features/profile/screens/DocumentsScreen';
import { UploadDocumentScreen } from '@/features/profile/screens/UploadDocumentScreen';
import { useAppTheme } from '@/theme/ThemeProvider';

const Stack = createNativeStackNavigator<AuthStackParamList>();

type AuthNavigatorProps = {
  initialRouteName?: keyof AuthStackParamList;
};

export function AuthNavigator({ initialRouteName = 'OtpLogin' }: AuthNavigatorProps) {
  const { colors } = useAppTheme();

  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="OtpLogin" component={OtpLoginScreen} />
      <Stack.Screen name="PartnerRegister" component={PartnerRegisterScreen} />
      <Stack.Screen name="PartnerKyc" component={PartnerKycScreen} />
      <Stack.Screen name="PartnerDocuments" component={DocumentsScreen} />
      <Stack.Screen name="UploadDocument" component={UploadDocumentScreen} />
    </Stack.Navigator>
  );
}
