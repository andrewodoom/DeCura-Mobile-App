// Shared building blocks for screens. Sizes and colours meet QA-06: touch
// targets of at least 44 points, text contrast of at least 4.5 to 1, text that
// scales with the system font size, and content that scrolls clear of the
// keyboard at 200 percent text.

import { useEffect, useRef, type ReactNode, type Ref } from 'react';
import {
  AccessibilityInfo,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type HostInstance,
  type TextInputProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const colours = {
  text: '#1A1A1A',
  muted: '#4A4A4A',
  background: '#FFFFFF',
  primary: '#1F4D3A',
  primaryPressed: '#163A2B',
  onPrimary: '#FFFFFF',
  pressedBackground: '#E8EFEC',
  border: '#6B6B6B',
  error: '#A11D1D',
};

const MIN_TOUCH = 44;

// Speaks a message even when the text on screen has not changed (iOS does not
// announce new text with the alert role alone).
export function announce(message: string) {
  AccessibilityInfo.announceForAccessibility(message);
}

// Moves screen reader focus to the element when `key` changes, for example a
// screen's title when the step changes.
export function useAccessibilityFocus(key: unknown): Ref<HostInstance> {
  const ref = useRef<HostInstance>(null);
  useEffect(() => {
    if (ref.current) {
      AccessibilityInfo.sendAccessibilityEvent(ref.current, 'focus');
    }
  }, [key]);
  return ref;
}

export function Screen({ children }: { children: ReactNode }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function Loading() {
  return (
    <Screen>
      <ActivityIndicator accessibilityLabel="Loading" color={colours.primary} size="large" />
    </Screen>
  );
}

export function Title({ children, ref }: { children: ReactNode; ref?: Ref<HostInstance> }) {
  return (
    <Text ref={ref} accessibilityRole="header" style={styles.title}>
      {children}
    </Text>
  );
}

export function Body({ children }: { children: ReactNode }) {
  return <Text style={styles.body}>{children}</Text>;
}

// A neutral update, such as "a new code was sent". Not an error.
export function StatusText({ children }: { children: ReactNode }) {
  return (
    <Text accessibilityLiveRegion="polite" style={styles.body}>
      {children}
    </Text>
  );
}

// Shown with the alert role; screens also call announce() with the same text.
export function ErrorText({ children }: { children: ReactNode }) {
  return (
    <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.error}>
      {children}
    </Text>
  );
}

// The visible label is hidden from screen readers, which read the input's
// accessibility label instead, so it is not read twice. An error is attached
// to the field so it is heard on returning to it.
export function Field({ label, error, ...input }: { label: string; error?: string | null } & TextInputProps) {
  return (
    <View style={styles.field}>
      <Text accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.label}>
        {label}
      </Text>
      <TextInput
        accessibilityLabel={label}
        accessibilityHint={error ?? undefined}
        aria-invalid={Boolean(error)}
        placeholderTextColor={colours.muted}
        style={styles.input}
        {...input}
      />
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
        pressed && (primary ? styles.primaryPressed : styles.secondaryPressed),
        disabled && styles.disabled,
      ]}
    >
      <Text style={primary ? styles.primaryLabel : styles.secondaryLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colours.background },
  fill: { flex: 1 },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 24,
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
  primaryPressed: { backgroundColor: colours.primaryPressed },
  secondary: { backgroundColor: colours.background },
  secondaryPressed: { backgroundColor: colours.pressedBackground },
  // Disabled controls are exempt from contrast rules (WCAG 1.4.3).
  disabled: { opacity: 0.6 },
  primaryLabel: { fontSize: 17, fontWeight: '600', color: colours.onPrimary },
  secondaryLabel: { fontSize: 17, fontWeight: '600', color: colours.primary, textDecorationLine: 'underline' },
});
