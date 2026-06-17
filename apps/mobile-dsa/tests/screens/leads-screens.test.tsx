import { render } from '@testing-library/react';

import { CreateLeadScreen } from '@/features/leads/screens/CreateLeadScreen';
import { LeadAnalyticsScreen } from '@/features/leads/screens/LeadAnalyticsScreen';
import { LeadDetailScreen } from '@/features/leads/screens/LeadDetailScreen';
import { LeadsListScreen } from '@/features/leads/screens/LeadsListScreen';

describe('DSA leads screens', () => {
  it('LeadsList renders', () => {
    expect(() => render(<LeadsListScreen />)).not.toThrow();
  });

  it('LeadDetail renders', () => {
    expect(() => render(<LeadDetailScreen />)).not.toThrow();
  });

  it('CreateLead renders', () => {
    expect(() => render(<CreateLeadScreen />)).not.toThrow();
  });

  it('LeadAnalytics renders', () => {
    expect(() => render(<LeadAnalyticsScreen />)).not.toThrow();
  });
});
