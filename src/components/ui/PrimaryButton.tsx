import { useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { Theme, useTheme } from '../../theme/theme';

export interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  testID?: string;
}

export function PrimaryButton({
  title,
  onPress,
  disabled = false,
  loading = false,
  testID,
}: PrimaryButtonProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // While loading we keep the "active" look and show a spinner instead of greying out.
  const isInactive = disabled && !loading;

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        isInactive && styles.buttonDisabled,
        pressed && styles.buttonPressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={theme.colors.buttonText} />
      ) : (
        <Text style={[styles.label, isInactive && styles.labelDisabled]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    button: {
      height: 56,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.buttonBackground,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonDisabled: { backgroundColor: theme.colors.buttonBackgroundDisabled },
    buttonPressed: { opacity: 0.85 },
    label: { ...theme.typography.button, color: theme.colors.buttonText },
    labelDisabled: { color: theme.colors.buttonTextDisabled },
  });
