import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';

import { EmptyState, Screen } from '@/components/ui';
import type { CommissionsStackParamList } from '@/navigation/types';

/**
 * Legacy deep-link target. Partners must not use DRDE — redirect to payout request.
 */
export function PartnerDrdeScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<CommissionsStackParamList>>();

  useEffect(() => {
    navigation.replace('RaiseInvoice');
  }, [navigation]);

  return (
    <Screen>
      <EmptyState
        title="Opening request payout"
        description="Revenue rules are managed by finance. Partners request payout from calculated commissions."
      />
    </Screen>
  );
}
