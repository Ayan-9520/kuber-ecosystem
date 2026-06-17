import { render, screen } from '@testing-library/react';

import { CreateTicketScreen } from '@/features/support/screens/CreateTicketScreen';
import { FeedbackScreen } from '@/features/support/screens/FeedbackScreen';
import { SupportScreen } from '@/features/support/screens/SupportScreen';
import { TicketDetailScreen } from '@/features/support/screens/TicketDetailScreen';

jest.mock('@/services', () => ({
  supportService: {
    list: jest.fn(),
    getById: jest.fn(async () => ({ id: 't1', subject: 'Test ticket', status: 'OPEN', messages: [] })),
    create: jest.fn(),
    submitFeedback: jest.fn(),
    categories: jest.fn(async () => []),
  },
}));

describe('Customer support screens', () => {
  it('Support — help center', () => {
    render(<SupportScreen />);
    expect(screen.getByText('Support Overview')).toBeTruthy();
  });

  it('CreateTicket — new ticket form', () => {
    render(<CreateTicketScreen />);
    expect(screen.getByText('Tell us how we can help')).toBeTruthy();
  });

  it('TicketDetail — ticket view renders', () => {
    const { container } = render(<TicketDetailScreen />);
    expect(container).toBeTruthy();
  });

  it('Feedback — rating screen', () => {
    render(<FeedbackScreen />);
    expect(screen.getByText('Rate Support')).toBeTruthy();
  });
});
