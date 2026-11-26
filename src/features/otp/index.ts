export { OtpVerificationScreen } from './screens/OtpVerificationScreen';
export type { OtpVerificationScreenProps } from './screens/OtpVerificationScreen';
export { OtpInput } from './components/OtpInput/OtpInput';
export type { OtpInputProps } from './components/OtpInput/OtpInput';
export { ResendTimer } from './components/ResendTimer/ResendTimer';
export { useCountdown } from './hooks/useCountdown';
export { useOtpVerification } from './hooks/useOtpVerification';
export {
  OtpError,
  createMockOtpService,
  mockOtpService,
} from './services/otpService';
export type { OtpService } from './services/otpService';
export type { OtpPurpose, OtpStatus } from './types';
