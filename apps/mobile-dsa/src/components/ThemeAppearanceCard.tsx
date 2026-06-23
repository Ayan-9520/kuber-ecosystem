import { Ionicons } from '@expo/vector-icons';
import type { ThemePreference } from '@kuberone/shared-theme';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui';
import { spacing, typography } from '@/theme';
import { useAppTheme } from '@/theme/ThemeProvider';

const OPTIONS: { id: ThemePreference; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'light', label: 'Light', icon: 'sunny-outline' },
  { id: 'dark', label: 'Dark', icon: 'moon-outline' },
  { id: 'system', label: 'System', icon: 'phone-portrait-outline' },
];

export function ThemeAppearanceCard() {
  const { colors, preference, setPreference } = useAppTheme();
  const styles = createStyles(colors);

  return (
    <Card title="Appearance" subtitle="Light, dark, or match your device system theme.">
      <View style={styles.row}>
        {OPTIONS.map((option) => {
          const active = preference === option.id;
          return (
            <Pressable
              key={option.id}
              style={[styles.option, active && styles.optionActive]}
              onPress={() => setPreference(option.id)}
            >
              <Ionicons name={option.icon} size={20} color={active ? colors.primary : colors.textMuted} />
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
    row: { flexDirection: 'row', gap: spacing.sm },
    option: {
      flex: 1,
      alignItems: 'center',
      gap: spacing.xs,
      paddingVertical: spacing.md,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    optionActive: {
      borderColor: colors.primary,
      backgroundColor: `${colors.primary}1F`,
    },
    optionLabel: { ...typography.caption, color: colors.textMuted },
    optionLabelActive: { color: colors.primary, fontWeight: '600' },
  });
}
