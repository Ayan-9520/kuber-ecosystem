import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';

import { EmptyState, Screen } from '@/components/ui';
import type { CommissionsStackParamList } from '@/navigation/types';

/**
 * Legacy deep-link target. Bank recon is finance-only — redirect to invoices.
 */
export function PartnerBankReconScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<CommissionsStackParamList>>();

  useEffect(() => {
    navigation.replace('InvoiceTracker');
  }, [navigation]);

  return (
    <Screen>
      <EmptyState
        title="Opening invoices"
        description="Bank commission reconciliation is an internal finance tool. Track your payouts under Invoices."
      />
    </Screen>
  );
}
