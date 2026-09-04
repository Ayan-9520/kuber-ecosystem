import { useMemo, useState } from 'react';
import { Platform, StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native';

import { radius, spacing, typography } from '@/theme';
import { type AppColors, useAppTheme } from '@/theme/ThemeProvider';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  /** Use on premium white login cards */
  onLightSurface?: boolean;
  hint?: string;
}

function createStyles(colors: AppColors, onLightSurface?: boolean) {
  const labelColor = onLightSurface ? '#475569' : colors.textSecondary;
  const inputBg = onLightSurface ? '#f8fafc' : colors.surface;
  const inputBorder = onLightSurface ? '#e2e8f0' : colors.borderLight;
  const inputText = onLightSurface ? '#0f172a' : colors.text;
  const placeholderColor = onLightSurface ? '#94a3b8' : colors.textMuted;

  const styles = StyleSheet.create({
    wrap: { marginBottom: spacing.md },
    label: {
      ...typography.label,
      color: labelColor,
      marginBottom: spacing.sm,
      fontSize: 13,
      fontWeight: '600',
    },
    input: {
      backgroundColor: inputBg,
      borderWidth: 1.5,
      borderColor: inputBorder,
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: Platform.OS === 'web' ? 14 : 13,
      color: inputText,
      fontSize: 15,
      minHeight: 48,
    },
    inputFocused: {
      borderColor: colors.primary,
      backgroundColor: onLightSurface ? '#ffffff' : `${colors.primary}08`,
      ...(Platform.OS === 'web'
        ? ({ boxShadow: `0 0 0 3px ${colors.primary}22` } as object)
        : null),
    },
    inputError: { borderColor: colors.danger },
    error: { ...typography.bodySm, color: colors.danger, marginTop: spacing.xs },
    hint: { ...typography.bodySm, color: colors.textMuted, marginTop: spacing.xs, fontSize: 12 },
  });

  return { styles, placeholderColor };
}

export function Input({ label, error, hint, style, onLightSurface, onFocus, onBlur, ...rest }: InputProps) {
  const { colors } = useAppTheme();
  const [focused, setFocused] = useState(false);
  const { styles, placeholderColor } = useMemo(
    () => createStyles(colors, onLightSurface),
    [colors, onLightSurface],
  );

  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        style={[
          styles.input,
          focused && styles.inputFocused,
          error && styles.inputError,
          style,
        ]}
        placeholderTextColor={placeholderColor}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        {...rest}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {!error && hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}
