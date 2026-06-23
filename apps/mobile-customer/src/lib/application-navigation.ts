import { CommonActions, type NavigationProp } from '@react-navigation/native';

import { wizardParamsFromProduct } from './product-display';
import type { ProductDisplayItem } from './product-mapper';

/** Navigate from any tab to the application wizard (works on native + web). */
export function navigateToApplicationWizard(
  navigation: NavigationProp<Record<string, unknown>>,
  product: ProductDisplayItem,
) {
  const params = wizardParamsFromProduct(product);
  const parent = navigation.getParent();

  if (parent) {
    parent.navigate('Applications', {
      screen: 'ApplicationWizard',
      params,
    } as never);
    return;
  }

  navigation.dispatch(
    CommonActions.navigate({
      name: 'Applications',
      params: { screen: 'ApplicationWizard', params },
    } as Parameters<typeof CommonActions.navigate>[0]),
  );
}

export type { ProductDisplayItem };
