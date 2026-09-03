import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Linking, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button, Card, Screen, StatusBadge } from '@/components/ui';
import { partnerBrandingService } from '@/services';
import { spacing, typography } from '@/theme';
import { useAppTheme } from '@/theme/ThemeProvider';

const CONTENT_TYPES = [
  { type: 'LINKEDIN_POST', label: 'LinkedIn Post' },
  { type: 'INSTAGRAM_CAPTION', label: 'Instagram Caption' },
  { type: 'BIOGRAPHY', label: 'Biography' },
  { type: 'FINANCE_TIP', label: 'Finance Tip' },
];

type FormState = {
  displayName: string;
  designation: string;
  companyName: string;
  tagline: string;
  biography: string;
  mission: string;
  vision: string;
  city: string;
  experienceYears: string;
  businessSince: string;
  languages: string;
  phone: string;
  whatsapp: string;
  email: string;
  photoUrl: string;
  officeAddress: string;
};

const EMPTY: FormState = {
  displayName: '',
  designation: '',
  companyName: '',
  tagline: '',
  biography: '',
  mission: '',
  vision: '',
  city: '',
  experienceYears: '',
  businessSince: '',
  languages: '',
  phone: '',
  whatsapp: '',
  email: '',
  photoUrl: '',
  officeAddress: '',
};

export function BrandingDashboardScreen() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [generatedContent, setGeneratedContent] = useState('');

  const profile = useQuery({
    queryKey: ['partner-branding'],
    queryFn: () => partnerBrandingService.getMyProfile(),
    retry: false,
  });

  useEffect(() => {
    const data = profile.data;
    if (!data) return;
    setForm({
      displayName: data.displayName ?? '',
      designation: data.designation ?? '',
      companyName: data.companyName ?? '',
      tagline: data.tagline ?? '',
      biography: data.biography ?? '',
      mission: data.mission ?? '',
      vision: data.vision ?? '',
      city: data.location?.city ?? '',
      experienceYears: data.experienceYears != null ? String(data.experienceYears) : '',
      businessSince: data.businessSince != null ? String(data.businessSince) : '',
      languages: data.languages?.length ? data.languages.join(', ') : '',
      phone: data.contact?.phone ?? '',
      whatsapp: data.contact?.whatsapp ?? '',
      email: data.contact?.email ?? '',
      photoUrl: data.photoUrl ?? '',
      officeAddress: data.company?.officeAddress ?? data.officeAddress ?? '',
    });
  }, [profile.data]);

  const setField = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const saveMutation = useMutation({
    mutationFn: () => {
      const languages = form.languages
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const experienceYears = form.experienceYears.trim()
        ? Number.parseInt(form.experienceYears, 10)
        : undefined;
      const businessSince = form.businessSince.trim()
        ? Number.parseInt(form.businessSince, 10)
        : undefined;

      return partnerBrandingService.updateMyProfile({
        displayName: form.displayName || undefined,
        designation: form.designation || null,
        companyName: form.companyName || null,
        tagline: form.tagline || null,
        biography: form.biography || null,
        mission: form.mission || null,
        vision: form.vision || null,
        city: form.city || null,
        experienceYears: Number.isFinite(experienceYears) ? experienceYears : null,
        businessSince: Number.isFinite(businessSince) ? businessSince : null,
        languages: languages.length ? languages : undefined,
        phone: form.phone || null,
        whatsapp: form.whatsapp || null,
        email: form.email || null,
        photoUrl: form.photoUrl || null,
        officeAddress: form.officeAddress || null,
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['partner-branding'] });
      Alert.alert('Saved', 'Your public profile has been updated. Refresh the live page to see changes.');
    },
    onError: () => Alert.alert('Error', 'Could not save profile.'),
  });

  const publishMutation = useMutation({
    mutationFn: (publish: boolean) => partnerBrandingService.publish(publish),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ['partner-branding'] });
      Alert.alert(
        data.isPublished ? 'Published' : 'Unpublished',
        data.isPublished ? 'Your profile is now public.' : 'Profile hidden from public.',
      );
    },
    onError: (err: Error) => Alert.alert('Error', err.message || 'Could not update publish status.'),
  });

  const generateMutation = useMutation({
    mutationFn: (type: string) => partnerBrandingService.generateContent(type),
    onSuccess: (data) => setGeneratedContent(data.body),
    onError: () => Alert.alert('Error', 'Could not generate content.'),
  });

  const data = profile.data;

  if (profile.isLoading) {
    return (
      <Screen>
        <Card>
          <Text style={styles.muted}>Loading your brand profile...</Text>
        </Card>
      </Screen>
    );
  }

  const profileUrl = data?.profileUrl;

  return (
    <Screen scroll>
      <Card>
        <View style={styles.headerRow}>
          <Ionicons name="ribbon" size={28} color={colors.primary} />
          <View style={styles.headerText}>
            <Text style={styles.title}>Kuber Verified Professional™</Text>
            <Text style={styles.subtitle}>Edit once — your public page updates live</Text>
          </View>
        </View>
        <View style={styles.badgeRow}>
          <StatusBadge status={data?.isPublished ? 'PUBLISHED' : 'DRAFT'} />
          {data?.badges?.slice(0, 2).map((b) => (
            <View key={b.type} style={styles.miniBadge}>
              <Text style={styles.miniBadgeText}>{b.label}</Text>
            </View>
          ))}
        </View>
        {profileUrl ? (
          <Pressable onPress={() => void Linking.openURL(profileUrl)}>
            <Text style={styles.link}>{profileUrl}</Text>
          </Pressable>
        ) : null}
      </Card>

      <Card title="Identity">
        <Field label="Display Name" value={form.displayName} onChange={(v) => setField('displayName', v)} styles={styles} colors={colors} />
        <Field label="Designation" value={form.designation} onChange={(v) => setField('designation', v)} styles={styles} colors={colors} placeholder="e.g. Executive Partner — Financial Solutions" />
        <Field label="Company Name" value={form.companyName} onChange={(v) => setField('companyName', v)} styles={styles} colors={colors} />
        <Field label="Tagline" value={form.tagline} onChange={(v) => setField('tagline', v)} styles={styles} colors={colors} placeholder="One-line promise to customers" />
        <Field label="Photo URL" value={form.photoUrl} onChange={(v) => setField('photoUrl', v)} styles={styles} colors={colors} placeholder="https://..." />
      </Card>

      <Card title="About">
        <Field label="Biography" value={form.biography} onChange={(v) => setField('biography', v)} styles={styles} colors={colors} multiline />
        <Field label="Mission" value={form.mission} onChange={(v) => setField('mission', v)} styles={styles} colors={colors} multiline />
        <Field label="Vision" value={form.vision} onChange={(v) => setField('vision', v)} styles={styles} colors={colors} multiline />
        <Field label="Languages (comma separated)" value={form.languages} onChange={(v) => setField('languages', v)} styles={styles} colors={colors} placeholder="English, Hindi" />
        <Field label="City" value={form.city} onChange={(v) => setField('city', v)} styles={styles} colors={colors} placeholder="e.g. Delhi NCR" />
        <Field label="Experience years" value={form.experienceYears} onChange={(v) => setField('experienceYears', v)} styles={styles} colors={colors} placeholder="e.g. 8" keyboardType="number-pad" />
        <Field label="Business since (year)" value={form.businessSince} onChange={(v) => setField('businessSince', v)} styles={styles} colors={colors} placeholder="e.g. 2018" keyboardType="number-pad" />
        <Field label="Office address" value={form.officeAddress} onChange={(v) => setField('officeAddress', v)} styles={styles} colors={colors} multiline />
      </Card>

      <Card title="Contact (shown on public page)">
        <Field label="Phone" value={form.phone} onChange={(v) => setField('phone', v)} styles={styles} colors={colors} keyboardType="phone-pad" />
        <Field label="WhatsApp" value={form.whatsapp} onChange={(v) => setField('whatsapp', v)} styles={styles} colors={colors} keyboardType="phone-pad" placeholder="10-digit mobile" />
        <Field label="Email" value={form.email} onChange={(v) => setField('email', v)} styles={styles} colors={colors} keyboardType="email-address" />
        <Button title="Save Profile" fullWidth onPress={() => saveMutation.mutate()} loading={saveMutation.isPending} />
      </Card>

      <Card title="Publish">
        <Text style={styles.muted}>
          After KYC verification your page can go live. Unpublish anytime from here.
        </Text>
        <View style={styles.row}>
          <Button
            title={data?.isPublished ? 'Unpublish' : 'Publish Profile'}
            variant={data?.isPublished ? 'secondary' : 'primary'}
            onPress={() => publishMutation.mutate(!data?.isPublished)}
            loading={publishMutation.isPending}
          />
          {profileUrl ? (
            <Button title="View Public" variant="secondary" onPress={() => void Linking.openURL(profileUrl)} />
          ) : null}
        </View>
      </Card>

      <Card title="AI Content Generator">
        <Text style={styles.muted}>Generate daily branding content for social media.</Text>
        <View style={styles.chips}>
          {CONTENT_TYPES.map((c) => (
            <Pressable key={c.type} style={styles.chip} onPress={() => generateMutation.mutate(c.type)}>
              <Text style={styles.chipText}>{c.label}</Text>
            </Pressable>
          ))}
        </View>
        {generatedContent ? (
          <View style={styles.generatedBox}>
            <Text style={styles.generatedText}>{generatedContent}</Text>
          </View>
        ) : null}
        {generateMutation.isPending ? <Text style={styles.muted}>Generating...</Text> : null}
      </Card>
    </Screen>
  );
}

function Field({
  label,
  value,
  onChange,
  styles,
  colors,
  placeholder,
  multiline,
  keyboardType,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  styles: ReturnType<typeof createStyles>;
  colors: ReturnType<typeof useAppTheme>['colors'];
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: 'default' | 'number-pad' | 'phone-pad' | 'email-address';
}) {
  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline ? styles.textArea : null]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        keyboardType={keyboardType}
        autoCapitalize={keyboardType === 'email-address' ? 'none' : 'sentences'}
      />
    </>
  );
}

function createStyles(colors: ReturnType<typeof useAppTheme>['colors']) {
  return StyleSheet.create({
    headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    headerText: { flex: 1 },
    title: { ...typography.h3, color: colors.text },
    subtitle: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
    badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.md },
    miniBadge: {
      backgroundColor: colors.surface,
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: 12,
    },
    miniBadgeText: { fontSize: 11, color: colors.primary, fontWeight: '600' },
    link: { color: colors.primary, marginTop: spacing.sm, fontSize: 13 },
    label: { ...typography.caption, color: colors.textSecondary, marginBottom: 4, marginTop: spacing.sm },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      padding: spacing.sm,
      color: colors.text,
      backgroundColor: colors.surface,
    },
    textArea: { minHeight: 100, textAlignVertical: 'top' },
    muted: { ...typography.caption, color: colors.textMuted, marginBottom: spacing.sm },
    row: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm, flexWrap: 'wrap' },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.sm },
    chip: {
      backgroundColor: colors.surface,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    chipText: { fontSize: 12, color: colors.text, fontWeight: '500' },
    generatedBox: {
      marginTop: spacing.md,
      padding: spacing.md,
      backgroundColor: colors.surface,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    generatedText: { ...typography.body, color: colors.text, lineHeight: 22 },
  });
}
