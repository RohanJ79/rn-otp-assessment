import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Theme, useTheme } from '../../../../theme/theme';
import { RESEND_PROMPT } from '../../constants';
import { formatTime } from '../../utils/otpFormat';

export interface ResendTimerProps {
  secondsLeft: number;
  isResending: boolean;
  onResend: () => void;
  /** Force-disable regardless of the timer (e.g. locked out, already verified). */
  disabled?: boolean;
}

export function ResendTimer({
  secondsLeft,
  isResending,
  onResend,
  disabled = false,
}: ResendTimerProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const isCoolingDown = secondsLeft > 0;
  const isDisabled = disabled || isCoolingDown || isResending;

  const label = isCoolingDown
    ? `Resend in ${formatTime(secondsLeft)}`
    : isResending
      ? 'Sending…'
      : 'Resend';

  return (
    <View style={styles.row}>
      <Text style={styles.prompt}>{RESEND_PROMPT} </Text>
      <Pressable
        testID="resend-button"
        accessibilityRole="button"
        accessibilityLabel={
          isCoolingDown
            ? `Resend code available in ${secondsLeft} seconds`
            : 'Resend code'
        }
        accessibilityState={{ disabled: isDisabled, busy: isResending }}
        disabled={isDisabled}
        hitSlop={8}
        onPress={onResend}
      >
        <Text style={[styles.action, isDisabled && styles.actionDisabled]}>
          {label}
        </Text>
      </Pressable>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
    prompt: { ...theme.typography.secondary, color: theme.colors.textPrimary },
    action: { ...theme.typography.secondaryStrong, color: theme.colors.link },
    actionDisabled: { color: theme.colors.linkDisabled },
  });
