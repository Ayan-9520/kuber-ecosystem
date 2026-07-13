import { useMemo } from 'react';
import { StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native';

import { radius, spacing, typography } from '@/theme';
import { type AppColors, useAppTheme } from '@/theme/ThemeProvider';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  /** Use on premium white login cards */
  onLightSurface?: boolean;
}

function createStyles(colors: AppColors, onLightSurface?: boolean) {
  const labelColor = onLightSurface ? '#475569' : colors.textSecondary;
  const inputBg = onLightSurface ? '#f8fafc' : colors.surface;
  const inputBorder = onLightSurface ? '#e2e8f0' : colors.border;
  const inputText = onLightSurface ? '#0f172a' : colors.text;
  const placeholderColor = onLightSurface ? '#94a3b8' : colors.textMuted;

  const styles = StyleSheet.create({
    wrap: { marginBottom: spacing.md },
    label: { ...typography.label, color: labelColor, marginBottom: spacing.sm },
    input: {
      backgroundColor: inputBg,
      borderWidth: 1,
      borderColor: inputBorder,
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: 14,
      color: inputText,
      fontSize: 15,
    },
    inputError: { borderColor: colors.danger },
    error: { ...typography.bodySm, color: colors.danger, marginTop: spacing.xs },
  });

  return { styles, placeholderColor };
}

export function Input({ label, error, style, onLightSurface, ...rest }: InputProps) {
  const { colors } = useAppTheme();
  const { styles, placeholderColor } = useMemo(
    () => createStyles(colors, onLightSurface),
    [colors, onLightSurface],
  );

  return (
    <View style={styles.wrap}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, error && styles.inputError, style]}
        placeholderTextColor={placeholderColor}
        {...rest}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}
