import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
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

export function BrandingDashboardScreen() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const queryClient = useQueryClient();

  const [displayName, setDisplayName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [tagline, setTagline] = useState('');
  const [biography, setBiography] = useState('');
  const [city, setCity] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');

  const profile = useQuery({
    queryKey: ['partner-branding'],
    queryFn: () => partnerBrandingService.getMyProfile(),
    retry: false,
  });

  const saveMutation = useMutation({
    mutationFn: () =>
      partnerBrandingService.updateMyProfile({
        displayName: displayName || profile.data?.displayName,
        companyName: companyName || profile.data?.companyName,
        tagline: tagline || profile.data?.tagline,
        biography: biography || profile.data?.biography,
        city: city || undefined,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['partner-branding'] });
      Alert.alert('Saved', 'Your brand profile has been updated.');
    },
    onError: () => Alert.alert('Error', 'Could not save profile.'),
  });

  const publishMutation = useMutation({
    mutationFn: (publish: boolean) => partnerBrandingService.publish(publish),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ['partner-branding'] });
      Alert.alert(data.isPublished ? 'Published' : 'Unpublished', data.isPublished ? 'Your profile is now public.' : 'Profile hidden from public.');
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
            <Text style={styles.subtitle}>Your digital business identity</Text>
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

      <Card title="Edit Profile">
        <Text style={styles.muted}>
          Starter content is auto-filled from your partner role and products. Edit About anytime — your public
          page updates after Save.
        </Text>
        <Text style={styles.label}>Display Name</Text>
        <TextInput
          style={styles.input}
          defaultValue={data?.displayName}
          onChangeText={setDisplayName}
          placeholder="Your professional name"
          placeholderTextColor={colors.textMuted}
        />
        <Text style={styles.label}>Company Name</Text>
        <TextInput
          style={styles.input}
          defaultValue={data?.companyName ?? ''}
          onChangeText={setCompanyName}
          placeholder="Your company"
          placeholderTextColor={colors.textMuted}
        />
        <Text style={styles.label}>Tagline</Text>
        <TextInput
          style={styles.input}
          defaultValue={data?.tagline ?? ''}
          onChangeText={setTagline}
          placeholder="One-line promise to customers"
          placeholderTextColor={colors.textMuted}
        />
        <Text style={styles.label}>City</Text>
        <TextInput
          style={styles.input}
          defaultValue={data?.location?.city ?? ''}
          onChangeText={setCity}
          placeholder="e.g. Delhi NCR"
          placeholderTextColor={colors.textMuted}
        />
        <Text style={styles.label}>About / Biography</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          defaultValue={data?.biography ?? ''}
          onChangeText={setBiography}
          placeholder="Professional biography"
          placeholderTextColor={colors.textMuted}
          multiline
          numberOfLines={5}
        />
        <Button title="Save Profile" fullWidth onPress={() => saveMutation.mutate()} loading={saveMutation.isPending} />
      </Card>

      <Card title="Publish">
        <Text style={styles.muted}>
          After KYC verification your page goes live automatically. You can still unpublish or re-publish here.
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
