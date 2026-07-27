import type { LinkingOptions } from '@react-navigation/native';
import { Platform } from 'react-native';

import type { RootStackParamList } from './types';

import { getWebHostname } from '@/lib/webStorage';

function webDevPrefixes(port: string): string[] {
  if (Platform.OS !== 'web') return [];
  const host = getWebHostname() ?? 'localhost';
  return [`http://${host}:${port}`, `http://127.0.0.1:${port}`];
}

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [
    'kuberone://',
    'kuberone-dsa://',
    'https://dsa.kuberone.com',
    ...webDevPrefixes('8082'),
    ...webDevPrefixes('8083'),
  ],
  config: {
    screens: {
      Onboarding: 'Onboarding',
      Main: {
        screens: {
          Academy: {
            path: 'academy',
            screens: {
              AcademyHome: '',
              AcademyModule: ':moduleId',
            },
          },
          Leads: {
            screens: {
              LeadDetail: 'leads/:id',
            },
          },
          Applications: {
            screens: {
              ApplicationDetail: 'applications/:id',
            },
          },
          Commissions: {
            path: 'earnings',
            screens: {
              CommissionsHome: '',
              PartnerLoanCases: 'loan-cases',
              RaiseInvoice: 'raise-invoice',
              InvoiceTracker: 'invoices',
              PayoutHistory: 'payouts',
              CommissionLedger: 'ledger',
              CommissionTracker: 'tracker',
              EarningsDashboard: 'dashboard',
              // Legacy URLs redirect inside the screens
              PartnerBankRecon: 'bank-reconciliation',
              PartnerDrde: 'revenue-distribution',
            },
          },
          Profile: {
            screens: {
              TicketDetail: 'support/tickets/:id',
              CustomerDetail: 'customers/:id',
            },
          },
        },
      },
      Auth: {
        screens: {
          OtpLogin: 'login',
        },
      },
    },
  },
};
