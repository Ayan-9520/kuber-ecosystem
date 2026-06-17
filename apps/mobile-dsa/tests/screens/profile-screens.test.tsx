import { render, screen } from '@testing-library/react';

import { ThemeAppearanceCard } from '@/components/ThemeAppearanceCard';
import { CustomersListScreen } from '@/features/profile/screens/CustomersListScreen';
import { DocumentsScreen } from '@/features/profile/screens/DocumentsScreen';
import { ProfileScreen } from '@/features/profile/screens/ProfileScreen';
import { SettingsScreen } from '@/features/settings/screens/SettingsScreen';
import { UploadDocumentScreen } from '@/features/profile/screens/UploadDocumentScreen';

describe('DSA profile & documents', () => {
  it('Profile renders', () => {
    expect(() => render(<ProfileScreen />)).not.toThrow();
  });

  it('CustomersList renders', () => {
    expect(() => render(<CustomersListScreen />)).not.toThrow();
  });

  it('Documents renders', () => {
    expect(() => render(<DocumentsScreen />)).not.toThrow();
  });

  it('UploadDocument renders', () => {
    expect(() => render(<UploadDocumentScreen />)).not.toThrow();
  });

  it('Settings renders', () => {
    expect(() => render(<SettingsScreen />)).not.toThrow();
  });

  it('Theme options', () => {
    render(<ThemeAppearanceCard />);
    expect(screen.getByText('Light')).toBeTruthy();
    expect(screen.getByText('Dark')).toBeTruthy();
  });
});
