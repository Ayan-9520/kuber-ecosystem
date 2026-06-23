import { Ionicons } from '@expo/vector-icons';
import { type RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button, Card, Input, Screen } from '@/components/ui';
import { useAuth } from '@/hooks';
import { guessMimeType, resolveDocumentTypeForLabel } from '@/lib/document-checklist';
import { pickDocumentBase64 } from '@/lib/read-file-base64';
import { findProductDisplayItem, flattenProductsWithVariants } from '@/lib/product-mapper';
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
import { colors, radius, spacing, typography } from '@/theme';

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
    queryFn: async () => {
      const [products, variants] = await Promise.all([
        productsService.list({ limit: 50 }),
        productsService.variants(),
      ]);
      return flattenProductsWithVariants(products.items, variants.items);
    },
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
      setError('Customer profile not linked. Logout karke dubara login karein.');
      return;
    }

    const docType = resolveDocumentTypeForLabel(docLabel, documentTypesQuery.data?.items ?? []);
    if (!docType?.id) {
      setError(`Document type not configured for "${docLabel}". Contact support.`);
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
      if (!cid) throw new Error('Customer profile not linked. Logout karke Register se dubara login karein.');
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
          <Button
            title="Back to Applications"
            variant="secondary"
            fullWidth
            onPress={() => navigation.getParent()?.navigate('Applications', { screen: 'ApplicationsList' })}
          />
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
        <Card title="Property Details">
          <Input label="Property Type" placeholder="Flat / House / Plot" value={form.propertyType} onChangeText={(v) => patch({ propertyType: v })} />
          <Input label="Property Value (₹) *" keyboardType="numeric" value={form.propertyValue} onChangeText={(v) => patch({ propertyValue: v })} />
          <Input label="Property City" value={form.propertyCity} onChangeText={(v) => patch({ propertyCity: v })} />
        </Card>
      )}

      {currentStep === 'collateral' && form.collateralMode === 'vehicle' && (
        <Card title="Vehicle Details" subtitle="Used / pre-owned car details for loan assessment">
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
            label="Model *"
            placeholder="e.g. Swift, i20, Nexon (model name — not year)"
            value={form.vehicleModel}
            onChangeText={(v) => patch({ vehicleModel: v })}
          />
          <Input
            label="Manufacturing year *"
            placeholder="e.g. 2020"
            keyboardType="numeric"
            maxLength={4}
            value={form.vehicleYear}
            onChangeText={(v) => patch({ vehicleYear: v })}
          />
          <Input
            label="On-road / Valuation (₹) *"
            placeholder="Current market value"
            keyboardType="numeric"
            value={form.vehicleValue}
            onChangeText={(v) => patch({ vehicleValue: v })}
          />
        </Card>
      )}

      {currentStep === 'business' && (
        <Card title="Business Details">
          <Input label="Annual Turnover (₹) *" keyboardType="numeric" value={form.businessTurnover} onChangeText={(v) => patch({ businessTurnover: v })} />
          <Input label="GSTIN" autoCapitalize="characters" value={form.businessGstin} onChangeText={(v) => patch({ businessGstin: v })} />
          <Input label="Business Vintage (years)" keyboardType="numeric" value={form.businessVintageYears} onChangeText={(v) => patch({ businessVintageYears: v })} />
        </Card>
      )}

      {currentStep === 'insurance' && (
        <Card title="Insurance Details">
          <Text style={styles.fieldLabel}>Policy Type</Text>
          <ChipSelect options={INSURANCE_POLICY_TYPES} value={form.insurancePolicyType} onChange={(v) => patch({ insurancePolicyType: v })} />
          <Input label="Sum Assured (₹) *" keyboardType="numeric" value={form.insuranceSumAssured} onChangeText={(v) => patch({ insuranceSumAssured: v })} />
          <Input label="Nominee Name *" value={form.insuranceNomineeName} onChangeText={(v) => patch({ insuranceNomineeName: v })} />
          <Input label="Nominee Relation" placeholder="Spouse / Parent / Child" value={form.insuranceNomineeRelation} onChangeText={(v) => patch({ insuranceNomineeRelation: v })} />
        </Card>
      )}

      {currentStep === 'credit_card' && (
        <Card title="Credit Card Preference">
          <Text style={styles.fieldLabel}>Card Type</Text>
          <ChipSelect options={CREDIT_CARD_TYPES} value={form.creditCardType} onChange={(v) => patch({ creditCardType: v })} />
          <Input label="Employer Name *" value={form.employerName} onChangeText={(v) => patch({ employerName: v })} />
          <Input label="Monthly Income (₹) *" keyboardType="numeric" value={form.monthlyIncome} onChangeText={(v) => patch({ monthlyIncome: v })} />
          <Input label="Card Preference / Bank" placeholder="e.g. HDFC Regalia" value={form.creditCardPreference} onChangeText={(v) => patch({ creditCardPreference: v })} />
        </Card>
      )}

      {currentStep === 'documents' && (
        <Card title="Upload Documents" subtitle="Har required document ke liye file upload karein (PDF / photo)">
          {documentTypesQuery.isLoading ? (
            <Text style={styles.docHint}>Loading document types...</Text>
          ) : (
            documentChecklist.map((doc) => {
              const uploaded = form.uploadedDocs[doc];
              const isUploading = uploadingDoc === doc;
              const docType = resolveDocumentTypeForLabel(doc, documentTypesQuery.data?.items ?? []);
              return (
                <View key={doc} style={styles.docItem}>
                  <View style={styles.docItemHead}>
                    <Ionicons
                      name={uploaded ? 'checkmark-circle' : 'document-outline'}
                      size={22}
                      color={uploaded ? colors.success : colors.textMuted}
                    />
                    <View style={styles.docItemBody}>
                      <Text style={styles.docLabel}>{doc}</Text>
                      {uploaded ? (
                        <Text style={styles.docFileName}>{uploaded.fileName}</Text>
                      ) : (
                        <Text style={styles.docHint}>
                          {docType ? 'Tap upload — PDF or image' : 'Type not mapped — contact support'}
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
          <Text style={styles.docHint}>
            {Object.keys(form.uploadedDocs).length}/{documentChecklist.length} uploaded
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
  docItem: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  docItemHead: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  docItemBody: { flex: 1 },
  docLabel: { ...typography.label, color: colors.text },
  docFileName: { ...typography.bodySm, color: colors.primary, marginTop: 4 },
  docUploadBtn: { alignSelf: 'stretch' },
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
