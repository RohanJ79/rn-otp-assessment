import { memo, useMemo, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Theme, useTheme } from '../../../../theme/theme';
import { OTP_LENGTH } from '../../constants';
import { sanitizeDigits } from '../../utils/otpFormat';

export interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  /** Masks entered digits (passcodes, payment confirmations). */
  secure?: boolean;
  hasError?: boolean;
  accessibilityLabel?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  testID?: string;
}

export function OtpInput({
  value,
  onChange,
  length = OTP_LENGTH,
  secure = false,
  hasError = false,
  disabled = false,
  autoFocus = true,
  accessibilityLabel,
  testID = 'otp-input',
}: OtpInputProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [isFocused, setIsFocused] = useState(false);
  const shake = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!hasError) return;
    const step = (toValue: number) =>
      Animated.timing(shake, { toValue, duration: 50, useNativeDriver: true });
    Animated.sequence([step(8), step(-8), step(6), step(-6), step(0)]).start();
  }, [hasError, shake]);

  const activeIndex = Math.min(value.length, length - 1);

  return (
    <Animated.View
      style={[styles.container, { transform: [{ translateX: shake }] }]}
    >
      {/* Decorative: screen readers interact with the TextInput below. */}
      <View
        style={styles.row}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        {Array.from({ length }, (_, index) => (
          <OtpBox
            key={index}
            testID={`${testID}-box-${index}`}
            char={value.charAt(index)}
            secure={secure}
            isActive={isFocused && !disabled && index === activeIndex}
            hasError={hasError}
            styles={styles}
          />
        ))}
      </View>

      <TextInput
        testID={`${testID}-field`}
        style={styles.hiddenInput}
        value={value}
        onChangeText={(text) => onChange(sanitizeDigits(text, length))}
        maxLength={length}
        editable={!disabled}
        autoFocus={autoFocus}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete={Platform.OS === 'android' ? 'sms-otp' : 'one-time-code'}
        importantForAutofill="yes"
        autoCorrect={false}
        caretHidden
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        accessibilityLabel={
          accessibilityLabel ?? `Verification code, ${length} digits`
        }
      />
    </Animated.View>
  );
}

interface OtpBoxProps {
  char: string;
  secure: boolean;
  isActive: boolean;
  hasError: boolean;
  styles: ReturnType<typeof createStyles>;
  testID: string;
}

const OtpBox = memo(function OtpBox({
  char,
  secure,
  isActive,
  hasError,
  styles,
  testID,
}: OtpBoxProps) {
  return (
    <View
      testID={testID}
      style={[
        styles.box,
        isActive && styles.boxActive,
        hasError && styles.boxError,
      ]}
    >
      <Text style={styles.digit}>{secure && char ? '•' : char}</Text>
    </View>
  );
});

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: { width: '100%' },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: theme.spacing.md,
    },
    box: {
      flex: 1,
      maxWidth: 72,
      aspectRatio: 0.92,
      borderRadius: theme.radius.lg,
      borderWidth: 1.5,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    boxActive: { borderWidth: 2, borderColor: theme.colors.borderFocused },
    boxError: { borderWidth: 2, borderColor: theme.colors.borderError },
    digit: { ...theme.typography.digit, color: theme.colors.textPrimary },
    hiddenInput: { ...StyleSheet.absoluteFill, opacity: 0 },
  });
