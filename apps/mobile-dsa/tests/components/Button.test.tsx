import React from 'react';
import { render, screen } from '@testing-library/react';

import { Button } from '@/components/ui/Button';

jest.mock('@/theme/ThemeProvider', () => ({
  useAppTheme: () => ({
    colors: {
      primary: '#0057ff',
      onPrimary: '#ffffff',
      surfaceHover: '#f5f5f5',
      border: '#ddd',
      text: '#111',
      danger: '#dc2626',
    },
  }),
}));

describe('DSA Button', () => {
  it('renders commission action', () => {
    render(<Button title="View Commissions" />);
    expect(screen.getByText('View Commissions')).toBeTruthy();
  });
});
