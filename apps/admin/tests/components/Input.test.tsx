import { screen } from '@testing-library/react';

import { Input } from '@/components/ui/Input';
import { renderWithProviders } from '../utils/render';

describe('Admin Input', () => {
  it('renders label and input', () => {
    renderWithProviders(<Input label="Search" placeholder="Type here" />);
    expect(screen.getByLabelText('Search')).toBeInTheDocument();
  });

  it('shows validation error', () => {
    renderWithProviders(<Input label="Email" error="Required field" />);
    expect(screen.getByText('Required field')).toBeInTheDocument();
  });
});
