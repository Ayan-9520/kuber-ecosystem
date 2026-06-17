import { Ionicons } from '@expo/vector-icons';
import { type RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button, Card, Input, Screen } from '@/components/ui';
import { useAuth } from '@/hooks';
import { findProductDisplayItem, flattenProductsWithVariants } from '@/lib/product-mapper';
import { formatCurrency, getApiErrorMessage, str } from '@/lib/utils';
import type { ApplicationsStackParamList } from '@/navigation/types';
import { applicationsService, customerService, productsService } from '@/services';
import { colors, radius, spacing, typography } from '@/theme';

type Route = RouteProp<ApplicationsStackParamList, 'ApplicationWizard'>;
type Nav = NativeStackNavigationProp<ApplicationsStackParamList, 'ApplicationWizard'>;

const STEPS = [
  { key: 'personal', label: 'Personal', icon: 'person' as const },
  { key: 'employment', label: 'Employment', icon: 'briefcase' as const },
  { key: 'income', label: 'Income', icon: 'cash' as const },
  { key: 'collateral', label: 'Asset', icon: 'home' as const },
  { key: 'documents', label: 'Documents', icon: 'folder' as const },
  { key: 'review', label: 'Review', icon: 'checkmark-circle' as const },
] as const;

const EMPLOYMENT_TYPES = ['SALARIED', 'SELF_EMPLOYED', 'BUSINESS_OWNER', 'PROFESSIONAL'] as const;

interface WizardForm {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  maritalStatus: string;
  phone: string;
  email: string;
  addressLine1: string;
  city: string;
  stateName: string;
  pincode: string;
  employmentType: string;
  employerName: string;
  designation: string;
  experienceYears: string;
  monthlyIncome: string;
  annualIncome: string;
  existingEmi: string;
  otherIncome: string;
  collateralMode: 'property' | 'vehicle' | 'none';
  propertyValue: string;
  propertyType: string;
  propertyCity: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleValue: string;
  vehicleYear: string;
  requestedAmount: string;
  requestedTenureMonths: string;
  purpose: string;
  acknowledgedDocs: string[];
}

const INITIAL_FORM: WizardForm = {
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  gender: '',
  maritalStatus: '',
  phone: '',
  email: '',
  addressLine1: '',
  city: '',
  stateName: '',
  pincode: '',
  employmentType: 'SALARIED',
  employerName: '',
  designation: '',
  experienceYears: '',
  monthlyIncome: '',
  annualIncome: '',
  existingEmi: '',
  otherIncome: '',
  collateralMode: 'none',
  propertyValue: '',
  propertyType: '',
  propertyCity: '',
  vehicleMake: '',
  vehicleModel: '',
  vehicleValue: '',
  vehicleYear: '',
  requestedAmount: '',
  requestedTenureMonths: '240',
  purpose: '',
  acknowledgedDocs: [],
};

function matchProduct(items: Record<string, unknown>[], slug?: string, name?: string) {
  if (!items.length) return undefined;
  const normalizedSlug = slug?.toUpperCase();
  return (
    items.find((p) => String(p.code).toUpperCase() === normalizedSlug) ??
    items.find((p) => String(p.name).toLowerCase() === name?.toLowerCase()) ??
    items.find((p) => String(p.code).toUpperCase().includes(normalizedSlug?.split('_')[0] ?? '')) ??
    items[0]
  );
}

function matchVariant(items: Record<string, unknown>[], variant?: string) {
  if (!items.length) return undefined;
  const v = variant?.toUpperCase();
  return (
    items.find((item) => String(item.variantCode).toUpperCase() === v) ??
    items.find((item) => String(item.name).toUpperCase().includes(v ?? '')) ??
    items[0]
  );
}

function isPropertyProduct(slug?: string) {
  return !!slug && ['HOME_LOAN', 'LAP'].some((s) => slug.includes(s));
}

function isVehicleProduct(slug?: string) {
  return !!slug && ['AUTO', 'EV', 'CAR', 'COMMERCIAL_VEHICLE'].some((s) => slug.includes(s));
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.reviewRow}>
      <Text style={styles.reviewLabel}>{label}</Text>
      <Text style={styles.reviewValue}>{value}</Text>
    </View>
  );
}

function ChipSelect({
  options,
  value,
  onChange,
}: {
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View style={styles.chipRow}>
      {options.map((opt) => (
        <Pressable
          key={opt}
          style={[styles.chip, value === opt && styles.chipActive]}
          onPress={() => onChange(opt)}
        >
          <Text style={[styles.chipText, value === opt && styles.chipTextActive]}>
            {opt.replace(/_/g, ' ')}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

export function ApplicationWizardScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { customerId, user } = useAuth();

  const productSlug = route.params?.productSlug;
  const productName = route.params?.productName ?? 'Loan Application';
  const variant = route.params?.variant;

  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState<WizardForm>(INITIAL_FORM);
  const [error, setError] = useState('');
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const apiProductsQuery = useQuery({
    queryKey: ['products-wizard-api'],
    queryFn: () => productsService.list({ limit: 50 }),
  });

  const productsQuery = useQuery({
    queryKey: ['products-wizard'],
    queryFn: async () => {
      const [products, variants] = await Promise.all([
        productsService.list({ limit: 50 }),
        productsService.variants(),
      ]);
      return flattenProductsWithVariants(products.items, variants.items);
    },
  });

  const displayProduct = useMemo(
    () =>
      findProductDisplayItem(productsQuery.data ?? [], {
        slug: productSlug,
        name: productName,
        variant,
      }),
    [productsQuery.data, productSlug, productName, variant],
  );

  const documentChecklist = displayProduct?.documents ?? [
    'PAN',
    'Aadhaar',
    'Income proof',
    'Bank statements',
  ];

  const product = useMemo(
    () => matchProduct(apiProductsQuery.data?.items ?? [], productSlug, productName),
    [apiProductsQuery.data?.items, productSlug, productName],
  );

  const variantsQuery = useQuery({
    queryKey: ['product-variants', product?.id],
    queryFn: () => productsService.variants(String(product?.id)),
    enabled: !!product?.id,
  });

  const variantRecord = useMemo(
    () => matchVariant(variantsQuery.data?.items ?? [], variant),
    [variantsQuery.data?.items, variant],
  );

  const customerQuery = useQuery({
    queryKey: ['wizard-customer', customerId],
    queryFn: () => customerService.getById(customerId!),
    enabled: !!customerId,
  });

  const profileQuery = useQuery({
    queryKey: ['wizard-profile', customerId],
    queryFn: () => customerService.profile(customerId!),
    enabled: !!customerId,
  });

  const employmentQuery = useQuery({
    queryKey: ['wizard-employment', customerId],
    queryFn: () => customerService.employment(customerId!),
    enabled: !!customerId,
  });

  const incomeQuery = useQuery({
    queryKey: ['wizard-income', customerId],
    queryFn: () => customerService.income(customerId!),
    enabled: !!customerId,
  });

  useEffect(() => {
    const collateralMode = isPropertyProduct(productSlug)
      ? 'property'
      : isVehicleProduct(productSlug)
        ? 'vehicle'
        : 'none';

    setForm((prev) => ({
      ...prev,
      collateralMode,
      firstName: prev.firstName || String(customerQuery.data?.firstName ?? ''),
      lastName: prev.lastName || String(customerQuery.data?.lastName ?? ''),
      email: prev.email || String(profileQuery.data?.alternateEmail ?? user?.email ?? ''),
      phone: prev.phone || String(user?.phone ?? ''),
      employmentType: String(employmentQuery.data?.items[0]?.employmentType ?? prev.employmentType),
      employerName: String(employmentQuery.data?.items[0]?.employerName ?? prev.employerName),
      designation: String(employmentQuery.data?.items[0]?.designation ?? prev.designation),
      monthlyIncome: String(incomeQuery.data?.items[0]?.monthlyAmount ?? incomeQuery.data?.items[0]?.amount ?? prev.monthlyIncome),
    }));
  }, [customerQuery.data, profileQuery.data, employmentQuery.data, incomeQuery.data, user, productSlug]);

  const activeSteps = useMemo(() => {
    if (form.collateralMode === 'none') {
      return STEPS.filter((s) => s.key !== 'collateral');
    }
    return STEPS;
  }, [form.collateralMode]);

  const currentStep = activeSteps[stepIndex]?.key ?? 'personal';
  const isLastStep = stepIndex === activeSteps.length - 1;

  const patch = (updates: Partial<WizardForm>) => setForm((prev) => ({ ...prev, ...updates }));

  const toggleDoc = (doc: string) => {
    setForm((prev) => ({
      ...prev,
      acknowledgedDocs: prev.acknowledgedDocs.includes(doc)
        ? prev.acknowledgedDocs.filter((d) => d !== doc)
        : [...prev.acknowledgedDocs, doc],
    }));
  };

  const validateStep = (): string | null => {
    switch (currentStep) {
      case 'personal':
        if (!form.firstName.trim()) return 'First name is required';
        if (!form.phone.trim() && !user?.phone) return 'Phone number is required';
        if (!form.city.trim()) return 'City is required';
        return null;
      case 'employment':
        if (!form.employerName.trim() && form.employmentType === 'SALARIED') return 'Employer name is required';
        return null;
      case 'income':
        if (!form.monthlyIncome.trim() && !form.annualIncome.trim()) return 'Income details are required';
        return null;
      case 'collateral':
        if (form.collateralMode === 'property' && !form.propertyValue.trim()) return 'Property value is required';
        if (form.collateralMode === 'vehicle' && !form.vehicleValue.trim()) return 'Vehicle value is required';
        return null;
      case 'documents':
        if (form.acknowledgedDocs.length < documentChecklist.length) return 'Please acknowledge all required documents';
        return null;
      case 'review':
        if (!form.requestedAmount.trim()) return 'Loan amount is required';
        if (!form.requestedTenureMonths.trim()) return 'Tenure is required';
        return null;
      default:
        return null;
    }
  };

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!customerId) throw new Error('Customer profile not linked');
      if (!product?.id) throw new Error('Product not found. Try again later.');

      const applicantProfile = {
        monthlyIncome: form.monthlyIncome ? Number(form.monthlyIncome) : undefined,
        annualIncome: form.annualIncome ? Number(form.annualIncome) : undefined,
        employmentType: form.employmentType,
        propertyValue: form.propertyValue ? Number(form.propertyValue) : undefined,
        vehicleValue: form.vehicleValue ? Number(form.vehicleValue) : undefined,
        existingEmi: form.existingEmi ? Number(form.existingEmi) : undefined,
        requestedLoanAmount: Number(form.requestedAmount),
      };

      const metadata = {
        wizard: {
          personal: {
            firstName: form.firstName,
            lastName: form.lastName,
            dateOfBirth: form.dateOfBirth,
            gender: form.gender,
            maritalStatus: form.maritalStatus,
            phone: form.phone,
            email: form.email,
            address: {
              line1: form.addressLine1,
              city: form.city,
              stateName: form.stateName,
              pincode: form.pincode,
            },
          },
          employment: {
            employmentType: form.employmentType,
            employerName: form.employerName,
            designation: form.designation,
            experienceYears: form.experienceYears,
          },
          income: {
            monthlyIncome: form.monthlyIncome,
            annualIncome: form.annualIncome,
            existingEmi: form.existingEmi,
            otherIncome: form.otherIncome,
          },
          collateral:
            form.collateralMode === 'property'
              ? {
                  type: 'property',
                  propertyValue: form.propertyValue,
                  propertyType: form.propertyType,
                  propertyCity: form.propertyCity,
                }
              : form.collateralMode === 'vehicle'
                ? {
                    type: 'vehicle',
                    vehicleMake: form.vehicleMake,
                    vehicleModel: form.vehicleModel,
                    vehicleValue: form.vehicleValue,
                    vehicleYear: form.vehicleYear,
                  }
                : null,
          documents: form.acknowledgedDocs,
          productSlug,
          productName,
          variant,
        },
      };

      const created = await applicationsService.create({
        customerId,
        productId: product.id,
        variantId: variantRecord?.id,
        requestedAmount: Number(form.requestedAmount),
        requestedTenureMonths: Number(form.requestedTenureMonths),
        purpose: form.purpose || undefined,
        metadata,
        applicantProfile,
        runEligibility: true,
      });

      const applicationId = String(created.id);
      await applicationsService.submit(applicationId, { applicantProfile, runEligibility: true });
      return applicationId;
    },
    onSuccess: (id) => {
      setSubmittedId(id);
      setError('');
    },
    onError: (e) => setError(getApiErrorMessage(e)),
  });

  const goNext = () => {
    const validationError = validateStep();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    if (isLastStep) {
      submitMutation.mutate();
    } else {
      setStepIndex((i) => i + 1);
    }
  };

  const goBack = () => {
    setError('');
    if (stepIndex > 0) setStepIndex((i) => i - 1);
    else navigation.goBack();
  };

  if (submittedId) {
    return (
      <Screen title="Application Submitted" subtitle="Your application is now under review">
        <Card>
          <View style={styles.successBox}>
            <Ionicons name="checkmark-circle" size={48} color={colors.success} />
            <Text style={styles.successTitle}>Successfully submitted!</Text>
            <Text style={styles.successSub}>
              Application ID: {submittedId.slice(0, 8).toUpperCase()}
            </Text>
          </View>
          <Button title="Track Application" fullWidth onPress={() => navigation.replace('ApplicationDetail', { id: submittedId })} />
          <Button title="Back to Applications" variant="secondary" fullWidth onPress={() => navigation.popToTop()} />
        </Card>
      </Screen>
    );
  }

  const loading = apiProductsQuery.isLoading || customerQuery.isLoading;

  return (
    <Screen
      title={productName}
      subtitle={`Step ${stepIndex + 1} of ${activeSteps.length} · ${activeSteps[stepIndex]?.label}`}
      loading={loading}
    >
      <View style={styles.progressRow}>
        {activeSteps.map((step, index) => (
          <View key={step.key} style={styles.progressItem}>
            <View style={[styles.progressDot, index <= stepIndex && styles.progressDotActive]}>
              <Ionicons
                name={step.icon}
                size={14}
                color={index <= stepIndex ? colors.background : colors.textMuted}
              />
            </View>
            {index < activeSteps.length - 1 ? (
              <View style={[styles.progressLine, index < stepIndex && styles.progressLineActive]} />
            ) : null}
          </View>
        ))}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {currentStep === 'personal' && (
        <Card title="Personal Details">
          <Input label="First Name *" value={form.firstName} onChangeText={(v) => patch({ firstName: v })} />
          <Input label="Last Name" value={form.lastName} onChangeText={(v) => patch({ lastName: v })} />
          <Input label="Date of Birth" placeholder="YYYY-MM-DD" value={form.dateOfBirth} onChangeText={(v) => patch({ dateOfBirth: v })} />
          <Input label="Phone *" keyboardType="phone-pad" value={form.phone} onChangeText={(v) => patch({ phone: v })} />
          <Input label="Email" keyboardType="email-address" autoCapitalize="none" value={form.email} onChangeText={(v) => patch({ email: v })} />
          <Input label="Address" value={form.addressLine1} onChangeText={(v) => patch({ addressLine1: v })} />
          <Input label="City *" value={form.city} onChangeText={(v) => patch({ city: v })} />
          <Input label="State" value={form.stateName} onChangeText={(v) => patch({ stateName: v })} />
          <Input label="Pincode" keyboardType="number-pad" maxLength={6} value={form.pincode} onChangeText={(v) => patch({ pincode: v })} />
        </Card>
      )}

      {currentStep === 'employment' && (
        <Card title="Employment Details">
          <Text style={styles.fieldLabel}>Employment Type</Text>
          <ChipSelect options={EMPLOYMENT_TYPES} value={form.employmentType} onChange={(v) => patch({ employmentType: v })} />
          <Input label="Employer / Business Name" value={form.employerName} onChangeText={(v) => patch({ employerName: v })} />
          <Input label="Designation" value={form.designation} onChangeText={(v) => patch({ designation: v })} />
          <Input label="Experience (years)" keyboardType="numeric" value={form.experienceYears} onChangeText={(v) => patch({ experienceYears: v })} />
        </Card>
      )}

      {currentStep === 'income' && (
        <Card title="Income Details">
          <Input label="Monthly Income (₹)" keyboardType="numeric" value={form.monthlyIncome} onChangeText={(v) => patch({ monthlyIncome: v })} />
          <Input label="Annual Income (₹)" keyboardType="numeric" value={form.annualIncome} onChangeText={(v) => patch({ annualIncome: v })} />
          <Input label="Existing EMI (₹)" keyboardType="numeric" value={form.existingEmi} onChangeText={(v) => patch({ existingEmi: v })} />
          <Input label="Other Income (₹)" keyboardType="numeric" value={form.otherIncome} onChangeText={(v) => patch({ otherIncome: v })} />
          <Input label="Requested Loan Amount (₹) *" keyboardType="numeric" value={form.requestedAmount} onChangeText={(v) => patch({ requestedAmount: v })} />
          <Input label="Tenure (months) *" keyboardType="numeric" value={form.requestedTenureMonths} onChangeText={(v) => patch({ requestedTenureMonths: v })} />
          <Input label="Purpose" value={form.purpose} onChangeText={(v) => patch({ purpose: v })} />
        </Card>
      )}

      {currentStep === 'collateral' && form.collateralMode === 'property' && (
        <Card title="Property Details">
          <Input label="Property Type" placeholder="Flat / House / Plot" value={form.propertyType} onChangeText={(v) => patch({ propertyType: v })} />
          <Input label="Property Value (₹) *" keyboardType="numeric" value={form.propertyValue} onChangeText={(v) => patch({ propertyValue: v })} />
          <Input label="Property City" value={form.propertyCity} onChangeText={(v) => patch({ propertyCity: v })} />
        </Card>
      )}

      {currentStep === 'collateral' && form.collateralMode === 'vehicle' && (
        <Card title="Vehicle Details">
          <Input label="Make" value={form.vehicleMake} onChangeText={(v) => patch({ vehicleMake: v })} />
          <Input label="Model" value={form.vehicleModel} onChangeText={(v) => patch({ vehicleModel: v })} />
          <Input label="Year" keyboardType="numeric" value={form.vehicleYear} onChangeText={(v) => patch({ vehicleYear: v })} />
          <Input label="On-road / Valuation (₹) *" keyboardType="numeric" value={form.vehicleValue} onChangeText={(v) => patch({ vehicleValue: v })} />
        </Card>
      )}

      {currentStep === 'documents' && (
        <Card title="Document Checklist" subtitle="Confirm you can provide these documents">
          {documentChecklist.map((doc) => {
            const checked = form.acknowledgedDocs.includes(doc);
            return (
              <Pressable key={doc} style={styles.docItem} onPress={() => toggleDoc(doc)}>
                <Ionicons
                  name={checked ? 'checkbox' : 'square-outline'}
                  size={22}
                  color={checked ? colors.primary : colors.textMuted}
                />
                <Text style={styles.docLabel}>{doc}</Text>
              </Pressable>
            );
          })}
          <Text style={styles.docHint}>
            {form.acknowledgedDocs.length}/{documentChecklist.length} acknowledged
          </Text>
        </Card>
      )}

      {currentStep === 'review' && (
        <Card title="Review & Submit">
          <ReviewRow label="Product" value={productName} />
          <ReviewRow label="Variant" value={str(variant ?? variantRecord?.name)} />
          <ReviewRow label="Applicant" value={`${form.firstName} ${form.lastName}`.trim()} />
          <ReviewRow label="Employment" value={`${form.employmentType.replace(/_/g, ' ')} · ${form.employerName || '—'}`} />
          <ReviewRow
            label="Income"
            value={form.monthlyIncome ? `${formatCurrency(Number(form.monthlyIncome))}/mo` : str(form.annualIncome)}
          />
          {form.collateralMode === 'property' && (
            <ReviewRow label="Property" value={`${form.propertyType || 'Property'} · ${formatCurrency(Number(form.propertyValue || 0))}`} />
          )}
          {form.collateralMode === 'vehicle' && (
            <ReviewRow label="Vehicle" value={`${form.vehicleMake} ${form.vehicleModel} · ${formatCurrency(Number(form.vehicleValue || 0))}`} />
          )}
          <ReviewRow label="Loan Amount" value={formatCurrency(Number(form.requestedAmount || 0))} />
          <ReviewRow label="Tenure" value={`${form.requestedTenureMonths} months`} />
          <ReviewRow label="Documents" value={`${form.acknowledgedDocs.length} types ready`} />
          {!form.requestedAmount ? (
            <>
              <Input label="Loan Amount (₹) *" keyboardType="numeric" value={form.requestedAmount} onChangeText={(v) => patch({ requestedAmount: v })} />
              <Input label="Tenure (months) *" keyboardType="numeric" value={form.requestedTenureMonths} onChangeText={(v) => patch({ requestedTenureMonths: v })} />
            </>
          ) : null}
        </Card>
      )}

      <View style={styles.actions}>
        <Button title="Back" variant="secondary" onPress={goBack} style={styles.actionBtn} />
        <Button
          title={isLastStep ? 'Submit Application' : 'Continue'}
          onPress={goNext}
          loading={submitMutation.isPending}
          style={styles.actionBtn}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  progressRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg, paddingHorizontal: spacing.xs },
  progressItem: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  progressDot: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressDotActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  progressLine: { flex: 1, height: 2, backgroundColor: colors.border, marginHorizontal: 2 },
  progressLineActive: { backgroundColor: colors.primary },
  error: { color: colors.danger, marginBottom: spacing.md },
  fieldLabel: { ...typography.label, color: colors.textSecondary, marginBottom: spacing.sm },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: { borderColor: colors.primary, backgroundColor: 'rgba(34,211,166,0.12)' },
  chipText: { ...typography.bodySm, color: colors.textSecondary },
  chipTextActive: { color: colors.primary },
  docItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm },
  docLabel: { ...typography.body, color: colors.text, flex: 1 },
  docHint: { ...typography.bodySm, color: colors.textMuted, marginTop: spacing.sm },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  reviewLabel: { ...typography.bodySm, color: colors.textMuted, flex: 1 },
  reviewValue: { ...typography.label, color: colors.text, flex: 1, textAlign: 'right' },
  actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
  actionBtn: { flex: 1 },
  successBox: { alignItems: 'center', paddingVertical: spacing.lg, gap: spacing.sm },
  successTitle: { ...typography.h2, color: colors.success },
  successSub: { ...typography.bodySm, color: colors.textMuted },
});
