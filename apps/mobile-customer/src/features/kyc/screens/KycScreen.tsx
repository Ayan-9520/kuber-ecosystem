import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button, Card, Input, Screen, StatusBadge } from '@/components/ui';
import { useAuth } from '@/hooks';
import { getApiErrorMessage, str } from '@/lib/utils';
import { kycService } from '@/services';
import { type AppColors, useAppTheme } from '@/theme/ThemeProvider';
import { radius, spacing, typography } from '@/theme';

type AadhaarStep = 'input' | 'otp' | 'done';

export function KycScreen() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const queryClient = useQueryClient();
  const { customerId } = useAuth();

  const [pan, setPan] = useState('');
  const [nameOnPan, setNameOnPan] = useState('');
  const [aadhaar, setAadhaar] = useState('');
  const [otp, setOtp] = useState('');
  const [aadhaarStep, setAadhaarStep] = useState<AadhaarStep>('input');
  const [panError, setPanError] = useState('');
  const [aadhaarError, setAadhaarError] = useState('');
  const [panSuccess, setPanSuccess] = useState('');
  const [aadhaarSuccess, setAadhaarSuccess] = useState('');

  const kycProfile = useQuery({
    queryKey: ['kyc-profile', customerId],
    queryFn: () => kycService.profile(customerId),
    enabled: !!customerId,
  });

  const panRecords = useQuery({
    queryKey: ['kyc-pan', customerId],
    queryFn: async () => {
      const result = await kycService.getPan(customerId);
      return Array.isArray(result) ? result : [result].filter(Boolean);
    },
    enabled: !!customerId,
  });

  const latestPan = panRecords.data?.[0];
  const panVerified = latestPan?.status === 'VERIFIED' || latestPan?.verified === true;
  const aadhaarVerified =
    kycProfile.data?.aadhaarVerified === true || kycProfile.data?.aadhaarStatus === 'VERIFIED';

  const submitPanMutation = useMutation({
    mutationFn: () =>
      kycService.submitPan({
        customerId,
        pan: pan.toUpperCase().trim(),
        nameOnPan: nameOnPan.trim() || undefined,
      }),
    onSuccess: async () => {
      setPanSuccess('PAN submitted successfully');
      setPanError('');
      setPan('');
      await queryClient.invalidateQueries({ queryKey: ['kyc-pan', customerId] });
      await queryClient.invalidateQueries({ queryKey: ['kyc-profile', customerId] });
    },
    onError: (e) => {
      setPanSuccess('');
      setPanError(getApiErrorMessage(e));
    },
  });

  const sendOtpMutation = useMutation({
    mutationFn: () =>
      kycService.sendAadhaarOtp({
        customerId,
        aadhaar: aadhaar.replace(/\D/g, ''),
      }),
    onSuccess: () => {
      setAadhaarStep('otp');
      setAadhaarError('');
      setAadhaarSuccess('OTP sent to Aadhaar-linked mobile');
    },
    onError: (e) => {
      setAadhaarError(getApiErrorMessage(e));
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: () =>
      kycService.verifyAadhaar({
        customerId,
        aadhaar: aadhaar.replace(/\D/g, ''),
        otp: otp.trim(),
      }),
    onSuccess: async () => {
      setAadhaarStep('done');
      setAadhaarSuccess('Aadhaar verified successfully');
      setAadhaarError('');
      await queryClient.invalidateQueries({ queryKey: ['kyc-profile', customerId] });
    },
    onError: (e) => {
      setAadhaarError(getApiErrorMessage(e));
    },
  });

  const overallStatus = str(kycProfile.data?.overallStatus ?? 'NOT_STARTED');

  return (
    <Screen title="KYC Verification" subtitle="Complete identity verification" loading={kycProfile.isLoading}>
      <Card title="Verification Status">
        <View style={styles.statusRow}>
          <StatusBadge status={overallStatus} />
          <Text style={styles.statusHint}>Required before loan submission</Text>
        </View>
      </Card>

      <Card title="PAN Verification" subtitle={panVerified ? 'Verified' : 'Submit your PAN details'}>
        {panVerified ? (
          <View style={styles.verifiedBox}>
            <Ionicons name="checkmark-circle" size={22} color={colors.success} />
            <View style={styles.verifiedText}>
              <Text style={styles.verifiedLabel}>PAN Verified</Text>
              <Text style={styles.verifiedMeta}>{str(latestPan?.pan ?? latestPan?.maskedPan)}</Text>
              {latestPan?.nameOnPan ? (
                <Text style={styles.verifiedMeta}>{str(latestPan.nameOnPan)}</Text>
              ) : null}
            </View>
          </View>
        ) : (
          <>
            {panError ? <Text style={styles.error}>{panError}</Text> : null}
            {panSuccess ? <Text style={styles.success}>{panSuccess}</Text> : null}
            <Input
              label="PAN Number"
              value={pan}
              onChangeText={(v) => setPan(v.toUpperCase())}
              autoCapitalize="characters"
              maxLength={10}
              placeholder="ABCDE1234F"
            />
            <Input
              label="Name on PAN"
              value={nameOnPan}
              onChangeText={setNameOnPan}
              autoCapitalize="words"
            />
            <Button
              title="Submit PAN"
              fullWidth
              loading={submitPanMutation.isPending}
              onPress={() => {
                setPanError('');
                setPanSuccess('');
                submitPanMutation.mutate();
              }}
              disabled={pan.trim().length !== 10}
            />
          </>
        )}
      </Card>

      <Card title="Aadhaar Verification" subtitle={aadhaarVerified ? 'Verified' : 'OTP-based e-KYC'}>
        {aadhaarVerified ? (
          <View style={styles.verifiedBox}>
            <Ionicons name="checkmark-circle" size={22} color={colors.success} />
            <View style={styles.verifiedText}>
              <Text style={styles.verifiedLabel}>Aadhaar Verified</Text>
              <Text style={styles.verifiedMeta}>
                {str(kycProfile.data?.maskedAadhaar ?? 'XXXX XXXX XXXX')}
              </Text>
            </View>
          </View>
        ) : aadhaarStep === 'done' ? (
          <Text style={styles.success}>{aadhaarSuccess}</Text>
        ) : (
          <>
            {aadhaarError ? <Text style={styles.error}>{aadhaarError}</Text> : null}
            {aadhaarSuccess && aadhaarStep === 'otp' ? (
              <Text style={styles.success}>{aadhaarSuccess}</Text>
            ) : null}

            {aadhaarStep === 'input' ? (
              <>
                <Input
                  label="Aadhaar Number"
                  value={aadhaar}
                  onChangeText={(v) => setAadhaar(v.replace(/\D/g, '').slice(0, 12))}
                  keyboardType="number-pad"
                  maxLength={12}
                  placeholder="12-digit Aadhaar"
                />
                <Button
                  title="Send OTP"
                  fullWidth
                  loading={sendOtpMutation.isPending}
                  onPress={() => {
                    setAadhaarError('');
                    setAadhaarSuccess('');
                    sendOtpMutation.mutate();
                  }}
                  disabled={aadhaar.replace(/\D/g, '').length !== 12}
                />
              </>
            ) : (
              <>
                <Text style={styles.otpHint}>Enter the 6-digit OTP sent to your registered mobile</Text>
                <Input
                  label="OTP"
                  value={otp}
                  onChangeText={(v) => setOtp(v.replace(/\D/g, '').slice(0, 6))}
                  keyboardType="number-pad"
                  maxLength={6}
                />
                <Button
                  title="Verify Aadhaar"
                  fullWidth
                  loading={verifyOtpMutation.isPending}
                  onPress={() => {
                    setAadhaarError('');
                    verifyOtpMutation.mutate();
                  }}
                  disabled={otp.length !== 6}
                />
                <Button
                  title="Change Aadhaar"
                  variant="ghost"
                  fullWidth
                  onPress={() => {
                    setAadhaarStep('input');
                    setOtp('');
                    setAadhaarSuccess('');
                  }}
                />
              </>
            )}
          </>
        )}
      </Card>
    </Screen>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flexWrap: 'wrap' },
  statusHint: { ...typography.bodySm, color: colors.textMuted, flex: 1 },
  verifiedBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: 'rgba(24,201,100,0.08)',
    borderRadius: radius.md,
    padding: spacing.md,
  },
  verifiedText: { flex: 1 },
  verifiedLabel: { ...typography.label, color: colors.success },
  verifiedMeta: { ...typography.bodySm, color: colors.textMuted, marginTop: 2 },
  error: { color: colors.danger, marginBottom: spacing.sm },
  success: { color: colors.success, marginBottom: spacing.sm },
  otpHint: { ...typography.bodySm, color: colors.textMuted, marginBottom: spacing.md },
});
}
