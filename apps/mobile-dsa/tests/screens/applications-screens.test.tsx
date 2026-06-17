import { render, screen } from '@testing-library/react';

import { ApplicationDetailScreen } from '@/features/applications/screens/ApplicationDetailScreen';
import { ApplicationsListScreen } from '@/features/applications/screens/ApplicationsListScreen';

describe('DSA applications screens', () => {
  it('ApplicationsList', () => {
    render(<ApplicationsListScreen />);
    expect(screen.getAllByText(/Applications/i).length).toBeGreaterThan(0);
  });

  it('ApplicationDetail renders', () => {
    const { container } = render(<ApplicationDetailScreen />);
    expect(container).toBeTruthy();
  });
});
