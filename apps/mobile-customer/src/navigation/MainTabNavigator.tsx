import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import type {
  ApplicationsStackParamList,
  HomeStackParamList,
  MainTabParamList,
  ProductsStackParamList,
  ProfileStackParamList,
  SupportStackParamList,
} from './types';

import { AiAdvisorScreen } from '@/features/ai-advisor/screens/AiAdvisorScreen';
import { ApplicationDetailScreen } from '@/features/applications/screens/ApplicationDetailScreen';
import { ApplicationsScreen } from '@/features/applications/screens/ApplicationsScreen';
import { ApplicationWizardScreen } from '@/features/applications/screens/ApplicationWizardScreen';
import { DashboardScreen } from '@/features/dashboard/screens/DashboardScreen';
import { DocumentsScreen } from '@/features/documents/screens/DocumentsScreen';
import { EligibilityScreen } from '@/features/eligibility/screens/EligibilityScreen';
import { EmiScreen } from '@/features/emi/screens/EmiScreen';
import { KycScreen } from '@/features/kyc/screens/KycScreen';
import { LoanProductsScreen } from '@/features/loan-products/screens/LoanProductsScreen';
import { ProductDetailScreen } from '@/features/loan-products/screens/ProductDetailScreen';
import { NotificationsScreen } from '@/features/notifications/screens/NotificationsScreen';
import { EditProfileScreen } from '@/features/profile/screens/EditProfileScreen';
import { ProfileScreen } from '@/features/profile/screens/ProfileScreen';
import { RecommendationsScreen } from '@/features/recommendations/screens/RecommendationsScreen';
import { ReferralsScreen } from '@/features/referrals/screens/ReferralsScreen';
import { SettingsScreen } from '@/features/settings/screens/SettingsScreen';
import { CreateTicketScreen } from '@/features/support/screens/CreateTicketScreen';
import { FeedbackScreen } from '@/features/support/screens/FeedbackScreen';
import { SupportScreen } from '@/features/support/screens/SupportScreen';
import { TicketDetailScreen } from '@/features/support/screens/TicketDetailScreen';
import { VoiceAiScreen } from '@/features/voice-ai/screens/VoiceAiScreen';
import { useAuth } from '@/hooks';
import { useAppTheme } from '@/theme/ThemeProvider';


const Tab = createBottomTabNavigator<MainTabParamList>();

const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const AppsStack = createNativeStackNavigator<ApplicationsStackParamList>();
const ProductsStack = createNativeStackNavigator<ProductsStackParamList>();
const SupportStack = createNativeStackNavigator<SupportStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

function useStackScreenOptions() {
  const { colors } = useAppTheme();
  return {
    headerStyle: { backgroundColor: colors.card },
    headerTintColor: colors.primary,
    headerTitleStyle: { fontWeight: '600' as const, color: colors.text, fontSize: 17 },
    headerShadowVisible: false,
    contentStyle: { backgroundColor: colors.background },
  };
}

function HomeStackNavigator() {
  const screenOptions = useStackScreenOptions();
  const { customerId } = useAuth();

  return (
    <HomeStack.Navigator screenOptions={screenOptions}>
      <HomeStack.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }} />
      <HomeStack.Screen name="Eligibility" component={EligibilityScreen} options={{ title: 'Eligibility' }} />
      <HomeStack.Screen name="EmiCalculator" component={EmiScreen} options={{ title: 'EMI Calculator' }} />
      <HomeStack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
      <HomeStack.Screen name="Referrals" component={ReferralsScreen} options={{ title: 'Referrals' }} />
      <HomeStack.Screen name="AiAdvisor" component={AiAdvisorScreen} options={{ title: 'AI Advisor' }} />
      <HomeStack.Screen name="VoiceAi" component={VoiceAiScreen} options={{ title: 'Voice AI' }} />
      <HomeStack.Screen
        name="Recommendations"
        options={{ title: 'Recommended Offers' }}
      >
        {() => <RecommendationsScreen customerId={customerId ?? ''} />}
      </HomeStack.Screen>
    </HomeStack.Navigator>
  );
}

function ApplicationsStackNavigator() {
  const screenOptions = useStackScreenOptions();
  return (
    <AppsStack.Navigator screenOptions={screenOptions}>
      <AppsStack.Screen name="ApplicationsList" component={ApplicationsScreen} options={{ title: 'Applications' }} />
      <AppsStack.Screen name="ApplicationDetail" component={ApplicationDetailScreen} options={{ headerShown: false }} />
      <AppsStack.Screen
        name="ApplicationWizard"
        component={ApplicationWizardScreen}
        options={({ route }) => ({
          title: route.params?.productName ? `Apply · ${route.params.productName}` : 'Application',
        })}
      />
    </AppsStack.Navigator>
  );
}

function ProductsStackNavigator() {
  const screenOptions = useStackScreenOptions();
  return (
    <ProductsStack.Navigator screenOptions={screenOptions}>
      <ProductsStack.Screen name="ProductsList" component={LoanProductsScreen} options={{ title: 'Loan Products' }} />
      <ProductsStack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: 'Product Details' }} />
    </ProductsStack.Navigator>
  );
}

function SupportStackNavigator() {
  const screenOptions = useStackScreenOptions();
  return (
    <SupportStack.Navigator screenOptions={screenOptions}>
      <SupportStack.Screen name="SupportHome" component={SupportScreen} options={{ title: 'Support' }} />
      <SupportStack.Screen name="CreateTicket" component={CreateTicketScreen} options={{ title: 'New Ticket' }} />
      <SupportStack.Screen name="TicketDetail" component={TicketDetailScreen} options={{ title: 'Ticket' }} />
      <SupportStack.Screen name="TicketFeedback" component={FeedbackScreen} options={{ title: 'Feedback' }} />
    </SupportStack.Navigator>
  );
}

function ProfileStackNavigator() {
  const screenOptions = useStackScreenOptions();
  return (
    <ProfileStack.Navigator screenOptions={screenOptions}>
      <ProfileStack.Screen name="ProfileHome" component={ProfileScreen} options={{ title: 'Profile' }} />
      <ProfileStack.Screen name="Kyc" component={KycScreen} options={{ title: 'KYC Verification' }} />
      <ProfileStack.Screen name="Documents" component={DocumentsScreen} options={{ title: 'Documents' }} />
      <ProfileStack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
      <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Edit Profile' }} />
    </ProfileStack.Navigator>
  );
}

export function MainTabNavigator() {
  const { colors } = useAppTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.borderLight,
          borderTopWidth: 1,
          height: 72,
          paddingBottom: 10,
          paddingTop: 10,
          elevation: 12,
          shadowColor: '#071A1F',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: { fontSize: 12, fontWeight: '700', marginTop: 2 },
        tabBarIcon: ({ color, focused }) => {
          const icons: Record<string, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }> = {
            Home: { active: 'home', inactive: 'home-outline' },
            Applications: { active: 'document-text', inactive: 'document-text-outline' },
            Products: { active: 'grid', inactive: 'grid-outline' },
            Support: { active: 'headset', inactive: 'headset-outline' },
            Profile: { active: 'person', inactive: 'person-outline' },
          };
          const icon = icons[route.name] ?? { active: 'ellipse', inactive: 'ellipse-outline' };
          return (
            <Ionicons
              name={focused ? icon.active : icon.inactive}
              size={22}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStackNavigator} options={{ title: 'Home' }} />
      <Tab.Screen name="Applications" component={ApplicationsStackNavigator} options={{ title: 'Applications' }} />
      <Tab.Screen name="Products" component={ProductsStackNavigator} options={{ title: 'Products' }} />
      <Tab.Screen name="Support" component={SupportStackNavigator} options={{ title: 'Support' }} />
      <Tab.Screen name="Profile" component={ProfileStackNavigator} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}
