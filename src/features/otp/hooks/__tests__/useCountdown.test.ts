import { act, renderHook } from '@testing-library/react-native';

import { useCountdown } from '../useCountdown';

describe('useCountdown', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('starts at the full duration and is running', () => {
    const { result } = renderHook(() => useCountdown(60));

    expect(result.current.secondsLeft).toBe(60);
    expect(result.current.isRunning).toBe(true);
  });

  it('counts down one second at a time', () => {
    const { result } = renderHook(() => useCountdown(60));

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(result.current.secondsLeft).toBe(59);

    act(() => {
      jest.advanceTimersByTime(4000);
    });
    expect(result.current.secondsLeft).toBe(55);
  });

  it('stops at zero', () => {
    const { result } = renderHook(() => useCountdown(60));

    act(() => {
      jest.advanceTimersByTime(60_000);
    });
    expect(result.current.secondsLeft).toBe(0);
    expect(result.current.isRunning).toBe(false);

    act(() => {
      jest.advanceTimersByTime(5_000);
    });
    expect(result.current.secondsLeft).toBe(0);
  });

  it('does not run until restarted when autoStart is false', () => {
    const { result } = renderHook(() => useCountdown(60, false));
    expect(result.current.isRunning).toBe(false);

    act(() => {
      result.current.restart();
    });
    expect(result.current.secondsLeft).toBe(60);
    expect(result.current.isRunning).toBe(true);
  });

  it('restart() begins a fresh countdown', () => {
    const { result } = renderHook(() => useCountdown(60));

    act(() => {
      jest.advanceTimersByTime(60_000);
    });
    expect(result.current.isRunning).toBe(false);

    act(() => {
      result.current.restart();
    });
    expect(result.current.secondsLeft).toBe(60);
    expect(result.current.isRunning).toBe(true);
  });

  it('stays accurate when wall-clock time passes while timers are suspended', () => {
    const { result } = renderHook(() => useCountdown(60));

    act(() => {
      // e.g. the app spent 30s in the background
      jest.setSystemTime(Date.now() + 30_000);
      jest.advanceTimersByTime(250);
    });

    expect(result.current.secondsLeft).toBe(30);
  });
});
