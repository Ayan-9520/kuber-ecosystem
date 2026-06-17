import { render } from '@testing-library/react';

import { CommissionAnalyticsScreen } from '@/features/commissions/screens/CommissionAnalyticsScreen';
import { CommissionsHomeScreen } from '@/features/commissions/screens/CommissionsHomeScreen';
import { PendingCommissionsScreen } from '@/features/commissions/screens/PendingCommissionsScreen';

describe('DSA commissions screens', () => {
  it('CommissionsHome renders', () => {
    expect(() => render(<CommissionsHomeScreen />)).not.toThrow();
  });

  it('PendingCommissions renders', () => {
    expect(() => render(<PendingCommissionsScreen />)).not.toThrow();
  });

  it('CommissionAnalytics renders', () => {
    expect(() => render(<CommissionAnalyticsScreen />)).not.toThrow();
  });
});
