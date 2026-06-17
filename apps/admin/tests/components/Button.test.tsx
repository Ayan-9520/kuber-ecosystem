import { fireEvent, screen } from '@testing-library/react';

import { Button } from '@/components/ui/Button';
import { renderWithProviders } from '../utils/render';

describe('Admin Button', () => {
  it('renders children', () => {
    renderWithProviders(<Button>Save</Button>);
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('applies variant class', () => {
    renderWithProviders(<Button variant="danger">Delete</Button>);
    expect(screen.getByRole('button')).toHaveClass('btn-danger');
  });

  it('disables when loading', () => {
    renderWithProviders(<Button loading>Submit</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('handles click', () => {
    const onClick = vi.fn();
    renderWithProviders(<Button onClick={onClick}>Click</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
