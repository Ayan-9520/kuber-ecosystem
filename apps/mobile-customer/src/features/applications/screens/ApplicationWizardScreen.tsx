import { Ionicons } from '@expo/vector-icons';
import { type RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, Platform, StyleSheet, Text, View } from 'react-native';

import { Button, Card, Input, PageHero, Screen } from '@/components/ui';
import { useAuth, useResponsiveLayout } from '@/hooks';
import { guessMimeType, resolveDocumentTypeForLabel, formatDocumentChecklistLabel, formatDocumentTypeLabel } from '@/lib/document-checklist';
import { API_BASE_URL } from '@/lib/api';
import { pickDocumentBase64 } from '@/lib/read-file-base64';
import { findProductDisplayItem, fetchCustomerCatalog } from '@/lib/product-mapper';
import {
  collateralModeForProfile,
  resolveFamilyCode,
  wizardProfileForFamily,
  wizardStepsForProfile,
  type WizardProfile,
  type WizardStepKey,
} from '@/lib/product-family';
import { formatCurrency, getApiErrorMessage, str } from '@/lib/utils';
import type { ApplicationsStackParamList } from '@/navigation/types';
import { applicationsService, authService, customerService, documentsService, productsService } from '@/services';
import { type AppColors, useAppTheme } from '@/theme/ThemeProvider';
import { radius, spacing, typography } from '@/theme';

type Route = RouteProp<ApplicationsStackParamList, 'ApplicationWizard'>;
type Nav = NativeStackNavigationProp<ApplicationsStackParamList, 'ApplicationWizard'>;

const STEP_META: Record<
  WizardStepKey,
  { label: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  personal: { label: 'Personal', icon: 'person' },
  employment: { label: 'Employment', icon: 'briefcase' },
  income: { label: 'Income', icon: 'cash' },
  collateral: { label: 'Asset', icon: 'home' },
  business: { label: 'Business', icon: 'business' },
  insurance: { label: 'Policy', icon: 'shield-checkmark' },
  credit_card: { label: 'Card', icon: 'card' },
  documents: { label: 'Documents', icon: 'folder' },
  review: { label: 'Review', icon: 'checkmark-circle' },
};

const EMPLOYMENT_TYPES = ['SALARIED', 'SELF_EMPLOYED', 'BUSINESS_OWNER', 'PROFESSIONAL'] as const;
const INSURANCE_POLICY_TYPES = ['TERM', 'HEALTH', 'LIFE', 'MOTOR', 'ULIP'] as const;
const CREDIT_CARD_TYPES = ['REWARDS', 'CASHBACK', 'TRAVEL', 'PREMIUM', 'FUEL'] as const;
const VEHICLE_MAKES = [
  'Maruti Suzuki',
  'Hyundai',
  'Tata',
  'Mahindra',
  'Honda',
  'Toyota',
  'Kia',
  'MG',
  'Renault',
  'Other',
] as const;

function formatVehicleReview(form: WizardForm): string {
  const make = form.vehicleMake.trim() || '—';
  const model = form.vehicleModel.trim() || '—';
  const year = form.vehicleYear.trim();
  const label = year ? `${make} ${model} (${year})` : `${make} ${model}`;
  return `${label} · ${formatCurrency(Number(form.vehicleValue || 0))}`;
}

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
  businessTurnover: string;
  businessGstin: string;
  businessVintageYears: string;
  insurancePolicyType: string;
  insuranceSumAssured: string;
  insuranceNomineeName: string;
  insuranceNomineeRelation: string;
  creditCardType: string;
  creditCardPreference: string;
  requestedAmount: string;
  requestedTenureMonths: string;
  purpose: string;
  uploadedDocs: Record<string, { id: string; fileName: string }>;
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
  businessTurnover: '',
  businessGstin: '',
  businessVintageYears: '',
  insurancePolicyType: 'TERM',
  insuranceSumAssured: '',
  insuranceNomineeName: '',
  insuranceNomineeRelation: '',
  creditCardType: 'REWARDS',
  creditCardPreference: '',
  requestedAmount: '',
  requestedTenureMonths: '240',
  purpose: '',
  uploadedDocs: {},
};

function matchProduct(items: Record<string, unknown>[], slug?: string, name?: string) {
  if (!items.length) return undefined;
  const normalizedSlug = slug?.toUpperCase();
  return (
    items.find((p) => String(p.code).toUpperCase() === normalizedSlug) ??
    items.find((p) => String(p.name).toLowerCase() === name?.toLowerCase()) ??
    items.find((p) => {
      const code = String(p.code).toUpperCase();
      const prefix = normalizedSlug?.split('-')[0];
      return prefix ? code.startsWith(prefix) : false;
    }) ??
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

function ReviewRow({ label, value }: { label: string; value: string }) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
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
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.chipRow}>
      {options.map((opt) => {
        const active = value === opt;
        return (
          <Pressable
            key={opt}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            style={({ pressed }) => [
              styles.chip,
              active && styles.chipActive,
              pressed && { opacity: 0.9 },
              Platform.OS === 'web' && ({ cursor: 'pointer' } as const),
            ]}
            onPress={() => onChange(opt)}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>
              {opt.replace(/_/g, ' ')}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function ApplicationWizardScreen() {
  const { colors } = useAppTheme();
  const { isDesktop, pagePad } = useResponsiveLayout();
  const styles = useMemo(() => createStyles(colors, isDesktop, pagePad), [colors, isDesktop, pagePad]);
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { customerId, user } = useAuth();

  const productSlug = route.params?.productSlug ?? route.params?.productCode;
  const productName = route.params?.productName ?? 'Loan Application';
  const variant = route.params?.variant;
  const routeFamilyCode = route.params?.familyCode;
  const routeProductId = route.params?.productId;

  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState<WizardForm>(INITIAL_FORM);
  const [error, setError] = useState('');
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);

  const apiProductsQuery = useQuery({
    queryKey: ['products-wizard-api'],
    queryFn: () => productsService.list({ limit: 50 }),
  });

  const productsQuery = useQuery({
    queryKey: ['products-wizard'],
    queryFn: () => fetchCustomerCatalog(),
    staleTime: 60_000,
  });

  const documentTypesQuery = useQuery({
    queryKey: ['document-types-wizard'],
    queryFn: () => productsService.documentTypes(),
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

  const product = useMemo(() => {
    const items = apiProductsQuery.data?.items ?? [];
    if (routeProductId) {
      const byId = items.find((p) => String(p.id) === routeProductId);
      if (byId) return byId;
    }
    return matchProduct(items, productSlug, productName);
  }, [apiProductsQuery.data?.items, routeProductId, productSlug, productName]);

  const familyCode = useMemo(() => {
    if (routeFamilyCode) return routeFamilyCode.toUpperCase();
    if (displayProduct?.familyCode) return displayProduct.familyCode;
    return resolveFamilyCode(product);
  }, [routeFamilyCode, displayProduct?.familyCode, product]);

  const wizardProfile: WizardProfile = useMemo(
    () => wizardProfileForFamily(familyCode, productSlug),
    [familyCode, productSlug],
  );

  const variantsQuery = useQuery({
    queryKey: ['product-variants', product?.id],
    queryFn: () => productsService.variants(String(product?.id)),
    enabled: !!product?.id,
  });

  const variantRecord = useMemo(() => {
    if (route.params?.variantId) {
      const byId = (variantsQuery.data?.items ?? []).find((v) => String(v.id) === route.params?.variantId);
      if (byId) return byId;
    }
    return matchVariant(variantsQuery.data?.items ?? [], variant);
  }, [variantsQuery.data?.items, variant, route.params?.variantId]);

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
    const collateralMode = collateralModeForProfile(wizardProfile);
    const rawFirst = String(customerQuery.data?.firstName ?? '');
    const rawLast = String(customerQuery.data?.lastName ?? '');
    const isDemoProfile =
      rawFirst.toLowerCase() === 'demo' && rawLast.toLowerCase() === 'customer';

    setForm((prev) => ({
      ...prev,
      collateralMode,
      firstName: prev.firstName || (isDemoProfile ? '' : rawFirst),
      lastName: prev.lastName || (isDemoProfile ? '' : rawLast),
      email: prev.email || String(profileQuery.data?.alternateEmail ?? user?.email ?? ''),
      phone: prev.phone || String(user?.phone ?? ''),
      employmentType: String(employmentQuery.data?.items[0]?.employmentType ?? prev.employmentType),
      employerName: String(employmentQuery.data?.items[0]?.employerName ?? prev.employerName),
      designation: String(employmentQuery.data?.items[0]?.designation ?? prev.designation),
      monthlyIncome: String(
        incomeQuery.data?.items[0]?.monthlyAmount ??
          incomeQuery.data?.items[0]?.amount ??
          prev.monthlyIncome,
      ),
    }));
  }, [
    customerQuery.data,
    profileQuery.data,
    employmentQuery.data,
    incomeQuery.data,
    user,
    wizardProfile,
  ]);

  const activeStepKeys = useMemo(() => wizardStepsForProfile(wizardProfile), [wizardProfile]);

  const activeSteps = useMemo(
    () => activeStepKeys.map((key) => ({ key, ...STEP_META[key] })),
    [activeStepKeys],
  );

  const currentStep = activeSteps[stepIndex]?.key ?? 'personal';
  const isLastStep = stepIndex === activeSteps.length - 1;

  const patch = (updates: Partial<WizardForm>) => setForm((prev) => ({ ...prev, ...updates }));

  const uploadDocument = async (docLabel: string) => {
    let cid = customerId;
    if (!cid) {
      const me = await authService.me();
      cid = me.customerId ?? undefined;
    }
    if (!cid) {
      setError('Customer profile not linked. Please sign out and sign in again.');
      return;
    }

    const docType = resolveDocumentTypeForLabel(docLabel, documentTypesQuery.data?.items ?? []);
    if (!docType?.id) {
      setError(
        documentTypesQuery.isError
          ? `Cannot reach API (${API_BASE_URL}). Set EXPO_PUBLIC_API_BASE_URL and restart the app.`
          : `Document type "${formatDocumentChecklistLabel(docLabel)}" is not available yet. Pull to refresh or try again.`,
      );
      return;
    }

    setUploadingDoc(docLabel);
    setError('');
    try {
      const picked = await pickDocumentBase64(['application/pdf', 'image/*']);
      if (!picked) return;

      const uploaded = await documentsService.upload({
        ownerType: 'CUSTOMER',
        customerId: cid,
        documentTypeId: String(docType.id),
        fileName: picked.name,
        mimeType: guessMimeType(picked.name, picked.mimeType),
        contentBase64: picked.contentBase64,
        runOcr: true,
        autoVerify: false,
      });

      setForm((prev) => ({
        ...prev,
        uploadedDocs: {
          ...prev.uploadedDocs,
          [docLabel]: { id: String(uploaded.id), fileName: picked.name },
        },
      }));
    } catch (e) {
      const msg = getApiErrorMessage(e);
      if (msg !== 'Upload cancelled') setError(msg);
    } finally {
      setUploadingDoc(null);
    }
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
        if (form.collateralMode === 'vehicle') {
          if (!form.vehicleMake.trim()) return 'Vehicle make (company) is required';
          if (!form.vehicleModel.trim()) return 'Vehicle model is required';
          if (!form.vehicleYear.trim()) return 'Manufacturing year is required';
          const year = Number(form.vehicleYear);
          const currentYear = new Date().getFullYear();
          if (!Number.isInteger(year) || year < 1990 || year > currentYear) {
            return `Enter a valid year between 1990 and ${currentYear}`;
          }
          if (!form.vehicleValue.trim()) return 'Vehicle value is required';
        }
        return null;
      case 'business':
        if (!form.businessTurnover.trim()) return 'Annual turnover is required';
        return null;
      case 'insurance':
        if (!form.insuranceSumAssured.trim()) return 'Sum assured is required';
        if (!form.insuranceNomineeName.trim()) return 'Nominee name is required';
        return null;
      case 'credit_card':
        if (!form.employerName.trim()) return 'Employer name is required';
        if (!form.monthlyIncome.trim()) return 'Monthly income is required';
        return null;
      case 'documents': {
        const pending = documentChecklist.filter((doc) => !form.uploadedDocs[doc]);
        if (pending.length > 0) {
          return `Please upload: ${pending.join(', ')}`;
        }
        return null;
      }
      case 'review':
        if (!form.requestedAmount.trim()) return 'Requested amount is required';
        if (!form.requestedTenureMonths.trim()) return 'Tenure is required';
        return null;
      default:
        return null;
    }
  };

  const submitMutation = useMutation({
    mutationFn: async () => {
      let cid = customerId;
      if (!cid) {
        const me = await authService.me();
        cid = me.customerId ?? undefined;
      }
      if (!cid) throw new Error('Customer profile not linked. Please sign out and register or sign in again.');
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
          business:
            wizardProfile === 'business'
              ? {
                  turnover: form.businessTurnover,
                  gstin: form.businessGstin,
                  vintageYears: form.businessVintageYears,
                }
              : null,
          insurance:
            wizardProfile === 'insurance'
              ? {
                  policyType: form.insurancePolicyType,
                  sumAssured: form.insuranceSumAssured,
                  nomineeName: form.insuranceNomineeName,
                  nomineeRelation: form.insuranceNomineeRelation,
                }
              : null,
          creditCard:
            wizardProfile === 'credit_card'
              ? {
                  cardType: form.creditCardType,
                  preference: form.creditCardPreference,
                  employerName: form.employerName,
                  monthlyIncome: form.monthlyIncome,
                }
              : null,
          documents: documentChecklist,
          uploadedDocuments: Object.values(form.uploadedDocs).map((d) => d.id),
          familyCode,
          wizardProfile,
          productSlug,
          productName,
          variant,
        },
      };

      const created = await applicationsService.create({
        customerId: cid,
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
      <Screen scroll padded={false}>
        <PageHero
          eyebrow="Done"
          title="Application submitted"
          subtitle="Your application is now under review"
          icon="checkmark-circle"
        />
        <View style={styles.body}>
          <Card elevated>
            <View style={styles.successBox}>
              <View style={styles.successIcon}>
                <Ionicons name="checkmark-circle" size={56} color={colors.success} />
              </View>
              <Text style={styles.successTitle}>Successfully submitted!</Text>
              <Text style={styles.successSub}>
                Application ID: {submittedId.slice(0, 8).toUpperCase()}
              </Text>
            </View>
            <View style={styles.successActions}>
              <Button
                title="Track Application"
                fullWidth
                onPress={() => navigation.replace('ApplicationDetail', { id: submittedId })}
              />
              <Button
                title="Back to Applications"
                variant="secondary"
                fullWidth
                onPress={() =>
                  navigation.getParent()?.navigate('Applications', { screen: 'ApplicationsList' })
                }
              />
            </View>
          </Card>
        </View>
      </Screen>
    );
  }

  const loading = apiProductsQuery.isLoading || customerQuery.isLoading;
  const stepLabel = activeSteps[stepIndex]?.label ?? 'Details';
  const progressPct = Math.round(((stepIndex + 1) / Math.max(activeSteps.length, 1)) * 100);

  return (
    <Screen scroll padded={false} loading={loading}>
      <PageHero
        eyebrow="Application"
        title={productName}
        subtitle={`Step ${stepIndex + 1} of ${activeSteps.length} · ${stepLabel}`}
        icon="document-text"
      />

      <View style={styles.body}>
        <Card elevated style={styles.stepperCard}>
          <View style={styles.progressMeta}>
            <Text style={styles.progressMetaLabel}>{stepLabel}</Text>
            <Text style={styles.progressMetaPct}>{progressPct}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
          </View>
          <View style={styles.progressRow}>
            {activeSteps.map((step, index) => {
              const done = index < stepIndex;
              const current = index === stepIndex;
              return (
                <View key={step.key} style={styles.progressItem}>
                  <View
                    style={[
                      styles.progressDot,
                      (done || current) && styles.progressDotActive,
                      current && styles.progressDotCurrent,
                    ]}
                  >
                    <Ionicons
                      name={done ? 'checkmark' : step.icon}
                      size={14}
                      color={done || current ? colors.onPrimary : colors.textMuted}
                    />
                  </View>
                  {isDesktop ? (
                    <Text
                      style={[styles.progressLabel, (done || current) && styles.progressLabelActive]}
                      numberOfLines={1}
                    >
                      {step.label}
                    </Text>
                  ) : null}
                  {index < activeSteps.length - 1 ? (
                    <View style={[styles.progressLine, done && styles.progressLineActive]} />
                  ) : null}
                </View>
              );
            })}
          </View>
        </Card>

        {error ? (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={18} color={colors.danger} />
            <Text style={styles.error}>{error}</Text>
          </View>
        ) : null}

        {currentStep === 'personal' && (
          <Card title="Personal Details" subtitle="Tell us about yourself" elevated>
            <View style={styles.fieldGrid}>
              <View style={styles.fieldHalf}>
                <Input label="First Name *" value={form.firstName} onChangeText={(v) => patch({ firstName: v })} />
              </View>
              <View style={styles.fieldHalf}>
                <Input label="Last Name" value={form.lastName} onChangeText={(v) => patch({ lastName: v })} />
              </View>
            </View>
            <Input label="Date of Birth" placeholder="YYYY-MM-DD" value={form.dateOfBirth} onChangeText={(v) => patch({ dateOfBirth: v })} />
            <View style={styles.fieldGrid}>
              <View style={styles.fieldHalf}>
                <Input label="Phone *" keyboardType="phone-pad" value={form.phone} onChangeText={(v) => patch({ phone: v })} />
              </View>
              <View style={styles.fieldHalf}>
                <Input label="Email" keyboardType="email-address" autoCapitalize="none" value={form.email} onChangeText={(v) => patch({ email: v })} />
              </View>
            </View>
            <Input label="Address" value={form.addressLine1} onChangeText={(v) => patch({ addressLine1: v })} />
            <View style={styles.fieldGrid}>
              <View style={styles.fieldHalf}>
                <Input label="City *" value={form.city} onChangeText={(v) => patch({ city: v })} />
              </View>
              <View style={styles.fieldHalf}>
                <Input label="State" value={form.stateName} onChangeText={(v) => patch({ stateName: v })} />
              </View>
            </View>
            <Input label="Pincode" keyboardType="number-pad" maxLength={6} value={form.pincode} onChangeText={(v) => patch({ pincode: v })} />
          </Card>
        )}

        {currentStep === 'employment' && (
          <Card title="Employment Details" subtitle="Work profile for eligibility" elevated>
            <Text style={styles.fieldLabel}>Employment Type</Text>
            <ChipSelect options={EMPLOYMENT_TYPES} value={form.employmentType} onChange={(v) => patch({ employmentType: v })} />
            <Input label="Employer / Business Name" value={form.employerName} onChangeText={(v) => patch({ employerName: v })} />
            <Input label="Designation" value={form.designation} onChangeText={(v) => patch({ designation: v })} />
            <Input label="Experience (years)" keyboardType="numeric" value={form.experienceYears} onChangeText={(v) => patch({ experienceYears: v })} />
          </Card>
        )}

        {currentStep === 'income' && (
          <Card title="Income Details" subtitle="Monthly cashflow & loan ask" elevated>
            <View style={styles.fieldGrid}>
              <View style={styles.fieldHalf}>
                <Input label="Monthly Income (₹)" keyboardType="numeric" value={form.monthlyIncome} onChangeText={(v) => patch({ monthlyIncome: v })} />
              </View>
              <View style={styles.fieldHalf}>
                <Input label="Annual Income (₹)" keyboardType="numeric" value={form.annualIncome} onChangeText={(v) => patch({ annualIncome: v })} />
              </View>
            </View>
            <View style={styles.fieldGrid}>
              <View style={styles.fieldHalf}>
                <Input label="Existing EMI (₹)" keyboardType="numeric" value={form.existingEmi} onChangeText={(v) => patch({ existingEmi: v })} />
              </View>
              <View style={styles.fieldHalf}>
                <Input label="Other Income (₹)" keyboardType="numeric" value={form.otherIncome} onChangeText={(v) => patch({ otherIncome: v })} />
              </View>
            </View>
            <Input
              label={wizardProfile === 'insurance' ? 'Premium Budget (₹) *' : wizardProfile === 'credit_card' ? 'Expected Credit Limit (₹) *' : 'Requested Amount (₹) *'}
              keyboardType="numeric"
              value={form.requestedAmount}
              onChangeText={(v) => patch({ requestedAmount: v })}
            />
            <Input label="Tenure (months) *" keyboardType="numeric" value={form.requestedTenureMonths} onChangeText={(v) => patch({ requestedTenureMonths: v })} />
            <Input label="Purpose" value={form.purpose} onChangeText={(v) => patch({ purpose: v })} />
          </Card>
        )}

        {currentStep === 'collateral' && form.collateralMode === 'property' && (
          <Card title="Property Details" subtitle="Collateral for this loan" elevated>
            <Input label="Property Type" placeholder="Flat / House / Plot" value={form.propertyType} onChangeText={(v) => patch({ propertyType: v })} />
            <Input label="Property Value (₹) *" keyboardType="numeric" value={form.propertyValue} onChangeText={(v) => patch({ propertyValue: v })} />
            <Input label="Property City" value={form.propertyCity} onChangeText={(v) => patch({ propertyCity: v })} />
          </Card>
        )}

        {currentStep === 'collateral' && form.collateralMode === 'vehicle' && (
          <Card title="Vehicle Details" subtitle="Used / pre-owned car details for loan assessment" elevated>
            <Text style={styles.fieldLabel}>Make (company) *</Text>
            <ChipSelect
              options={VEHICLE_MAKES}
              value={
                form.vehicleMake && (VEHICLE_MAKES as readonly string[]).includes(form.vehicleMake)
                  ? form.vehicleMake
                  : form.vehicleMake
                    ? 'Other'
                    : ''
              }
              onChange={(v) => patch({ vehicleMake: v === 'Other' ? '' : v })}
            />
            <Input
              label="Make name *"
              placeholder="e.g. Maruti Suzuki, Hyundai, Tata"
              value={form.vehicleMake}
              onChangeText={(v) => patch({ vehicleMake: v })}
            />
            <Input
              label="Model *"
              placeholder="e.g. Swift, i20, Nexon (model name — not year)"
              value={form.vehicleModel}
              onChangeText={(v) => patch({ vehicleModel: v })}
            />
            <View style={styles.fieldGrid}>
              <View style={styles.fieldHalf}>
                <Input
                  label="Manufacturing year *"
                  placeholder="e.g. 2020"
                  keyboardType="numeric"
                  maxLength={4}
                  value={form.vehicleYear}
                  onChangeText={(v) => patch({ vehicleYear: v })}
                />
              </View>
              <View style={styles.fieldHalf}>
                <Input
                  label="Valuation (₹) *"
                  placeholder="Current market value"
                  keyboardType="numeric"
                  value={form.vehicleValue}
                  onChangeText={(v) => patch({ vehicleValue: v })}
                />
              </View>
            </View>
          </Card>
        )}

        {currentStep === 'business' && (
          <Card title="Business Details" subtitle="Firm strength & vintage" elevated>
            <Input label="Annual Turnover (₹) *" keyboardType="numeric" value={form.businessTurnover} onChangeText={(v) => patch({ businessTurnover: v })} />
            <Input label="GSTIN" autoCapitalize="characters" value={form.businessGstin} onChangeText={(v) => patch({ businessGstin: v })} />
            <Input label="Business Vintage (years)" keyboardType="numeric" value={form.businessVintageYears} onChangeText={(v) => patch({ businessVintageYears: v })} />
          </Card>
        )}

        {currentStep === 'insurance' && (
          <Card title="Insurance Details" subtitle="Policy & nominee" elevated>
            <Text style={styles.fieldLabel}>Policy Type</Text>
            <ChipSelect options={INSURANCE_POLICY_TYPES} value={form.insurancePolicyType} onChange={(v) => patch({ insurancePolicyType: v })} />
            <Input label="Sum Assured (₹) *" keyboardType="numeric" value={form.insuranceSumAssured} onChangeText={(v) => patch({ insuranceSumAssured: v })} />
            <Input label="Nominee Name *" value={form.insuranceNomineeName} onChangeText={(v) => patch({ insuranceNomineeName: v })} />
            <Input label="Nominee Relation" placeholder="Spouse / Parent / Child" value={form.insuranceNomineeRelation} onChangeText={(v) => patch({ insuranceNomineeRelation: v })} />
          </Card>
        )}

        {currentStep === 'credit_card' && (
          <Card title="Credit Card Preference" subtitle="Card type & income proof" elevated>
            <Text style={styles.fieldLabel}>Card Type</Text>
            <ChipSelect options={CREDIT_CARD_TYPES} value={form.creditCardType} onChange={(v) => patch({ creditCardType: v })} />
            <Input label="Employer Name *" value={form.employerName} onChangeText={(v) => patch({ employerName: v })} />
            <Input label="Monthly Income (₹) *" keyboardType="numeric" value={form.monthlyIncome} onChangeText={(v) => patch({ monthlyIncome: v })} />
            <Input label="Card Preference / Bank" placeholder="e.g. HDFC Regalia" value={form.creditCardPreference} onChangeText={(v) => patch({ creditCardPreference: v })} />
          </Card>
        )}

        {currentStep === 'documents' && (
          <Card
            title="Upload Documents"
            subtitle="Add a PDF or photo for each required document"
            elevated
          >
            {documentTypesQuery.isLoading ? (
              <Text style={styles.docHint}>Loading document types…</Text>
            ) : (
              documentChecklist.map((doc) => {
                const uploaded = form.uploadedDocs[doc];
                const isUploading = uploadingDoc === doc;
                const docType = resolveDocumentTypeForLabel(doc, documentTypesQuery.data?.items ?? []);
                return (
                  <View key={doc} style={[styles.docItem, uploaded && styles.docItemDone]}>
                    <View style={styles.docItemHead}>
                      <View style={[styles.docIcon, uploaded && styles.docIconDone]}>
                        <Ionicons
                          name={uploaded ? 'checkmark' : 'document-outline'}
                          size={18}
                          color={uploaded ? colors.onPrimary : colors.primary}
                        />
                      </View>
                      <View style={styles.docItemBody}>
                        <Text style={styles.docLabel}>
                          {docType ? formatDocumentTypeLabel(docType) : formatDocumentChecklistLabel(doc)}
                        </Text>
                        {uploaded ? (
                          <Text style={styles.docFileName}>{uploaded.fileName}</Text>
                        ) : (
                          <Text style={styles.docHint}>
                            {docType
                              ? 'Tap Upload to add a PDF or image'
                              : documentTypesQuery.isError
                                ? `Unable to reach API (${API_BASE_URL})`
                                : documentTypesQuery.isLoading
                                  ? 'Loading document types…'
                                  : 'Document type unavailable — pull to refresh'}
                          </Text>
                        )}
                      </View>
                    </View>
                    <Button
                      title={uploaded ? 'Replace' : 'Upload'}
                      variant={uploaded ? 'secondary' : 'primary'}
                      loading={isUploading}
                      disabled={!docType || (!!uploadingDoc && uploadingDoc !== doc)}
                      onPress={() => void uploadDocument(doc)}
                      style={styles.docUploadBtn}
                    />
                  </View>
                );
              })
            )}
            <View style={styles.docFooter}>
              <Text style={styles.docHint}>
                {Object.keys(form.uploadedDocs).length} of {documentChecklist.length} documents uploaded
              </Text>
            </View>
          </Card>
        )}

        {currentStep === 'review' && (
          <Card title="Review & Submit" subtitle="Confirm details before you send" elevated>
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
              <ReviewRow label="Vehicle" value={formatVehicleReview(form)} />
            )}
            {wizardProfile === 'business' && (
              <ReviewRow label="Turnover" value={formatCurrency(Number(form.businessTurnover || 0))} />
            )}
            {wizardProfile === 'insurance' && (
              <ReviewRow label="Policy" value={`${form.insurancePolicyType} · ${formatCurrency(Number(form.insuranceSumAssured || 0))}`} />
            )}
            {wizardProfile === 'credit_card' && (
              <ReviewRow label="Card" value={`${form.creditCardType.replace(/_/g, ' ')} · ${form.creditCardPreference || '—'}`} />
            )}
            <ReviewRow label="Amount" value={formatCurrency(Number(form.requestedAmount || 0))} />
            <ReviewRow label="Tenure" value={`${form.requestedTenureMonths} months`} />
            <ReviewRow
              label="Documents"
              value={
                Object.keys(form.uploadedDocs).length > 0
                  ? Object.entries(form.uploadedDocs)
                      .map(([label, file]) => `${label}: ${file.fileName}`)
                      .join(' · ')
                  : 'None uploaded'
              }
            />
            {!form.requestedAmount ? (
              <>
                <Input label="Amount (₹) *" keyboardType="numeric" value={form.requestedAmount} onChangeText={(v) => patch({ requestedAmount: v })} />
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
      </View>
    </Screen>
  );
}

function createStyles(colors: AppColors, isDesktop = false, pagePad = spacing.md) {
  return StyleSheet.create({
    body: {
      paddingHorizontal: pagePad,
      paddingBottom: spacing.xxl,
      gap: spacing.md,
      maxWidth: isDesktop ? 880 : undefined,
      width: '100%',
      alignSelf: isDesktop ? 'center' : undefined,
    },
    stepperCard: { gap: spacing.md },
    progressMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    progressMetaLabel: {
      ...typography.label,
      color: colors.text,
      fontSize: 14,
      fontWeight: '700',
    },
    progressMetaPct: {
      ...typography.caption,
      color: colors.primary,
      fontWeight: '700',
      fontSize: 12,
    },
    progressTrack: {
      height: 6,
      borderRadius: radius.full,
      backgroundColor: colors.surface,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      borderRadius: radius.full,
      backgroundColor: colors.primary,
    },
    progressRow: { flexDirection: 'row', alignItems: 'center' },
    progressItem: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    progressDot: {
      width: 32,
      height: 32,
      borderRadius: radius.full,
      backgroundColor: colors.surface,
      borderWidth: 1.5,
      borderColor: colors.borderLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    progressDotActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    progressDotCurrent: {
      ...(Platform.OS === 'web'
        ? ({ boxShadow: `0 0 0 4px ${colors.primary}28` } as object)
        : null),
    },
    progressLine: {
      flex: 1,
      height: 2,
      backgroundColor: colors.borderLight,
      marginHorizontal: 2,
    },
    progressLineActive: { backgroundColor: colors.primary },
    progressLabel: {
      ...typography.caption,
      color: colors.textMuted,
      fontSize: 10,
      maxWidth: 64,
    },
    progressLabelActive: { color: colors.primary, fontWeight: '700' },
    errorBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      padding: spacing.md,
      borderRadius: radius.md,
      backgroundColor: `${colors.danger}14`,
      borderWidth: 1,
      borderColor: `${colors.danger}40`,
    },
    error: { ...typography.bodySm, color: colors.danger, flex: 1 },
    fieldLabel: {
      ...typography.label,
      color: colors.textSecondary,
      marginBottom: spacing.sm,
      fontSize: 13,
    },
    fieldGrid: {
      flexDirection: isDesktop ? 'row' : 'column',
      gap: isDesktop ? spacing.md : 0,
    },
    fieldHalf: { flex: 1 },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
    chip: {
      paddingHorizontal: spacing.md,
      paddingVertical: 10,
      borderRadius: radius.full,
      borderWidth: 1.5,
      borderColor: colors.borderLight,
      backgroundColor: colors.surface,
    },
    chipActive: {
      borderColor: `${colors.primary}55`,
      backgroundColor: `${colors.primary}16`,
    },
    chipText: { ...typography.bodySm, color: colors.textSecondary, fontWeight: '600' },
    chipTextActive: { color: colors.primary, fontWeight: '700' },
    docItem: {
      padding: spacing.md,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.borderLight,
      backgroundColor: colors.surface,
      gap: spacing.md,
      marginBottom: spacing.sm,
    },
    docItemDone: {
      borderColor: `${colors.success}40`,
      backgroundColor: `${colors.success}0d`,
    },
    docItemHead: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
    docIcon: {
      width: 36,
      height: 36,
      borderRadius: radius.md,
      backgroundColor: `${colors.primary}16`,
      alignItems: 'center',
      justifyContent: 'center',
    },
    docIconDone: { backgroundColor: colors.success },
    docItemBody: { flex: 1 },
    docLabel: { ...typography.label, color: colors.text, fontSize: 14 },
    docFileName: { ...typography.bodySm, color: colors.primary, marginTop: 4, fontWeight: '600' },
    docUploadBtn: { alignSelf: 'stretch' },
    docHint: { ...typography.bodySm, color: colors.textMuted, marginTop: 4, lineHeight: 18 },
    docFooter: { marginTop: spacing.sm },
    reviewRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: spacing.md,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    reviewLabel: { ...typography.bodySm, color: colors.textMuted, flex: 1 },
    reviewValue: { ...typography.label, color: colors.text, flex: 1.2, textAlign: 'right' },
    actions: {
      flexDirection: 'row',
      gap: spacing.md,
      marginTop: spacing.sm,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.borderLight,
    },
    actionBtn: { flex: 1, minHeight: 48 },
    successBox: { alignItems: 'center', paddingVertical: spacing.xl, gap: spacing.sm },
    successIcon: {
      width: 80,
      height: 80,
      borderRadius: radius.full,
      backgroundColor: `${colors.success}18`,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.sm,
    },
    successTitle: { ...typography.h2, color: colors.text, fontWeight: '800' },
    successSub: { ...typography.bodySm, color: colors.textMuted },
    successActions: { gap: spacing.sm, marginTop: spacing.md },
  });
}
