import { Ionicons } from '@expo/vector-icons';
import type { ThemePreference } from '@kuberone/shared-theme';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui';
import { radius, spacing, typography } from '@/theme';
import { useAppTheme } from '@/theme/ThemeProvider';

const OPTIONS: { id: Exclude<ThemePreference, 'system'>; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'light', label: 'Light', icon: 'sunny-outline' },
  { id: 'dark', label: 'Dark', icon: 'moon-outline' },
];

export function ThemeAppearanceCard() {
  const { colors, preference, setPreference, resolved } = useAppTheme();
  const styles = createStyles(colors);
  const activeId = preference === 'system' ? resolved : preference;

  return (
    <Card title="Appearance" subtitle="Choose light or dark mode.">
      <View style={styles.row}>
        {OPTIONS.map((option) => {
          const active = activeId === option.id;
          return (
            <Pressable
              key={option.id}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={({ pressed }) => [
                styles.option,
                active && styles.optionActive,
                pressed && styles.optionPressed,
                Platform.OS === 'web' && ({ cursor: 'pointer' } as const),
              ]}
              onPress={() => setPreference(option.id)}
            >
              <View style={[styles.iconPlate, active && styles.iconPlateActive]}>
                <Ionicons name={option.icon} size={20} color={active ? colors.primary : colors.textMuted} />
              </View>
              <Text style={[styles.optionLabel, active && styles.optionLabelActive]}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </Card>
  );
}

function createStyles(colors: ReturnType<typeof useAppTheme>['colors']) {
  return StyleSheet.create({
    row: { flexDirection: 'row', gap: spacing.md },
    option: {
      flex: 1,
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing.md,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.borderLight,
      backgroundColor: colors.surface,
    },
    optionActive: {
      borderColor: `${colors.primary}55`,
      backgroundColor: `${colors.primary}14`,
    },
    optionPressed: { opacity: 0.9 },
    iconPlate: {
      width: 44,
      height: 44,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    iconPlateActive: {
      backgroundColor: `${colors.primary}18`,
      borderColor: `${colors.primary}35`,
    },
    optionLabel: { ...typography.label, color: colors.textMuted, fontSize: 13 },
    optionLabelActive: { color: colors.primary, fontWeight: '700' },
  });
}
