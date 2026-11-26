import { formatTime, maskContact, sanitizeDigits } from '../otpFormat';

describe('sanitizeDigits', () => {
  it('removes anything that is not a digit', () => {
    expect(sanitizeDigits('1a2 b-3', 4)).toBe('123');
  });

  it('truncates to the max length (e.g. a pasted code)', () => {
    expect(sanitizeDigits('123456', 4)).toBe('1234');
  });

  it('returns an empty string for empty input', () => {
    expect(sanitizeDigits('', 4)).toBe('');
  });
});

describe('formatTime', () => {
  it.each([
    [60, '1:00'],
    [59, '0:59'],
    [5, '0:05'],
    [0, '0:00'],
    [75, '1:15'],
  ])('formats %i seconds as %s', (seconds, expected) => {
    expect(formatTime(seconds)).toBe(expected);
  });

  it('never returns a negative time', () => {
    expect(formatTime(-3)).toBe('0:00');
  });
});

describe('maskContact', () => {
  it('masks the local part of an email', () => {
    expect(maskContact('example@gmail.com')).toBe('e*****e@gmail.com');
  });

  it('handles very short email local parts', () => {
    expect(maskContact('ab@x.io')).toBe('a*@x.io');
  });

  it('keeps the last four characters of a phone number', () => {
    expect(maskContact('+919876543210')).toBe('*********3210');
  });
});
