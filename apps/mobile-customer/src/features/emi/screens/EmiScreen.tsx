import { Ionicons } from '@expo/vector-icons';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button, Card, Input, Screen } from '@/components/ui';
import { formatCurrency, getApiErrorMessage } from '@/lib/utils';
import { emiService } from '@/services';
import { colors, radius, spacing, typography } from '@/theme';

interface AmortizationYear {
  year: number;
  principalPaid: number;
  interestPaid: number;
  outstandingBalance: number;
}

interface EmiResult {
  emi?: number;
  interestPayable?: number;
  totalRepayment?: number;
  principal?: number;
  totalCost?: number;
  amortizationSummary?: AmortizationYear[];
}

export function EmiScreen() {
  const [loanAmount, setLoanAmount] = useState('2500000');
  const [interestRate, setInterestRate] = useState('9.5');
  const [tenureMonths, setTenureMonths] = useState('240');

  const mutation = useMutation({
    mutationFn: () =>
      emiService.calculate({
        loanAmount: Number(loanAmount),
        interestRate: Number(interestRate),
        tenureMonths: Number(tenureMonths),
        includeAmortization: true,
        persist: false,
      }),
  });

  const result = mutation.data as EmiResult | undefined;
  const amortization = result?.amortizationSummary ?? [];

  const handleCalculate = () => {
    const amount = Number(loanAmount);
    const rate = Number(interestRate);
    const tenure = Number(tenureMonths);
    if (amount <= 0 || rate < 0 || tenure <= 0) return;
    mutation.mutate();
  };

  return (
    <Screen title="EMI Calculator" subtitle="Plan your loan repayments">
      <Card title="Loan Parameters">
        <Input
          label="Loan Amount (₹)"
          value={loanAmount}
          onChangeText={setLoanAmount}
          keyboardType="numeric"
          placeholder="e.g. 2500000"
        />
        <Input
          label="Interest Rate (% p.a.)"
          value={interestRate}
          onChangeText={setInterestRate}
          keyboardType="decimal-pad"
          placeholder="e.g. 9.5"
        />
        <Input
          label="Tenure (months)"
          value={tenureMonths}
          onChangeText={setTenureMonths}
          keyboardType="numeric"
          placeholder="e.g. 240"
        />
        <Button
          title="Calculate EMI"
          fullWidth
          loading={mutation.isPending}
          onPress={handleCalculate}
        />
      </Card>

      {mutation.isError && (
        <Card>
          <View style={styles.errorRow}>
            <Ionicons name="alert-circle" size={20} color={colors.danger} />
            <Text style={styles.errorText}>{getApiErrorMessage(mutation.error)}</Text>
          </View>
        </Card>
      )}

      {result && (
        <>
          <View style={styles.summaryRow}>
            <View style={[styles.summaryCard, styles.summaryHighlight]}>
              <Text style={styles.summaryLabel}>Monthly EMI</Text>
              <Text style={styles.summaryValue}>{formatCurrency(result.emi)}</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Total Interest</Text>
              <Text style={styles.summaryValueSm}>{formatCurrency(result.interestPayable)}</Text>
            </View>
          </View>

          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Total Repayment</Text>
              <Text style={styles.summaryValueSm}>{formatCurrency(result.totalRepayment)}</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Principal</Text>
              <Text style={styles.summaryValueSm}>{formatCurrency(result.principal)}</Text>
            </View>
          </View>

          {amortization.length > 0 && (
            <Card title="Amortization Summary" subtitle="Year-wise breakdown">
              <View style={styles.tableHeader}>
                <Text style={[styles.tableCell, styles.tableHeaderText, styles.yearCol]}>Year</Text>
                <Text style={[styles.tableCell, styles.tableHeaderText]}>Principal</Text>
                <Text style={[styles.tableCell, styles.tableHeaderText]}>Interest</Text>
                <Text style={[styles.tableCell, styles.tableHeaderText]}>Balance</Text>
              </View>
              {amortization.map((row) => (
                <View key={row.year} style={styles.tableRow}>
                  <Text style={[styles.tableCell, styles.yearCol, styles.tableData]}>{row.year}</Text>
                  <Text style={[styles.tableCell, styles.tableData]}>{formatCurrency(row.principalPaid)}</Text>
                  <Text style={[styles.tableCell, styles.tableData]}>{formatCurrency(row.interestPaid)}</Text>
                  <Text style={[styles.tableCell, styles.tableData]}>{formatCurrency(row.outstandingBalance)}</Text>
                </View>
              ))}
            </Card>
          )}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  errorText: { ...typography.bodySm, color: colors.danger, flex: 1 },
  summaryRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  summaryHighlight: { borderColor: colors.primary },
  summaryLabel: { ...typography.caption, color: colors.textMuted, fontSize: 10 },
  summaryValue: { ...typography.h2, color: colors.primary, marginTop: 4 },
  summaryValueSm: { ...typography.h3, color: colors.text, marginTop: 4, fontSize: 16 },
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.xs,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tableCell: { flex: 1, ...typography.bodySm, color: colors.textSecondary, fontSize: 11 },
  tableHeaderText: { ...typography.caption, color: colors.textMuted, fontSize: 9 },
  tableData: { color: colors.text },
  yearCol: { flex: 0.6 },
});
