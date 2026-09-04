import type { Ionicons } from '@expo/vector-icons';

import type { ProfileStackParamList } from './types';

export type CustomerSidebarAccountItem = {
  label: string;
  screen: keyof ProfileStackParamList;
  icon: keyof typeof Ionicons.glyphMap;
  iconOutline: keyof typeof Ionicons.glyphMap;
  subtitle?: string;
};

/** Account — desktop sidebar (real customer portal pattern). */
export const CUSTOMER_SIDEBAR_ACCOUNT_NAV: CustomerSidebarAccountItem[] = [
  { label: 'KYC Verification', screen: 'Kyc', icon: 'shield-checkmark', iconOutline: 'shield-checkmark-outline' },
  { label: 'Documents', screen: 'Documents', icon: 'folder', iconOutline: 'folder-outline' },
  { label: 'Edit Profile', screen: 'EditProfile', icon: 'create', iconOutline: 'create-outline' },
  { label: 'Settings', screen: 'Settings', icon: 'settings', iconOutline: 'settings-outline' },
];

/** Mobile profile — compact menu when sidebar is hidden. */
export const CUSTOMER_MOBILE_PROFILE_MENU: CustomerSidebarAccountItem[] = [
  {
    label: 'KYC Verification',
    screen: 'Kyc',
    icon: 'shield-checkmark',
    iconOutline: 'shield-checkmark-outline',
    subtitle: 'PAN & Aadhaar',
  },
  {
    label: 'Documents',
    screen: 'Documents',
    icon: 'folder-open',
    iconOutline: 'folder-outline',
    subtitle: 'Upload & track',
  },
  {
    label: 'Settings',
    screen: 'Settings',
    icon: 'settings-outline',
    iconOutline: 'settings-outline',
    subtitle: 'Theme & notifications',
  },
  {
    label: 'Edit Profile',
    screen: 'EditProfile',
    icon: 'create-outline',
    iconOutline: 'create-outline',
    subtitle: 'Name & email',
  },
];
