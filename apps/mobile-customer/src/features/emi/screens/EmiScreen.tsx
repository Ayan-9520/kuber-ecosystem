import { Ionicons } from '@expo/vector-icons';
import {
  buildAmortizationYearSummary,
  buildEmiBreakdown,
  tenureMonthsFromParts,
} from '@kuberone/shared-utils';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button, Card, Input, Screen } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import { radius, spacing, typography } from '@/theme';
import { type AppColors, useAppTheme } from '@/theme/ThemeProvider';

const TENURE_PRESETS = [
  { label: '5Y', years: 5, months: 0 },
  { label: '10Y', years: 10, months: 0 },
  { label: '15Y', years: 15, months: 0 },
  { label: '20Y', years: 20, months: 0 },
  { label: '25Y', years: 25, months: 0 },
  { label: '30Y', years: 30, months: 0 },
] as const;

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    hint: { ...typography.bodySm, color: colors.textMuted, marginBottom: spacing.md },
    presetRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
    presetChip: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.full,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    presetChipActive: { borderColor: colors.primary, backgroundColor: `${colors.primary}18` },
    presetText: { ...typography.label, color: colors.textSecondary, fontSize: 12 },
    presetTextActive: { color: colors.primary },
    tenureRow: { flexDirection: 'row', gap: spacing.md },
    tenureField: { flex: 1 },
    errorText: { ...typography.bodySm, color: colors.danger, marginBottom: spacing.sm },
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
    methodNote: {
      ...typography.caption,
      color: colors.textMuted,
      textAlign: 'center',
      marginTop: spacing.sm,
    },
  });
}

export function EmiScreen() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [loanAmount, setLoanAmount] = useState('2500000');
  const [interestRate, setInterestRate] = useState('9.5');
  const [tenureYears, setTenureYears] = useState('20');
  const [tenureMonthsExtra, setTenureMonthsExtra] = useState('0');
  const [processingFee, setProcessingFee] = useState('0');
  const [showResult, setShowResult] = useState(false);
  const [error, setError] = useState('');

  const result = useMemo(() => {
    if (!showResult) return null;

    const amount = Number(loanAmount.replace(/,/g, ''));
    const rate = Number(interestRate);
    const tenure = tenureMonthsFromParts(Number(tenureYears), Number(tenureMonthsExtra));
    const fee = Number(processingFee.replace(/,/g, '') || 0);

    if (!Number.isFinite(amount) || amount <= 0) return null;
    if (!Number.isFinite(rate) || rate < 0) return null;
    if (tenure <= 0) return null;

    const breakdown = buildEmiBreakdown(amount, rate, tenure, fee);
    const amortizationSummary = buildAmortizationYearSummary(amount, rate, tenure);

    return { ...breakdown, tenureMonths: tenure, amortizationSummary };
  }, [showResult, loanAmount, interestRate, tenureYears, tenureMonthsExtra, processingFee]);

  const handleCalculate = () => {
    const amount = Number(loanAmount.replace(/,/g, ''));
    const rate = Number(interestRate);
    const tenure = tenureMonthsFromParts(Number(tenureYears), Number(tenureMonthsExtra));

    if (!Number.isFinite(amount) || amount <= 0) {
      setError('Enter a valid loan amount');
      setShowResult(false);
      return;
    }
    if (!Number.isFinite(rate) || rate < 0 || rate > 100) {
      setError('Enter interest rate between 0 and 100%');
      setShowResult(false);
      return;
    }
    if (tenure <= 0 || tenure > 480) {
      setError('Tenure must be between 1 month and 40 years');
      setShowResult(false);
      return;
    }

    setError('');
    setShowResult(true);
  };

  const applyPreset = (years: number, months: number) => {
    setTenureYears(String(years));
    setTenureMonthsExtra(String(months));
    setShowResult(false);
  };

  const activePreset = TENURE_PRESETS.find(
    (p) => p.years === Number(tenureYears) && p.months === Number(tenureMonthsExtra),
  )?.label;

  return (
    <Screen title="EMI Calculator" subtitle="Reducing balance · Indian standard formula">
      <Text style={styles.hint}>
        Same method used by HDFC, SBI & NBFC apps — monthly rest, EMI rounded to nearest rupee.
      </Text>

      <Card title="Loan Details">
        <Input
          label="Loan Amount (₹)"
          value={loanAmount}
          onChangeText={(v) => {
            setLoanAmount(v);
            setShowResult(false);
          }}
          keyboardType="numeric"
          placeholder="e.g. 2500000"
        />
        <Input
          label="Interest Rate (% p.a.)"
          value={interestRate}
          onChangeText={(v) => {
            setInterestRate(v);
            setShowResult(false);
          }}
          keyboardType="decimal-pad"
          placeholder="e.g. 9.5"
        />

        <Text style={[styles.summaryLabel, { marginBottom: spacing.sm }]}>Quick tenure</Text>
        <View style={styles.presetRow}>
          {TENURE_PRESETS.map((preset) => (
            <Pressable
              key={preset.label}
              style={[styles.presetChip, activePreset === preset.label && styles.presetChipActive]}
              onPress={() => applyPreset(preset.years, preset.months)}
            >
              <Text style={[styles.presetText, activePreset === preset.label && styles.presetTextActive]}>
                {preset.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.tenureRow}>
          <View style={styles.tenureField}>
            <Input
              label="Tenure (years)"
              value={tenureYears}
              onChangeText={(v) => {
                setTenureYears(v);
                setShowResult(false);
              }}
              keyboardType="numeric"
              placeholder="20"
            />
          </View>
          <View style={styles.tenureField}>
            <Input
              label="Extra months"
              value={tenureMonthsExtra}
              onChangeText={(v) => {
                setTenureMonthsExtra(v);
                setShowResult(false);
              }}
              keyboardType="numeric"
              placeholder="0"
            />
          </View>
        </View>

        <Input
          label="Processing Fee (₹) — optional"
          value={processingFee}
          onChangeText={(v) => {
            setProcessingFee(v);
            setShowResult(false);
          }}
          keyboardType="numeric"
          placeholder="0"
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Button
          title="Calculate EMI"
          fullWidth
          onPress={handleCalculate}
          icon={<Ionicons name="calculator-outline" size={18} color={colors.onPrimary} />}
        />
      </Card>

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
              <Text style={styles.summaryLabel}>Total Cost (incl. fee)</Text>
              <Text style={styles.summaryValueSm}>{formatCurrency(result.totalCost)}</Text>
            </View>
          </View>

          <Card title="Loan Summary" elevated>
            <View style={styles.summaryRow}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Principal</Text>
                <Text style={styles.summaryValueSm}>{formatCurrency(result.principal)}</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Tenure</Text>
                <Text style={styles.summaryValueSm}>
                  {Math.floor(result.tenureMonths / 12)}Y {result.tenureMonths % 12}M
                </Text>
              </View>
            </View>
          </Card>

          {result.amortizationSummary.length > 0 && (
            <Card title="Year-wise Breakdown" subtitle="Principal vs interest per year" elevated>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableCell, styles.tableHeaderText, styles.yearCol]}>Year</Text>
                <Text style={[styles.tableCell, styles.tableHeaderText]}>Principal</Text>
                <Text style={[styles.tableCell, styles.tableHeaderText]}>Interest</Text>
                <Text style={[styles.tableCell, styles.tableHeaderText]}>Balance</Text>
              </View>
              {result.amortizationSummary.map((row) => (
                <View key={row.year} style={styles.tableRow}>
                  <Text style={[styles.tableCell, styles.yearCol, styles.tableData]}>{row.year}</Text>
                  <Text style={[styles.tableCell, styles.tableData]}>{formatCurrency(row.principalPaid)}</Text>
                  <Text style={[styles.tableCell, styles.tableData]}>{formatCurrency(row.interestPaid)}</Text>
                  <Text style={[styles.tableCell, styles.tableData]}>{formatCurrency(row.outstandingBalance)}</Text>
                </View>
              ))}
            </Card>
          )}

          <Text style={styles.methodNote}>
            Reducing balance · Monthly rest · Last EMI adjusted to clear outstanding
          </Text>
        </>
      )}
    </Screen>
  );
}
