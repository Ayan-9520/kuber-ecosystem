import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StatusBadge } from './StatusBadge';

import { colors, spacing, typography } from '@/theme';

interface ListRowProps {
  title: string;
  subtitle?: string;
  status?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  right?: React.ReactNode;
}

export function ListRow({ title, subtitle, status, icon, onPress, right }: ListRowProps) {
  return (
    <Pressable style={styles.row} onPress={onPress} disabled={!onPress}>
      {icon ? (
        <View style={styles.iconWrap}>
          <Ionicons name={icon} size={20} color={colors.primary} />
        </View>
      ) : null}
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {status ? <StatusBadge status={status} /> : null}
      {right}
      {onPress && !right ? <Ionicons name="chevron-forward" size={18} color={colors.textMuted} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { flex: 1 },
  title: { ...typography.body, color: colors.text, fontWeight: '600' },
  subtitle: { ...typography.bodySm, color: colors.textMuted, marginTop: 2 },
});
