// Shared building blocks for screens. Sizes and colours meet QA-06: touch
// targets of at least 44 points, text contrast of at least 4.5 to 1, and text
// that scales with the system font size.

import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

export const colours = {
  text: '#1A1A1A',
  muted: '#4A4A4A',
  background: '#FFFFFF',
  primary: '#1F4D3A',
  onPrimary: '#FFFFFF',
  border: '#6B6B6B',
  error: '#A11D1D',
};

const MIN_TOUCH = 44;

export function Screen({ children }: { children: ReactNode }) {
  return <View style={styles.screen}>{children}</View>;
}

export function Title({ children }: { children: ReactNode }) {
  return (
    <Text accessibilityRole="header" style={styles.title}>
      {children}
    </Text>
  );
}

export function Body({ children }: { children: ReactNode }) {
  return <Text style={styles.body}>{children}</Text>;
}

// Announced by screen readers when it appears.
export function ErrorText({ children }: { children: ReactNode }) {
  return (
    <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.error}>
      {children}
    </Text>
  );
}

export function Field({ label, ...input }: { label: string } & TextInputProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput accessibilityLabel={label} placeholderTextColor={colours.muted} style={styles.input} {...input} />
    </View>
  );
}

export function Button({
  label,
  onPress,
  disabled = false,
  variant = 'primary',
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}) {
  const primary = variant === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        primary ? styles.primary : styles.secondary,
        (pressed || disabled) && styles.dimmed,
      ]}
    >
      <Text style={primary ? styles.primaryLabel : styles.secondaryLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colours.background,
    paddingHorizontal: 24,
    justifyContent: 'center',
    gap: 16,
  },
  title: { fontSize: 28, fontWeight: '700', color: colours.text },
  body: { fontSize: 17, lineHeight: 24, color: colours.text },
  error: { fontSize: 17, lineHeight: 24, color: colours.error, fontWeight: '600' },
  field: { gap: 6 },
  label: { fontSize: 17, fontWeight: '600', color: colours.text },
  input: {
    minHeight: MIN_TOUCH,
    borderWidth: 1,
    borderColor: colours.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 17,
    color: colours.text,
  },
  button: {
    minHeight: MIN_TOUCH,
    borderRadius: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: { backgroundColor: colours.primary },
  secondary: { backgroundColor: colours.background },
  dimmed: { opacity: 0.6 },
  primaryLabel: { fontSize: 17, fontWeight: '600', color: colours.onPrimary },
  secondaryLabel: { fontSize: 17, fontWeight: '600', color: colours.primary, textDecorationLine: 'underline' },
});
