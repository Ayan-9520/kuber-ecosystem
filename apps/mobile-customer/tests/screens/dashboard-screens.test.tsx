import { screen } from '@testing-library/react';

import { DashboardScreen } from '@/features/dashboard/screens/DashboardScreen';
import { renderWithProviders } from '../utils/render';

describe('Customer dashboard screen', () => {
  it('Dashboard — renders premium header and quick actions', () => {
    renderWithProviders(<DashboardScreen />);
    expect(screen.getByText('Quick actions')).toBeTruthy();
    expect(screen.getByText('Overview')).toBeTruthy();
    expect(screen.getByText('Eligibility')).toBeTruthy();
  });
});
