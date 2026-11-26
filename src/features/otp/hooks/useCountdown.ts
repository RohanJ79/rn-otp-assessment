import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';

const TICK_MS = 250;

const secondsUntil = (endsAt: number | null): number =>
  endsAt === null ? 0 : Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));

/**
 * Countdown based on an absolute end timestamp rather than decrementing a counter.
 * `setInterval` drifts and is throttled while the app is backgrounded; recomputing
 * from the clock keeps the value correct, and we re-sync when the app returns to
 * the foreground.
 */
export function useCountdown(durationSeconds: number, autoStart = true) {
  const [endsAt, setEndsAt] = useState<number | null>(() =>
    autoStart ? Date.now() + durationSeconds * 1000 : null,
  );
  const [secondsLeft, setSecondsLeft] = useState(() =>
    autoStart ? durationSeconds : 0,
  );

  useEffect(() => {
    if (endsAt === null) return;

    const tick = () => {
      const remaining = secondsUntil(endsAt);
      setSecondsLeft(remaining);
      if (remaining === 0) setEndsAt(null); // finished: tears down the interval
    };

    const intervalId = setInterval(tick, TICK_MS);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') tick();
    });

    return () => {
      clearInterval(intervalId);
      subscription.remove();
    };
  }, [endsAt]);

  const restart = useCallback(() => {
    setEndsAt(Date.now() + durationSeconds * 1000);
    setSecondsLeft(durationSeconds);
  }, [durationSeconds]);

  return { secondsLeft, isRunning: secondsLeft > 0, restart };
}
