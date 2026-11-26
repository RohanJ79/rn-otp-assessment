/**
 * Lifecycle of a verification attempt.
 *  idle      – waiting for input
 *  verifying – request in flight
 *  success   – code accepted
 *  error     – code rejected, the user may retry
 *  locked    – too many failed attempts, no further input accepted
 */
export type OtpStatus = 'idle' | 'verifying' | 'success' | 'error' | 'locked';

/** Drives copy only. The behaviour is identical for every purpose. */
export type OtpPurpose = 'verification' | 'payment' | 'passcode';

export type OtpErrorCode = 'INVALID_CODE' | 'EXPIRED_CODE' | 'UNKNOWN';
