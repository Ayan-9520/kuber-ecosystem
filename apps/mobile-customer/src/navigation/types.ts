import { type NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  OtpLogin: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ProfileCompletion: undefined;
};

export type HomeStackParamList = {
  Dashboard: undefined;
  Eligibility: undefined;
  EmiCalculator: undefined;
  Notifications: undefined;
  Referrals: undefined;
  AiAdvisor: undefined;
  VoiceAi: undefined;
  Recommendations: undefined;
};

export type ApplicationsStackParamList = {
  ApplicationsList: undefined;
  ApplicationDetail: { id: string };
  ApplicationWizard: { productSlug?: string; productName?: string; variant?: string };
};

export type ProductsStackParamList = {
  ProductsList: undefined;
  ProductDetail: { slug: string; name: string; variant: string };
};

export type SupportStackParamList = {
  SupportHome: undefined;
  TicketDetail: { id: string };
  CreateTicket: undefined;
  TicketFeedback: { id: string };
};

export type ProfileStackParamList = {
  ProfileHome: undefined;
  Kyc: undefined;
  Documents: undefined;
  Settings: undefined;
  EditProfile: undefined;
};

export type MainTabParamList = {
  Home: NavigatorScreenParams<HomeStackParamList>;
  Applications: NavigatorScreenParams<ApplicationsStackParamList>;
  Products: NavigatorScreenParams<ProductsStackParamList>;
  Support: NavigatorScreenParams<SupportStackParamList>;
  Profile: NavigatorScreenParams<ProfileStackParamList>;
};

export type RootStackParamList = {
  Onboarding: undefined;
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
};
