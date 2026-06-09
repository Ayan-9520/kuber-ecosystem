import type { LinkingOptions } from '@react-navigation/native';

import type { RootStackParamList } from './types';

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['kuberone://', 'https://app.kuberone.com'],
  config: {
    screens: {
      Main: {
        screens: {
          Applications: {
            screens: {
              ApplicationDetail: 'applications/:id',
            },
          },
          Products: {
            screens: {
              ProductDetail: 'products/:slug',
            },
          },
          Support: {
            screens: {
              TicketDetail: 'support/tickets/:id',
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
