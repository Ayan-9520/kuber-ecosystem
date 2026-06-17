import { render, screen } from '@testing-library/react';

import { DashboardScreen } from '@/features/dashboard/screens/DashboardScreen';

describe('DSA dashboard', () => {
  it('renders command center header and pipeline', () => {
    render(<DashboardScreen />);
    expect(screen.getByText('Quick actions')).toBeTruthy();
    expect(screen.getByText('Pipeline overview')).toBeTruthy();
    expect(screen.getByText('New Lead')).toBeTruthy();
  });
});
