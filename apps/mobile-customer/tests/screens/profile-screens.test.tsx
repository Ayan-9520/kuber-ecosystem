import { render, screen, fireEvent } from '@testing-library/react';

import { ThemeAppearanceCard } from '@/components/ThemeAppearanceCard';
import { EditProfileScreen } from '@/features/profile/screens/EditProfileScreen';
import { KycScreen } from '@/features/kyc/screens/KycScreen';
import { ProfileScreen } from '@/features/profile/screens/ProfileScreen';
import { SettingsScreen } from '@/features/settings/screens/SettingsScreen';

jest.mock('@/services', () => ({
  customerService: { getProfile: jest.fn(), updateProfile: jest.fn() },
  notificationsService: { getPreferences: jest.fn(), updatePreferences: jest.fn() },
}));

describe('Customer profile & settings screens', () => {
  it('Profile — user profile', () => {
    render(<ProfileScreen />);
    expect(screen.getByText('Edit Profile')).toBeTruthy();
  });

  it('EditProfile — edit form', () => {
    render(<EditProfileScreen />);
    expect(screen.getAllByText(/Edit Profile/i).length).toBeGreaterThan(0);
  });

  it('Settings — app settings', () => {
    render(<SettingsScreen />);
    expect(screen.getByText('Notification Preferences')).toBeTruthy();
  });

  it('Kyc — verification screen', () => {
    render(<KycScreen />);
    expect(screen.getByText('KYC Verification')).toBeTruthy();
  });

  it('Theme — shows light, dark and system options', () => {
    render(<ThemeAppearanceCard />);
    expect(screen.getByText('Light')).toBeTruthy();
    expect(screen.getByText('Dark')).toBeTruthy();
    expect(screen.getByText('System')).toBeTruthy();
    fireEvent.click(screen.getByText('Dark'));
  });
});
