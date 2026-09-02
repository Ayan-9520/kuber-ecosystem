import type { Ionicons } from '@expo/vector-icons';

import type { ProfileStackParamList } from './types';

export type PartnerSidebarAccountItem = {
  label: string;
  screen: keyof ProfileStackParamList;
  icon: keyof typeof Ionicons.glyphMap;
  iconOutline: keyof typeof Ionicons.glyphMap;
};

/** Account & compliance — desktop sidebar (real partner portal pattern). */
export const PARTNER_SIDEBAR_ACCOUNT_NAV: PartnerSidebarAccountItem[] = [
  { label: 'Documents', screen: 'Documents', icon: 'folder', iconOutline: 'folder-outline' },
  { label: 'KYC Status', screen: 'PartnerKycStatus', icon: 'shield-checkmark', iconOutline: 'shield-checkmark-outline' },
  { label: 'Bank Account', screen: 'BankAccount', icon: 'card', iconOutline: 'card-outline' },
  { label: 'My Brand', screen: 'BrandingDashboard', icon: 'ribbon', iconOutline: 'ribbon-outline' },
  { label: 'Referrals', screen: 'Referrals', icon: 'gift', iconOutline: 'gift-outline' },
  { label: 'Support', screen: 'Support', icon: 'headset', iconOutline: 'headset-outline' },
  { label: 'Settings', screen: 'Settings', icon: 'settings', iconOutline: 'settings-outline' },
];

/** Mobile profile — compact menu when sidebar is hidden. */
export const PARTNER_MOBILE_PROFILE_MENU: PartnerSidebarAccountItem[] = [
  ...PARTNER_SIDEBAR_ACCOUNT_NAV,
  { label: 'Customers', screen: 'CustomersList', icon: 'people', iconOutline: 'people-outline' },
];
