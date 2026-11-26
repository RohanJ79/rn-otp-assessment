/** Keeps digits only and truncates to `maxLength`. Handles paste and SMS autofill. */
export function sanitizeDigits(value: string, maxLength: number): string {
  return value.replace(/\D/g, '').slice(0, maxLength);
}

/** 75 -> "1:15", 5 -> "0:05". */
export function formatTime(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Hides most of an email or phone number.
 *  example@gmail.com -> e*****e@gmail.com
 *  +919876543210     -> *********3210
 */
export function maskContact(contact: string): string {
  const atIndex = contact.indexOf('@');
  if (atIndex > 0) {
    const local = contact.slice(0, atIndex);
    const domain = contact.slice(atIndex);
    if (local.length <= 2) return `${local.charAt(0)}*${domain}`;
    return `${local.charAt(0)}${'*'.repeat(local.length - 2)}${local.slice(-1)}${domain}`;
  }
  if (contact.length <= 4) return contact;
  return `${'*'.repeat(contact.length - 4)}${contact.slice(-4)}`;
}
