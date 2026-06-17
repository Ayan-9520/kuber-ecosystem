import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

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

describe('Customer Button', () => {
  it('renders title', () => {
    render(<Button title="Apply Now" />);
    expect(screen.getByText('Apply Now')).toBeTruthy();
  });

  it('handles press', () => {
    const onPress = jest.fn();
    render(<Button title="Continue" onPress={onPress} />);
    fireEvent.click(screen.getByText('Continue'));
    expect(onPress).toHaveBeenCalled();
  });
});
