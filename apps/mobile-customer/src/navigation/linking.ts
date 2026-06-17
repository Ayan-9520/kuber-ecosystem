import type { LinkingOptions } from '@react-navigation/native';

import type { ProductsStackParamList, RootStackParamList } from './types';

import { resolveProductFromApi } from '@/lib/product-mapper';

/** Resolves deep-link ProductDetail params when only slug or id is present. */
export async function resolveProductDetailLinkParams(
  params: ProductsStackParamList['ProductDetail'],
): Promise<ProductsStackParamList['ProductDetail']> {
  if (params.name && params.slug && params.variant) {
    return params;
  }

  const resolved = await resolveProductFromApi({
    id: params.id,
    slug: params.slug,
    variant: params.variant,
  });

  if (!resolved) return params;

  return {
    id: resolved.productId,
    slug: resolved.slug,
    name: resolved.name,
    variant: resolved.variant,
  };
}

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
              ProductDetail: {
                path: 'products/:slug',
                parse: {
                  slug: (slug: string) => decodeURIComponent(slug),
                },
              },
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
