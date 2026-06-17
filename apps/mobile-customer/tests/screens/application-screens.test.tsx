import { render, screen } from '@testing-library/react';

import { ApplicationDetailScreen } from '@/features/applications/screens/ApplicationDetailScreen';
import { ApplicationsScreen } from '@/features/applications/screens/ApplicationsScreen';
import { DocumentsScreen } from '@/features/documents/screens/DocumentsScreen';
import { NotificationsScreen } from '@/features/notifications/screens/NotificationsScreen';
import { ReferralsScreen } from '@/features/referrals/screens/ReferralsScreen';

jest.mock('@/services', () => ({
  applicationsService: { list: jest.fn(), getById: jest.fn() },
  documentsService: { list: jest.fn(), upload: jest.fn(), documentTypes: jest.fn(async () => []) },
  productsService: { list: jest.fn() },
  notificationsService: {
    list: jest.fn(),
    communicationLogs: jest.fn(),
    markRead: jest.fn(),
    markAllRead: jest.fn(),
  },
  referralsService: { list: jest.fn() },
}));

describe('Customer application flow screens', () => {
  it('Applications — lists applications', () => {
    render(<ApplicationsScreen />);
    expect(screen.getByText('My Applications')).toBeTruthy();
  });

  it('ApplicationDetail — shows detail shell', () => {
    render(<ApplicationDetailScreen />);
    expect(screen.getByText(/Application|Loading/i)).toBeTruthy();
  });

  it('Documents — upload section', () => {
    render(<DocumentsScreen />);
    expect(screen.getByText('Upload Document')).toBeTruthy();
  });

  it('Notifications — alerts screen', () => {
    render(<NotificationsScreen />);
    expect(screen.getByText('Inbox')).toBeTruthy();
  });

  it('Referrals — referral program', () => {
    render(<ReferralsScreen />);
    expect(screen.getByText('Invite friends & earn rewards')).toBeTruthy();
  });
});
