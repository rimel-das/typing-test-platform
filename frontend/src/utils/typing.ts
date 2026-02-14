/**
 * Typing Utilities
 * Helper functions for typing test calculations
 */

/**
 * Calculate Words Per Minute
 */
export function calculateWPM(
  correctChars: number,
  timeSeconds: number,
): number {
  if (timeSeconds === 0) return 0;
  const words = correctChars / 5; // 1 word = 5 characters
  const minutes = timeSeconds / 60;
  return Math.max(0, Math.round((words / minutes) * 100) / 100);
}

/**
 * Calculate Accuracy
 */
export function calculateAccuracy(correct: number, total: number): number {
  if (total === 0) return 100;
  return Math.min(
    100,
    Math.max(0, Math.round((correct / total) * 10000) / 100),
  );
}

/**
 * Classify each character as correct, incorrect, extra, or missed
 */
export function classifyCharacters(original: string, typed: string) {
  let correct = 0;
  let incorrect = 0;
  let extra = 0;
  let missed = 0;

  const maxLen = Math.max(original.length, typed.length);

  for (let i = 0; i < maxLen; i++) {
    if (original[i] === undefined) {
      extra++;
    } else if (typed[i] === undefined) {
      missed++;
    } else if (original[i] === typed[i]) {
      correct++;
    } else {
      incorrect++;
    }
  }

  return { correct, incorrect, extra, missed };
}

/**
 * Format time as MM:SS
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

/**
 * Play sound effect
 */
export function playSound(
  type: "tick" | "success" | "error" | "finish" = "tick",
): void {
  const audioContext = new (
    window.AudioContext || (window as any).webkitAudioContext
  )();
  const oscNode = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscNode.connect(gainNode);
  gainNode.connect(audioContext.destination);

  switch (type) {
    case "tick":
      oscNode.frequency.value = 800;
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.1,
      );
      break;
    case "success":
      oscNode.frequency.value = 1000;
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.2,
      );
      break;
    case "error":
      oscNode.frequency.value = 400;
      gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.15,
      );
      break;
    case "finish":
      oscNode.frequency.value = 1200;
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.5,
      );
      break;
  }

  oscNode.start(audioContext.currentTime);
  oscNode.stop(audioContext.currentTime + 0.2);
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return function (...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let lastFunc: NodeJS.Timeout;
  let lastRun = 0;

  return function (...args: Parameters<T>) {
    const now = Date.now();
    if (now - lastRun > limit) {
      func(...args);
      lastRun = now;
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(() => func(...args), limit - (now - lastRun));
    }
  };
}
