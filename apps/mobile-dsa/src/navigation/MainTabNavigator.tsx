import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import type {
  AcademyStackParamList,
  ApplicationsStackParamList,
  CommissionsStackParamList,
  HomeStackParamList,
  LeadsStackParamList,
  MainTabParamList,
  ProfileStackParamList,
} from './types';
import { PartnerDesktopTabBar } from './PartnerDesktopTabBar';

import { AcademyHubScreen } from '@/features/academy/screens/AcademyHubScreen';
import { ApplicationsListScreen } from '@/features/applications/screens/ApplicationsListScreen';
import { CommissionsHomeScreen } from '@/features/commissions/screens/CommissionsHomeScreen';
import { DashboardScreen } from '@/features/dashboard/screens/DashboardScreen';
import { LeadsListScreen } from '@/features/leads/screens/LeadsListScreen';
import { ProfileScreen } from '@/features/profile/screens/ProfileScreen';
import { useResponsiveLayout } from '@/hooks';
import { useAppTheme } from '@/theme/ThemeProvider';

const Tab = createBottomTabNavigator<MainTabParamList>();

const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const AcademyStack = createNativeStackNavigator<AcademyStackParamList>();
const LeadsStack = createNativeStackNavigator<LeadsStackParamList>();
const AppsStack = createNativeStackNavigator<ApplicationsStackParamList>();
const CommissionsStack = createNativeStackNavigator<CommissionsStackParamList>();
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

/** Lazy screen — keeps secondary routes out of the first parse/eval path. */
function HomeStackNavigator() {
  const screenOptions = useStackScreenOptions();
  return (
    <HomeStack.Navigator screenOptions={screenOptions}>
      <HomeStack.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }} />
      <HomeStack.Screen
        name="AiAdvisor"
        getComponent={() => require('@/features/ai-advisor/screens/AiAdvisorScreen').AiAdvisorScreen}
        options={{ title: 'AI Advisor' }}
      />
      <HomeStack.Screen
        name="Notifications"
        getComponent={() => require('@/features/notifications/screens/NotificationsScreen').NotificationsScreen}
        options={{ title: 'Notifications' }}
      />
      <HomeStack.Screen
        name="CommunicationHistory"
        getComponent={() =>
          require('@/features/notifications/screens/CommunicationHistoryScreen').CommunicationHistoryScreen
        }
        options={{ title: 'Communications' }}
      />
    </HomeStack.Navigator>
  );
}

function AcademyStackNavigator() {
  const screenOptions = useStackScreenOptions();
  return (
    <AcademyStack.Navigator screenOptions={screenOptions}>
      <AcademyStack.Screen
        name="AcademyHome"
        component={AcademyHubScreen}
        options={{ title: 'Partner Academy', headerShown: false }}
      />
      <AcademyStack.Screen
        name="AcademyModule"
        getComponent={() => require('@/features/academy/screens/AcademyModuleScreen').AcademyModuleScreen}
        options={{ title: 'Academy Module' }}
      />
    </AcademyStack.Navigator>
  );
}

function LeadsStackNavigator() {
  const screenOptions = useStackScreenOptions();
  return (
    <LeadsStack.Navigator screenOptions={screenOptions}>
      <LeadsStack.Screen name="LeadsList" component={LeadsListScreen} options={{ title: 'Leads', headerShown: false }} />
      <LeadsStack.Screen
        name="LeadDetail"
        getComponent={() => require('@/features/leads/screens/LeadDetailScreen').LeadDetailScreen}
        options={{ title: 'Lead Details' }}
      />
      <LeadsStack.Screen
        name="CreateLead"
        getComponent={() => require('@/features/leads/screens/CreateLeadScreen').CreateLeadScreen}
        options={{ title: 'Create Lead' }}
      />
      <LeadsStack.Screen
        name="EditLead"
        getComponent={() => require('@/features/leads/screens/EditLeadScreen').EditLeadScreen}
        options={{ title: 'Edit Lead' }}
      />
      <LeadsStack.Screen
        name="LeadAnalytics"
        getComponent={() => require('@/features/leads/screens/LeadAnalyticsScreen').LeadAnalyticsScreen}
        options={{ title: 'Lead Analytics' }}
      />
    </LeadsStack.Navigator>
  );
}

function ApplicationsStackNavigator() {
  const screenOptions = useStackScreenOptions();
  return (
    <AppsStack.Navigator screenOptions={screenOptions}>
      <AppsStack.Screen name="ApplicationsList" component={ApplicationsListScreen} options={{ title: 'Applications', headerShown: false }} />
      <AppsStack.Screen
        name="ApplicationDetail"
        getComponent={() => require('@/features/applications/screens/ApplicationDetailScreen').ApplicationDetailScreen}
        options={{ title: 'Application' }}
      />
    </AppsStack.Navigator>
  );
}

function CommissionsStackNavigator() {
  const screenOptions = useStackScreenOptions();
  return (
    <CommissionsStack.Navigator screenOptions={screenOptions}>
      <CommissionsStack.Screen
        name="CommissionsHome"
        component={CommissionsHomeScreen}
        options={{ title: 'Earnings & Finance', headerShown: false }}
      />
      <CommissionsStack.Screen
        name="EarningsDashboard"
        getComponent={() => require('@/features/earnings-finance/screens/EarningsScreens').EarningsDashboardScreen}
        options={{ title: 'Earnings Dashboard' }}
      />
      <CommissionsStack.Screen
        name="PartnerDrde"
        getComponent={() => require('@/features/earnings-finance/screens/PartnerDrdeScreen').PartnerDrdeScreen}
        options={{ title: 'Revenue Distribution' }}
      />
      <CommissionsStack.Screen
        name="PartnerBankRecon"
        getComponent={() => require('@/features/earnings-finance/screens/PartnerBankReconScreen').PartnerBankReconScreen}
        options={{ title: 'Bank Reconciliation' }}
      />
      <CommissionsStack.Screen
        name="PartnerLoanCases"
        getComponent={() => require('@/features/loan-fulfillment').PartnerLoanCasesScreen}
        options={{ title: 'My Loan Cases' }}
      />
      <CommissionsStack.Screen
        name="CommissionTracker"
        getComponent={() => require('@/features/earnings-finance/screens/EarningsScreens').CommissionTrackerScreen}
        options={{ title: 'Commission Tracker' }}
      />
      <CommissionsStack.Screen
        name="RaiseInvoice"
        getComponent={() => require('@/features/earnings-finance/screens/EarningsScreens').RaiseInvoiceScreen}
        options={{ title: 'Raise Invoice' }}
      />
      <CommissionsStack.Screen
        name="InvoiceTracker"
        getComponent={() => require('@/features/earnings-finance/screens/EarningsScreens').InvoiceTrackerScreen}
        options={{ title: 'Track Invoice' }}
      />
      <CommissionsStack.Screen
        name="InvoiceTimeline"
        getComponent={() => require('@/features/earnings-finance/screens/EarningsScreens').InvoiceTimelineScreen}
        options={{ title: 'Invoice Timeline' }}
      />
      <CommissionsStack.Screen
        name="CommissionTimeline"
        getComponent={() => require('@/features/earnings-finance/screens/EarningsScreens').CommissionTimelineScreen}
        options={{ title: 'Commission Timeline' }}
      />
      <CommissionsStack.Screen
        name="CommissionByStatus"
        getComponent={() => require('@/features/earnings-finance/screens/EarningsScreens').CommissionByStatusScreen}
        options={{ title: 'Commissions' }}
      />
      <CommissionsStack.Screen
        name="PayoutHistory"
        getComponent={() => require('@/features/earnings-finance/screens/EarningsScreens').PayoutHistoryScreen}
        options={{ title: 'Payout History' }}
      />
      <CommissionsStack.Screen
        name="TdsCentre"
        getComponent={() => require('@/features/earnings-finance/screens/EarningsScreens').TdsCentreScreen}
        options={{ title: 'TDS Centre' }}
      />
      <CommissionsStack.Screen
        name="DownloadStatements"
        getComponent={() => require('@/features/earnings-finance/screens/EarningsScreens').DownloadStatementsScreen}
        options={{ title: 'Statements' }}
      />
      <CommissionsStack.Screen
        name="BonusTracker"
        getComponent={() => require('@/features/earnings-finance/screens/EarningsScreens').BonusTrackerScreen}
        options={{ title: 'Bonuses' }}
      />
      <CommissionsStack.Screen
        name="ReferralIncome"
        getComponent={() => require('@/features/earnings-finance/screens/EarningsScreens').ReferralIncomeScreen}
        options={{ title: 'Referral Income' }}
      />
      <CommissionsStack.Screen
        name="CommissionLedger"
        getComponent={() => require('@/features/commissions/screens/CommissionLedgerScreen').CommissionLedgerScreen}
        options={{ title: 'Ledger' }}
      />
      <CommissionsStack.Screen
        name="CommissionAnalytics"
        getComponent={() => require('@/features/commissions/screens/CommissionAnalyticsScreen').CommissionAnalyticsScreen}
        options={{ title: 'Analytics' }}
      />
    </CommissionsStack.Navigator>
  );
}

function ProfileStackNavigator() {
  const screenOptions = useStackScreenOptions();
  return (
    <ProfileStack.Navigator screenOptions={screenOptions}>
      <ProfileStack.Screen name="ProfileHome" component={ProfileScreen} options={{ title: 'Profile', headerShown: false }} />
      <ProfileStack.Screen
        name="BrandingDashboard"
        getComponent={() => require('@/features/profile/screens/BrandingDashboardScreen').BrandingDashboardScreen}
        options={{ title: 'My Brand Profile' }}
      />
      <ProfileStack.Screen
        name="BankAccount"
        getComponent={() => require('@/features/profile/screens/BankAccountScreen').BankAccountScreen}
        options={{ title: 'Bank Account' }}
      />
      <ProfileStack.Screen
        name="PartnerKycStatus"
        getComponent={() => require('@/features/profile/screens/PartnerKycStatusScreen').PartnerKycStatusScreen}
        options={{ title: 'KYC Status' }}
      />
      <ProfileStack.Screen
        name="Documents"
        getComponent={() => require('@/features/profile/screens/DocumentsScreen').DocumentsScreen}
        options={{ title: 'Documents' }}
      />
      <ProfileStack.Screen
        name="UploadDocument"
        getComponent={() => require('@/features/profile/screens/UploadDocumentScreen').UploadDocumentScreen}
        options={{ title: 'Upload Document' }}
      />
      <ProfileStack.Screen
        name="DocumentDeficiencies"
        getComponent={() => require('@/features/profile/screens/DocumentDeficienciesScreen').DocumentDeficienciesScreen}
        options={{ title: 'Deficiencies' }}
      />
      <ProfileStack.Screen
        name="CustomersList"
        getComponent={() => require('@/features/profile/screens/CustomersListScreen').CustomersListScreen}
        options={{ title: 'Customers' }}
      />
      <ProfileStack.Screen
        name="CustomerDetail"
        getComponent={() => require('@/features/profile/screens/CustomerDetailScreen').CustomerDetailScreen}
        options={{ title: 'Customer' }}
      />
      <ProfileStack.Screen
        name="Referrals"
        getComponent={() => require('@/features/referrals/screens/ReferralsScreen').ReferralsScreen}
        options={{ title: 'Referrals' }}
      />
      <ProfileStack.Screen
        name="CreateReferral"
        getComponent={() => require('@/features/referrals/screens/CreateReferralScreen').CreateReferralScreen}
        options={{ title: 'New Referral' }}
      />
      <ProfileStack.Screen
        name="ReferralAnalytics"
        getComponent={() => require('@/features/referrals/screens/ReferralAnalyticsScreen').ReferralAnalyticsScreen}
        options={{ title: 'Referral Analytics' }}
      />
      <ProfileStack.Screen
        name="Support"
        getComponent={() => require('@/features/support/screens/SupportScreen').SupportScreen}
        options={{ title: 'Support' }}
      />
      <ProfileStack.Screen
        name="CreateTicket"
        getComponent={() => require('@/features/support/screens/CreateTicketScreen').CreateTicketScreen}
        options={{ title: 'New Ticket' }}
      />
      <ProfileStack.Screen
        name="TicketDetail"
        getComponent={() => require('@/features/support/screens/TicketDetailScreen').TicketDetailScreen}
        options={{ title: 'Ticket' }}
      />
      <ProfileStack.Screen
        name="TicketFeedback"
        getComponent={() => require('@/features/support/screens/FeedbackScreen').FeedbackScreen}
        options={{ title: 'Feedback' }}
      />
      <ProfileStack.Screen
        name="Settings"
        getComponent={() => require('@/features/settings/screens/SettingsScreen').SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </ProfileStack.Navigator>
  );
}

export function MainTabNavigator() {
  const { colors } = useAppTheme();
  const { isDesktop } = useResponsiveLayout();

  return (
    <Tab.Navigator
      tabBar={isDesktop ? (props) => <PartnerDesktopTabBar {...props} /> : undefined}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarPosition: isDesktop ? 'left' : 'bottom',
        tabBarStyle: isDesktop
          ? {
              backgroundColor: 'transparent',
              borderTopWidth: 0,
              elevation: 0,
              shadowOpacity: 0,
            }
          : {
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
          const icons: Record<
            string,
            { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }
          > = {
            Home: { active: 'home', inactive: 'home-outline' },
            Academy: { active: 'school', inactive: 'school-outline' },
            Leads: { active: 'people', inactive: 'people-outline' },
            Applications: { active: 'document-text', inactive: 'document-text-outline' },
            Commissions: { active: 'wallet', inactive: 'wallet-outline' },
            Profile: { active: 'person', inactive: 'person-outline' },
          };
          const icon = icons[route.name] ?? { active: 'ellipse', inactive: 'ellipse-outline' };
          return <Ionicons name={focused ? icon.active : icon.inactive} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStackNavigator} options={{ title: 'Home' }} />
      <Tab.Screen name="Academy" component={AcademyStackNavigator} options={{ title: 'Academy' }} />
      <Tab.Screen name="Leads" component={LeadsStackNavigator} options={{ title: 'Leads' }} />
      <Tab.Screen name="Applications" component={ApplicationsStackNavigator} options={{ title: 'Apps' }} />
      <Tab.Screen name="Commissions" component={CommissionsStackNavigator} options={{ title: 'Earnings' }} />
      <Tab.Screen name="Profile" component={ProfileStackNavigator} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}
