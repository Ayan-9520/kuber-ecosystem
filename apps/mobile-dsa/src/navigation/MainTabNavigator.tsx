import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import type {
  ApplicationsStackParamList,
  CommissionsStackParamList,
  HomeStackParamList,
  LeadsStackParamList,
  MainTabParamList,
  ProfileStackParamList,
} from './types';

import { AiAdvisorScreen } from '@/features/ai-advisor/screens/AiAdvisorScreen';
import { ApplicationDetailScreen } from '@/features/applications/screens/ApplicationDetailScreen';
import { ApplicationsListScreen } from '@/features/applications/screens/ApplicationsListScreen';
import { CommissionAnalyticsScreen } from '@/features/commissions/screens/CommissionAnalyticsScreen';
import { CommissionLedgerScreen } from '@/features/commissions/screens/CommissionLedgerScreen';
import { CommissionPaymentsScreen } from '@/features/commissions/screens/CommissionPaymentsScreen';
import { CommissionRecoveriesScreen } from '@/features/commissions/screens/CommissionRecoveriesScreen';
import { CommissionsHomeScreen } from '@/features/commissions/screens/CommissionsHomeScreen';
import { PendingCommissionsScreen } from '@/features/commissions/screens/PendingCommissionsScreen';
import { DashboardScreen } from '@/features/dashboard/screens/DashboardScreen';
import { CreateLeadScreen } from '@/features/leads/screens/CreateLeadScreen';
import { EditLeadScreen } from '@/features/leads/screens/EditLeadScreen';
import { LeadAnalyticsScreen } from '@/features/leads/screens/LeadAnalyticsScreen';
import { LeadDetailScreen } from '@/features/leads/screens/LeadDetailScreen';
import { LeadsListScreen } from '@/features/leads/screens/LeadsListScreen';
import { CommunicationHistoryScreen } from '@/features/notifications/screens/CommunicationHistoryScreen';
import { NotificationsScreen } from '@/features/notifications/screens/NotificationsScreen';
import { BankAccountScreen } from '@/features/profile/screens/BankAccountScreen';
import { CustomerDetailScreen } from '@/features/profile/screens/CustomerDetailScreen';
import { CustomersListScreen } from '@/features/profile/screens/CustomersListScreen';
import { DocumentDeficienciesScreen } from '@/features/profile/screens/DocumentDeficienciesScreen';
import { DocumentsScreen } from '@/features/profile/screens/DocumentsScreen';
import { PartnerKycStatusScreen } from '@/features/profile/screens/PartnerKycStatusScreen';
import { ProfileScreen } from '@/features/profile/screens/ProfileScreen';
import { UploadDocumentScreen } from '@/features/profile/screens/UploadDocumentScreen';
import { CreateReferralScreen } from '@/features/referrals/screens/CreateReferralScreen';
import { ReferralAnalyticsScreen } from '@/features/referrals/screens/ReferralAnalyticsScreen';
import { ReferralsScreen } from '@/features/referrals/screens/ReferralsScreen';
import { SettingsScreen } from '@/features/settings/screens/SettingsScreen';
import { CreateTicketScreen } from '@/features/support/screens/CreateTicketScreen';
import { FeedbackScreen } from '@/features/support/screens/FeedbackScreen';
import { SupportScreen } from '@/features/support/screens/SupportScreen';
import { TicketDetailScreen } from '@/features/support/screens/TicketDetailScreen';
import { VoiceAiScreen } from '@/features/voice-ai/screens/VoiceAiScreen';
import { colors } from '@/theme';


const Tab = createBottomTabNavigator<MainTabParamList>();

const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const LeadsStack = createNativeStackNavigator<LeadsStackParamList>();
const AppsStack = createNativeStackNavigator<ApplicationsStackParamList>();
const CommissionsStack = createNativeStackNavigator<CommissionsStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

const screenOptions = {
  headerStyle: { backgroundColor: colors.card },
  headerTintColor: colors.primary,
  headerTitleStyle: { fontWeight: '600' as const, color: colors.text },
  contentStyle: { backgroundColor: colors.background },
};

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={screenOptions}>
      <HomeStack.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }} />
      <HomeStack.Screen name="AiAdvisor" component={AiAdvisorScreen} options={{ title: 'AI Advisor' }} />
      <HomeStack.Screen name="VoiceAi" component={VoiceAiScreen} options={{ title: 'Voice AI' }} />
      <HomeStack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
      <HomeStack.Screen
        name="CommunicationHistory"
        component={CommunicationHistoryScreen}
        options={{ title: 'Communications' }}
      />
    </HomeStack.Navigator>
  );
}

function LeadsStackNavigator() {
  return (
    <LeadsStack.Navigator screenOptions={screenOptions}>
      <LeadsStack.Screen name="LeadsList" component={LeadsListScreen} options={{ title: 'Leads' }} />
      <LeadsStack.Screen name="LeadDetail" component={LeadDetailScreen} options={{ title: 'Lead Details' }} />
      <LeadsStack.Screen name="CreateLead" component={CreateLeadScreen} options={{ title: 'Create Lead' }} />
      <LeadsStack.Screen name="EditLead" component={EditLeadScreen} options={{ title: 'Edit Lead' }} />
      <LeadsStack.Screen name="LeadAnalytics" component={LeadAnalyticsScreen} options={{ title: 'Lead Analytics' }} />
    </LeadsStack.Navigator>
  );
}

function ApplicationsStackNavigator() {
  return (
    <AppsStack.Navigator screenOptions={screenOptions}>
      <AppsStack.Screen name="ApplicationsList" component={ApplicationsListScreen} options={{ title: 'Applications' }} />
      <AppsStack.Screen
        name="ApplicationDetail"
        component={ApplicationDetailScreen}
        options={{ title: 'Application' }}
      />
    </AppsStack.Navigator>
  );
}

function CommissionsStackNavigator() {
  return (
    <CommissionsStack.Navigator screenOptions={screenOptions}>
      <CommissionsStack.Screen
        name="CommissionsHome"
        component={CommissionsHomeScreen}
        options={{ title: 'Commissions' }}
      />
      <CommissionsStack.Screen name="CommissionLedger" component={CommissionLedgerScreen} options={{ title: 'Ledger' }} />
      <CommissionsStack.Screen
        name="CommissionPayments"
        component={CommissionPaymentsScreen}
        options={{ title: 'Payments' }}
      />
      <CommissionsStack.Screen
        name="PendingCommissions"
        component={PendingCommissionsScreen}
        options={{ title: 'Pending' }}
      />
      <CommissionsStack.Screen
        name="CommissionRecoveries"
        component={CommissionRecoveriesScreen}
        options={{ title: 'Recoveries' }}
      />
      <CommissionsStack.Screen
        name="CommissionAnalytics"
        component={CommissionAnalyticsScreen}
        options={{ title: 'Analytics' }}
      />
    </CommissionsStack.Navigator>
  );
}

function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={screenOptions}>
      <ProfileStack.Screen name="ProfileHome" component={ProfileScreen} options={{ title: 'Profile' }} />
      <ProfileStack.Screen name="BankAccount" component={BankAccountScreen} options={{ title: 'Bank Account' }} />
      <ProfileStack.Screen name="PartnerKycStatus" component={PartnerKycStatusScreen} options={{ title: 'KYC Status' }} />
      <ProfileStack.Screen name="Documents" component={DocumentsScreen} options={{ title: 'Documents' }} />
      <ProfileStack.Screen name="UploadDocument" component={UploadDocumentScreen} options={{ title: 'Upload Document' }} />
      <ProfileStack.Screen
        name="DocumentDeficiencies"
        component={DocumentDeficienciesScreen}
        options={{ title: 'Deficiencies' }}
      />
      <ProfileStack.Screen name="CustomersList" component={CustomersListScreen} options={{ title: 'Customers' }} />
      <ProfileStack.Screen name="CustomerDetail" component={CustomerDetailScreen} options={{ title: 'Customer' }} />
      <ProfileStack.Screen name="Referrals" component={ReferralsScreen} options={{ title: 'Referrals' }} />
      <ProfileStack.Screen name="CreateReferral" component={CreateReferralScreen} options={{ title: 'New Referral' }} />
      <ProfileStack.Screen name="ReferralAnalytics" component={ReferralAnalyticsScreen} options={{ title: 'Referral Analytics' }} />
      <ProfileStack.Screen name="Support" component={SupportScreen} options={{ title: 'Support' }} />
      <ProfileStack.Screen name="CreateTicket" component={CreateTicketScreen} options={{ title: 'New Ticket' }} />
      <ProfileStack.Screen name="TicketDetail" component={TicketDetailScreen} options={{ title: 'Ticket' }} />
      <ProfileStack.Screen name="TicketFeedback" component={FeedbackScreen} options={{ title: 'Feedback' }} />
      <ProfileStack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
    </ProfileStack.Navigator>
  );
}

export function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
            Home: 'home',
            Leads: 'people',
            Applications: 'document-text',
            Commissions: 'wallet',
            Profile: 'person',
          };
          return <Ionicons name={icons[route.name] ?? 'ellipse'} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStackNavigator} options={{ title: 'Home' }} />
      <Tab.Screen name="Leads" component={LeadsStackNavigator} options={{ title: 'Leads' }} />
      <Tab.Screen name="Applications" component={ApplicationsStackNavigator} options={{ title: 'Apps' }} />
      <Tab.Screen name="Commissions" component={CommissionsStackNavigator} options={{ title: 'Earnings' }} />
      <Tab.Screen name="Profile" component={ProfileStackNavigator} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}
