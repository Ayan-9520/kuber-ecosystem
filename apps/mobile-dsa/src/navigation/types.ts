import { type NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  OtpLogin: undefined;
  PartnerRegister: undefined;
  PartnerKyc: undefined;
};

export type HomeStackParamList = {
  Dashboard: undefined;
  Notifications: undefined;
  CommunicationHistory: undefined;
  AiAdvisor: undefined;
  VoiceAi: undefined;
};

export type LeadsStackParamList = {
  LeadsList: undefined;
  LeadDetail: { id: string };
  CreateLead: undefined;
  EditLead: { id: string };
  LeadAnalytics: undefined;
};

export type ApplicationsStackParamList = {
  ApplicationsList: undefined;
  ApplicationDetail: { id: string };
};

export type CommissionsStackParamList = {
  CommissionsHome: undefined;
  CommissionLedger: undefined;
  CommissionPayments: undefined;
  PendingCommissions: undefined;
  CommissionRecoveries: undefined;
  CommissionAnalytics: undefined;
};

export type ProfileStackParamList = {
  ProfileHome: undefined;
  BankAccount: undefined;
  PartnerKycStatus: undefined;
  Documents: undefined;
  UploadDocument: undefined;
  DocumentDeficiencies: undefined;
  CustomersList: undefined;
  CustomerDetail: { id: string };
  Referrals: undefined;
  CreateReferral: undefined;
  ReferralAnalytics: undefined;
  Support: undefined;
  CreateTicket: undefined;
  TicketDetail: { id: string };
  TicketFeedback: { id: string };
  Settings: undefined;
};

export type MainTabParamList = {
  Home: NavigatorScreenParams<HomeStackParamList>;
  Leads: NavigatorScreenParams<LeadsStackParamList>;
  Applications: NavigatorScreenParams<ApplicationsStackParamList>;
  Commissions: NavigatorScreenParams<CommissionsStackParamList>;
  Profile: NavigatorScreenParams<ProfileStackParamList>;
};

export type RootStackParamList = {
  Onboarding: undefined;
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
};
