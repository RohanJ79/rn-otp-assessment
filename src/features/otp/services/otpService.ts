import {
  MOCK_EXPIRED_CODE,
  MOCK_INVALID_CODE,
  MOCK_NETWORK_DELAY_MS,
  MOCK_NETWORK_ERROR_CODE,
  MOCK_RESEND_FAIL_CONTACT,
} from '../constants';
import type { OtpErrorCode } from '../types';

export class OtpError extends Error {
  readonly code: OtpErrorCode;

  constructor(code: OtpErrorCode, message: string) {
    super(message);
    this.name = 'OtpError';
    this.code = code;
    Object.setPrototypeOf(this, OtpError.prototype);
  }
}

/**
 * The only thing the UI knows about the backend. Swap the implementation
 * (REST, GraphQL, Firebase…) without touching a single component or hook.
 */
export interface OtpService {
  /** Resolves when the code is accepted, rejects with `OtpError` otherwise. */
  verify(code: string): Promise<void>;
  /** Requests a fresh code for the given email / phone number. */
  resend(contact: string): Promise<void>;
}

const wait = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

export interface MockOtpServiceOptions {
  delayMs?: number;
  /** Rejected with INVALID_CODE. */
  invalidCode?: string;
  /** Rejected with EXPIRED_CODE. */
  expiredCode?: string;
  /** Fails like a dropped connection (not an OtpError), so the UI shows UNKNOWN. */
  networkErrorCode?: string;
  /** `resend` fails for this contact, so the UI shows RESEND_FAILED. */
  failingResendContact?: string;
}

export function createMockOtpService(
  options: MockOtpServiceOptions = {},
): OtpService {
  const {
    delayMs = MOCK_NETWORK_DELAY_MS,
    invalidCode = MOCK_INVALID_CODE,
    expiredCode = MOCK_EXPIRED_CODE,
    networkErrorCode = MOCK_NETWORK_ERROR_CODE,
    failingResendContact = MOCK_RESEND_FAIL_CONTACT,
  } = options;

  return {
    async verify(code) {
      // Logging the full OTP is an explicit requirement of the assignment.
      // Never do this against a real backend: codes are credentials.
      console.log(`[OTP] Verifying code: ${code}`);
      await wait(delayMs);
      if (code === invalidCode) {
        throw new OtpError('INVALID_CODE', 'Mock service rejected the code');
      }
      if (code === expiredCode) {
        throw new OtpError(
          'EXPIRED_CODE',
          'Mock service says the code expired',
        );
      }
      if (code === networkErrorCode) {
        throw new Error('Mock network failure');
      }
    },
    async resend(contact) {
      console.log(`[OTP] Sending a new code to ${contact}`);
      await wait(delayMs);
      if (contact === failingResendContact) {
        throw new Error('Mock network failure');
      }
    },
  };
}

export const mockOtpService = createMockOtpService();
