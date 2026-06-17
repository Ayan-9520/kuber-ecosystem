import { render, screen } from '@testing-library/react';

import { StatusBadge } from '@/components/ui/StatusBadge';

describe('Customer StatusBadge', () => {
  it('renders sanctioned status', () => {
    render(<StatusBadge status="SANCTIONED" />);
    expect(screen.getByText(/sanctioned/i)).toBeTruthy();
  });

  it('renders unknown status gracefully', () => {
    render(<StatusBadge status="CUSTOM_STATUS" />);
    expect(screen.getByText(/custom status/i)).toBeTruthy();
  });
});
