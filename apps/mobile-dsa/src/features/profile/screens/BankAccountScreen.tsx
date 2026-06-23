import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { StyleSheet, Text } from 'react-native';

import { Card, EmptyState, Screen } from '@/components/ui';
import { useAuth } from '@/hooks';
import { str } from '@/lib/utils';
import { partnersService } from '@/services';
import { type AppColors, useAppTheme } from '@/theme/ThemeProvider';
import { typography } from '@/theme';

export function BankAccountScreen() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { partnerId } = useAuth();

  const partner = useQuery({
    queryKey: ['partner-bank', partnerId],
    queryFn: () => partnersService.getById(partnerId!),
    enabled: !!partnerId,
    retry: false,
  });

  const bank = (partner.data?.metadata as Record<string, unknown> | undefined)?.bankAccount as
    | Record<string, unknown>
    | undefined;

  return (
    <Screen title="Bank Account" subtitle="Commission payout account">
      <Card>
        {partner.isError || !bank ? (
          <EmptyState
            title="Bank details not on file"
            description="Contact Kuber Finserve support to register your payout bank account for commission transfers."
          />
        ) : (
          <>
            <Text style={styles.label}>Account Holder</Text>
            <Text style={styles.value}>{str(bank.accountHolderName ?? partner.data?.contactName)}</Text>
            <Text style={styles.label}>Bank</Text>
            <Text style={styles.value}>{str(bank.bankName)}</Text>
            <Text style={styles.label}>Account Number</Text>
            <Text style={styles.value}>{str(bank.accountNumberMasked ?? bank.accountNumber)}</Text>
            <Text style={styles.label}>IFSC</Text>
            <Text style={styles.value}>{str(bank.ifscCode)}</Text>
          </>
        )}
      </Card>
    </Screen>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
  label: { ...typography.caption, color: colors.textMuted, marginTop: 12 },
  value: { ...typography.body, color: colors.text, fontWeight: '600' },
});
}
