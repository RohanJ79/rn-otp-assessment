import type { OtpErrorCode, OtpPurpose } from './types';

export const OTP_LENGTH = 4;
export const RESEND_COOLDOWN_SECONDS = 60;
export const MAX_VERIFY_ATTEMPTS = 3;

/** Mock service behaviour. See README ("About the fake server"). */
export const MOCK_NETWORK_DELAY_MS = 1500;
/** Magic codes that trigger each error message while testing by hand. */
export const MOCK_INVALID_CODE = '0000'; // INVALID_CODE (3 in a row -> LOCKED)
export const MOCK_EXPIRED_CODE = '1111'; // EXPIRED_CODE
export const MOCK_NETWORK_ERROR_CODE = '2222'; // UNKNOWN
/** Resending to this contact fails, which triggers RESEND_FAILED. */
export const MOCK_RESEND_FAIL_CONTACT = 'fail@example.com';

export const OTP_MESSAGES: Record<
  OtpErrorCode | 'LOCKED' | 'RESEND_FAILED' | 'VERIFIED',
  string
> = {
  INVALID_CODE: 'That code is incorrect.',
  EXPIRED_CODE: 'That code has expired. Request a new one.',
  UNKNOWN: 'Something went wrong. Please try again.',
  LOCKED: 'Too many incorrect attempts. Please try again later.',
  RESEND_FAILED: 'We couldn’t send a new code. Please try again.',
  VERIFIED: 'Code verified.',
};

export const OTP_COPY: Record<
  OtpPurpose,
  { title: string; subtitle: string; submitLabel: string }
> = {
  verification: {
    title: 'OTP Verification',
    subtitle: 'Enter the verification code we just sent you on',
    submitLabel: 'Verify',
  },
  payment: {
    title: 'Confirm Payment',
    subtitle: 'Enter the code we sent to authorise this payment on',
    submitLabel: 'Confirm',
  },
  passcode: {
    title: 'Change Passcode',
    subtitle: 'Enter the code we sent to confirm it’s you on',
    submitLabel: 'Continue',
  },
};

export const RESEND_PROMPT = 'Didn’t receive the code?';
