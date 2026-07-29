import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui';
import { spacing, typography } from '@/theme';
import { useAppTheme } from '@/theme/ThemeProvider';

export function ThemeAppearanceCard() {
  const { colors, resolved, setPreference } = useAppTheme();
  const isDark = resolved === 'dark';

  return (
    <Card title="Appearance" subtitle="Choose your preferred theme">
      <View style={styles.track}>
        <Pressable
          style={[
            styles.pill,
            { backgroundColor: !isDark ? colors.primary : 'transparent', borderColor: colors.border },
          ]}
          onPress={() => setPreference('light')}
        >
          <Ionicons name="sunny" size={16} color={!isDark ? colors.onPrimary : colors.textMuted} />
          <Text
            style={[
              typography.label,
              { color: !isDark ? colors.onPrimary : colors.textMuted },
            ]}
          >
            Light
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.pill,
            { backgroundColor: isDark ? colors.primary : 'transparent', borderColor: colors.border },
          ]}
          onPress={() => setPreference('dark')}
        >
          <Ionicons name="moon" size={16} color={isDark ? colors.onPrimary : colors.textMuted} />
          <Text
            style={[
              typography.label,
              { color: isDark ? colors.onPrimary : colors.textMuted },
            ]}
          >
            Dark
          </Text>
        </Pressable>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  pill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
});
