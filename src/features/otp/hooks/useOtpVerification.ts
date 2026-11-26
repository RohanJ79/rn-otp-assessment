import { useCallback, useRef, useState } from 'react';

import { MAX_VERIFY_ATTEMPTS, OTP_LENGTH, OTP_MESSAGES } from '../constants';
import { OtpError, OtpService } from '../services/otpService';
import type { OtpStatus } from '../types';
import { sanitizeDigits } from '../utils/otpFormat';

export interface UseOtpVerificationOptions {
  verify: OtpService['verify'];
  length?: number;
  maxAttempts?: number;
  onVerified?: (code: string) => void;
}

/**
 * Owns the code, the verification status and the attempt counter.
 * It has no idea how the code is rendered or where it is verified.
 */
export function useOtpVerification({
  verify,
  length = OTP_LENGTH,
  maxAttempts = MAX_VERIFY_ATTEMPTS,
  onVerified,
}: UseOtpVerificationOptions) {
  const [code, setCodeState] = useState('');
  const [status, setStatus] = useState<OtpStatus>('idle');
  const [failure, setFailure] = useState<string | null>(null);

  const attempts = useRef(0);
  const inFlight = useRef(false);

  const isComplete = code.length === length;
  const canSubmit = isComplete && (status === 'idle' || status === 'error');

  const setCode = useCallback(
    (next: string) => {
      if (inFlight.current) return;
      setCodeState(sanitizeDigits(next, length));
      // Editing after a failed attempt dismisses the error.
      setStatus((current) => (current === 'error' ? 'idle' : current));
    },
    [length],
  );

  /** Empties the input (e.g. after a new code was requested). Attempts are kept. */
  const clear = useCallback(() => {
    setCodeState('');
    setStatus((current) => (current === 'locked' ? current : 'idle'));
  }, []);

  const submit = useCallback(async () => {
    if (!canSubmit || inFlight.current) return;

    inFlight.current = true;
    setStatus('verifying');

    try {
      await verify(code);
    } catch (error) {
      attempts.current += 1;
      const remaining = maxAttempts - attempts.current;
      if (remaining <= 0) {
        setStatus('locked');
        setFailure(OTP_MESSAGES.LOCKED);
      } else {
        const base =
          error instanceof OtpError
            ? OTP_MESSAGES[error.code]
            : OTP_MESSAGES.UNKNOWN;
        setStatus('error');
        setFailure(
          `${base} ${remaining} ${remaining === 1 ? 'attempt' : 'attempts'} left.`,
        );
      }
      return;
    } finally {
      inFlight.current = false;
    }

    setStatus('success');
    setFailure(null);
    onVerified?.(code);
  }, [canSubmit, code, maxAttempts, onVerified, verify]);

  return {
    code,
    setCode,
    clear,
    submit,
    status,
    isComplete,
    canSubmit,
    errorMessage: status === 'error' || status === 'locked' ? failure : null,
  };
}
