import { act, renderHook } from '@testing-library/react-native';

import { OtpError } from '../../services/otpService';
import { useOtpVerification } from '../useOtpVerification';

const resolved = () => jest.fn().mockResolvedValue(undefined);
const rejected = () =>
  jest.fn().mockRejectedValue(new OtpError('INVALID_CODE', 'nope'));

describe('useOtpVerification', () => {
  it('keeps only digits and respects the length', () => {
    const { result } = renderHook(() =>
      useOtpVerification({ verify: resolved() }),
    );

    act(() => result.current.setCode('12a3 456'));

    expect(result.current.code).toBe('1234');
    expect(result.current.isComplete).toBe(true);
  });

  it('does not submit an incomplete code', async () => {
    const verify = resolved();
    const { result } = renderHook(() => useOtpVerification({ verify }));

    act(() => result.current.setCode('123'));
    expect(result.current.canSubmit).toBe(false);

    await act(async () => {
      await result.current.submit();
    });
    expect(verify).not.toHaveBeenCalled();
  });

  it('verifies the full code and reports success', async () => {
    const verify = resolved();
    const onVerified = jest.fn();
    const { result } = renderHook(() =>
      useOtpVerification({ verify, onVerified }),
    );

    act(() => result.current.setCode('1234'));
    await act(async () => {
      await result.current.submit();
    });

    expect(verify).toHaveBeenCalledWith('1234');
    expect(onVerified).toHaveBeenCalledWith('1234');
    expect(result.current.status).toBe('success');
  });

  it('reports a failure with the remaining attempts, and clears it on edit', async () => {
    const { result } = renderHook(() =>
      useOtpVerification({ verify: rejected(), maxAttempts: 3 }),
    );

    act(() => result.current.setCode('1234'));
    await act(async () => {
      await result.current.submit();
    });

    expect(result.current.status).toBe('error');
    expect(result.current.errorMessage).toContain('incorrect');
    expect(result.current.errorMessage).toContain('2 attempts left');

    act(() => result.current.setCode('123'));
    expect(result.current.status).toBe('idle');
    expect(result.current.errorMessage).toBeNull();
  });

  it('locks after the maximum number of failed attempts', async () => {
    const { result } = renderHook(() =>
      useOtpVerification({ verify: rejected(), maxAttempts: 2 }),
    );

    act(() => result.current.setCode('1234'));
    await act(async () => {
      await result.current.submit();
    });
    expect(result.current.status).toBe('error');

    await act(async () => {
      await result.current.submit();
    });
    expect(result.current.status).toBe('locked');
    expect(result.current.canSubmit).toBe(false);
  });

  it('ignores a second submit while one is in flight', async () => {
    let finish!: () => void;
    const verify = jest.fn(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    );
    const { result } = renderHook(() => useOtpVerification({ verify }));

    act(() => result.current.setCode('1234'));
    await act(async () => {
      const first = result.current.submit();
      const second = result.current.submit();
      finish();
      await Promise.all([first, second]);
    });

    expect(verify).toHaveBeenCalledTimes(1);
  });

  it('clear() empties the code', () => {
    const { result } = renderHook(() =>
      useOtpVerification({ verify: resolved() }),
    );

    act(() => result.current.setCode('1234'));
    act(() => result.current.clear());

    expect(result.current.code).toBe('');
    expect(result.current.status).toBe('idle');
  });
});
