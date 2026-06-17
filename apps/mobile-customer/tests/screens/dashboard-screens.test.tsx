import { render, screen } from '@testing-library/react';

import { DashboardScreen } from '@/features/dashboard/screens/DashboardScreen';

describe('Customer dashboard screen', () => {
  it('Dashboard — renders premium header and quick actions', () => {
    render(<DashboardScreen />);
    expect(screen.getByText('Quick actions')).toBeTruthy();
    expect(screen.getByText('Overview')).toBeTruthy();
    expect(screen.getByText('Eligibility')).toBeTruthy();
  });
});
