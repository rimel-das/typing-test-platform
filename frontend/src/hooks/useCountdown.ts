import { useEffect, useState } from "react";

/**
 * Custom Hook: useCountdown
 * Manages countdown timer
 */

export function useCountdown(initialSeconds: number, onComplete?: () => void) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) {
      if (timeLeft === 0 && onComplete) {
        onComplete();
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;
        if (newTime === 0 && onComplete) {
          onComplete();
          setIsRunning(false);
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, timeLeft, onComplete]);

  const start = () => setIsRunning(true);
  const stop = () => setIsRunning(false);
  const reset = (seconds = initialSeconds) => {
    setTimeLeft(seconds);
    setIsRunning(false);
  };

  return { timeLeft, isRunning, start, stop, reset };
}

export default useCountdown;
