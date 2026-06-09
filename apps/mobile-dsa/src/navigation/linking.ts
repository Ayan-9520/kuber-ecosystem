import type { LinkingOptions } from '@react-navigation/native';

import type { RootStackParamList } from './types';

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['kuberone-dsa://', 'https://dsa.kuberone.com'],
  config: {
    screens: {
      Main: {
        screens: {
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
