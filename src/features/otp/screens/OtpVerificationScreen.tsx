import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '../../../components/ui/PrimaryButton';
import { Theme, useTheme } from '../../../theme/theme';
import { OtpInput } from '../components/OtpInput/OtpInput';
import { ResendTimer } from '../components/ResendTimer/ResendTimer';
import {
  MAX_VERIFY_ATTEMPTS,
  OTP_COPY,
  OTP_LENGTH,
  OTP_MESSAGES,
  RESEND_COOLDOWN_SECONDS,
} from '../constants';
import { useCountdown } from '../hooks/useCountdown';
import { useOtpVerification } from '../hooks/useOtpVerification';
import { mockOtpService, OtpService } from '../services/otpService';
import type { OtpPurpose } from '../types';
import { haptics } from '../utils/haptics';
import { maskContact } from '../utils/otpFormat';

export interface OtpVerificationScreenProps {
  /** Email or phone number the code was sent to. */
  contact: string;
  /** Picks default copy. Behaviour is identical for every purpose. */
  purpose?: OtpPurpose;
  title?: string;
  subtitle?: string;
  submitLabel?: string;
  length?: number;
  resendSeconds?: number;
  maxAttempts?: number;
  /** Mask the digits as they are typed (passcode / payment flows). */
  secure?: boolean;
  /** Show `e*****e@gmail.com` instead of the full address. */
  shouldMaskContact?: boolean;
  /** Verify as soon as the last digit is entered, without pressing the button. */
  autoSubmit?: boolean;
  /** Backend adapter. Defaults to the in-memory mock. */
  service?: OtpService;
  onVerified?: (code: string) => void;
}

export function OtpVerificationScreen({
  contact,
  purpose = 'verification',
  title,
  subtitle,
  submitLabel,
  length = OTP_LENGTH,
  resendSeconds = RESEND_COOLDOWN_SECONDS,
  maxAttempts = MAX_VERIFY_ATTEMPTS,
  secure = false,
  shouldMaskContact = false,
  autoSubmit = false,
  service = mockOtpService,
  onVerified,
}: OtpVerificationScreenProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const copy = OTP_COPY[purpose];

  const verify = useCallback(
    (value: string) => service.verify(value),
    [service],
  );
  const {
    code,
    setCode,
    clear,
    submit,
    status,
    isComplete,
    canSubmit,
    errorMessage,
  } = useOtpVerification({ verify, length, maxAttempts, onVerified });

  const { secondsLeft, restart } = useCountdown(resendSeconds);
  const [isResending, setIsResending] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);

  const isFinished = status === 'locked' || status === 'success';

  const handleResend = useCallback(async () => {
    if (secondsLeft > 0 || isResending || isFinished) return;
    setIsResending(true);
    setResendError(null);
    try {
      await service.resend(contact);
      clear();
      restart();
    } catch {
      setResendError(OTP_MESSAGES.RESEND_FAILED);
    } finally {
      setIsResending(false);
    }
  }, [clear, contact, isFinished, isResending, restart, secondsLeft, service]);

  useEffect(() => {
    if (autoSubmit && canSubmit && status === 'idle') void submit();
  }, [autoSubmit, canSubmit, status, submit]);

  useEffect(() => {
    if (status === 'error' || status === 'locked') haptics.error();
    if (status === 'success') {
      haptics.success();
      Keyboard.dismiss();
    }
  }, [status]);

  const feedback =
    errorMessage ??
    resendError ??
    (status === 'success' ? OTP_MESSAGES.VERIFIED : null);
  const isPositive = status === 'success' && !errorMessage && !resendError;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text accessibilityRole="header" style={styles.title}>
            {title ?? copy.title}
          </Text>
          <Text style={styles.subtitle}>{subtitle ?? copy.subtitle}</Text>
          <Text style={styles.contact}>
            {shouldMaskContact ? maskContact(contact) : contact}
          </Text>

          <View style={styles.inputWrapper}>
            <OtpInput
              value={code}
              onChange={setCode}
              length={length}
              secure={secure}
              hasError={status === 'error' || status === 'locked'}
              disabled={isFinished}
            />
          </View>

          <Text
            testID="otp-feedback"
            accessibilityRole={feedback ? 'alert' : undefined}
            accessibilityLiveRegion="polite"
            style={[
              styles.feedback,
              isPositive ? styles.feedbackSuccess : styles.feedbackError,
            ]}
          >
            {feedback ?? ''}
          </Text>

          <PrimaryButton
            testID="verify-button"
            title={submitLabel ?? copy.submitLabel}
            onPress={() => void submit()}
            disabled={!isComplete || isFinished}
            loading={status === 'verifying'}
          />

          <View style={styles.resend}>
            <ResendTimer
              secondsLeft={secondsLeft}
              isResending={isResending}
              onResend={() => void handleResend()}
              disabled={isFinished}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.colors.background },
    flex: { flex: 1 },
    content: {
      flexGrow: 1,
      paddingHorizontal: theme.spacing.xxl,
      paddingTop: 96,
      paddingBottom: theme.spacing.xl,
    },
    title: {
      ...theme.typography.title,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.lg,
    },
    subtitle: { ...theme.typography.body, color: theme.colors.textSecondary },
    contact: {
      ...theme.typography.bodyStrong,
      color: theme.colors.textPrimary,
      marginTop: theme.spacing.lg,
    },
    inputWrapper: { marginTop: theme.spacing.xxl },
    feedback: {
      ...theme.typography.caption,
      minHeight: 20,
      marginVertical: theme.spacing.md,
    },
    feedbackError: { color: theme.colors.error },
    feedbackSuccess: { color: theme.colors.success },
    resend: { marginTop: theme.spacing.xxl },
  });
