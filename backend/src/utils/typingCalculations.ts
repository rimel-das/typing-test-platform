/**
 * Typing Test Calculations
 * Core business logic for WPM, accuracy, and consistency
 */

/**
 * Calculate Words Per Minute (WPM)
 * Formula: (total_characters / 5) / time_in_minutes
 * Industry standard: 1 word = 5 characters
 *
 * @param correctCharacters - Number of correct characters typed
 * @param timeInSeconds - Time taken in seconds
 * @returns WPM rounded to 2 decimals
 */
export function calculateWPM(
  correctCharacters: number,
  timeInSeconds: number,
): number {
  if (timeInSeconds === 0) return 0;
  const timeInMinutes = timeInSeconds / 60;
  const words = correctCharacters / 5;
  const wpm = words / timeInMinutes;
  return Math.max(0, Math.round(wpm * 100) / 100);
}

/**
 * Calculate Raw WPM (before accuracy adjustment)
 * Counts all characters typed, including errors
 *
 * @param totalCharactersTyped - All characters typed
 * @param timeInSeconds - Time taken
 * @returns Raw WPM rounded to 2 decimals
 */
export function calculateRawWPM(
  totalCharactersTyped: number,
  timeInSeconds: number,
): number {
  if (timeInSeconds === 0) return 0;
  const timeInMinutes = timeInSeconds / 60;
  const words = totalCharactersTyped / 5;
  const wpm = words / timeInMinutes;
  return Math.max(0, Math.round(wpm * 100) / 100);
}

/**
 * Calculate Accuracy
 * Formula: (correct_characters / total_characters_in_prompt) * 100
 *
 * @param correctCharacters - Number of correctly typed characters
 * @param totalCharactersInPrompt - Total characters in the original text
 * @returns Accuracy percentage 0-100, rounded to 2 decimals
 */
export function calculateAccuracy(
  correctCharacters: number,
  totalCharactersInPrompt: number,
): number {
  if (totalCharactersInPrompt === 0) return 100;
  const accuracy = (correctCharacters / totalCharactersInPrompt) * 100;
  return Math.min(100, Math.max(0, Math.round(accuracy * 100) / 100));
}

/**
 * Calculate Consistency
 * Measures how consistent the user's typing speed was throughout the test
 * Lower standard deviation = higher consistency
 * Formula: 1 - (stdDev / mean)
 *
 * @param wpmHistory - Array of WPM values measured at intervals (e.g., every second)
 * @returns Consistency percentage 0-100
 */
export function calculateConsistency(wpmHistory: number[]): number {
  if (wpmHistory.length === 0) return 0;

  const mean = wpmHistory.reduce((a, b) => a + b, 0) / wpmHistory.length;
  if (mean === 0) return 0;

  const variance =
    wpmHistory.reduce((sum, wpm) => {
      return sum + Math.pow(wpm - mean, 2);
    }, 0) / wpmHistory.length;

  const stdDev = Math.sqrt(variance);
  const consistency = (1 - stdDev / mean) * 100;

  return Math.max(0, Math.min(100, Math.round(consistency * 100) / 100));
}

/**
 * Character Classification
 * Classifies each character typed as correct, incorrect, extra, or missed
 *
 * @param originalText - The prompt text
 * @param typedText - What the user typed
 * @returns Object with character counts
 */
export function classifyCharacters(
  originalText: string,
  typedText: string,
): {
  correct: number;
  incorrect: number;
  extra: number;
  missed: number;
} {
  let correct = 0;
  let incorrect = 0;
  let extra = 0;
  let missed = 0;

  // Count correct and incorrect characters
  const maxLen = Math.max(originalText.length, typedText.length);
  for (let i = 0; i < maxLen; i++) {
    const originalChar = originalText[i];
    const typedChar = typedText[i];

    if (originalChar === undefined) {
      // User typed extra characters
      extra++;
    } else if (typedChar === undefined) {
      // User didn't type enough characters
      missed++;
    } else if (originalChar === typedChar) {
      correct++;
    } else {
      incorrect++;
    }
  }

  return { correct, incorrect, extra, missed };
}

/**
 * Detect Tab Switching or Copy-Paste Anomalies
 * Returns flags for potential cheating indicators
 *
 * @param inputHistory - Array of input events with timestamps
 * @returns Object with anomaly flags
 */
export function detectAnomalies(
  inputHistory: Array<{ timestamp: number; char: string }>,
): {
  suspiciousPaste: boolean;
  longGapDetected: boolean;
  unusualSpeed: boolean;
} {
  if (inputHistory.length < 2) {
    return {
      suspiciousPaste: false,
      longGapDetected: false,
      unusualSpeed: false,
    };
  }

  let suspiciousPaste = false;
  let longGapDetected = false;
  let unusualSpeed = false;

  // Detect long gaps (potential tab switch)
  for (let i = 1; i < inputHistory.length; i++) {
    const gap = inputHistory[i].timestamp - inputHistory[i - 1].timestamp;
    if (gap > 5000) {
      // 5 second gap
      longGapDetected = true;
    }
  }

  // Detect suspicious paste (multiple characters in very short time)
  for (let i = 10; i < inputHistory.length; i++) {
    const recentGap =
      inputHistory[i].timestamp - inputHistory[i - 10].timestamp;
    if (recentGap < 500 && i > 10) {
      // 10 chars in < 500ms is suspicious
      suspiciousPaste = true;
    }
  }

  // Detect unusual speed (way too fast)
  const totalTime =
    inputHistory[inputHistory.length - 1].timestamp - inputHistory[0].timestamp;
  if (totalTime > 0) {
    const charsPerSecond = inputHistory.length / (totalTime / 1000);
    if (charsPerSecond > 20) {
      // > 400 WPM is unrealistic
      unusualSpeed = true;
    }
  }

  return { suspiciousPaste, longGapDetected, unusualSpeed };
}

/**
 * Calculate all test metrics at once
 * Convenience function for processing a completed test
 */
export function calculateTestMetrics(
  originalText: string,
  typedText: string,
  timeInSeconds: number,
  inputHistory?: Array<{ timestamp: number; char: string }>,
) {
  const chars = classifyCharacters(originalText, typedText);
  const wpm = calculateWPM(chars.correct, timeInSeconds);
  const rawWpm = calculateRawWPM(typedText.length, timeInSeconds);
  const accuracy = calculateAccuracy(chars.correct, originalText.length);

  // Extract WPM history if available
  let consistency = 0;
  if (inputHistory && inputHistory.length > 0) {
    const wpmHistoryPoints: number[] = [];
    for (let i = 1; i < inputHistory.length; i++) {
      const charsSoFar = inputHistory
        .slice(0, i)
        .filter((h) => h.char !== "Backspace").length;
      const timeSoFar = inputHistory[i].timestamp / 1000; // convert to seconds
      wpmHistoryPoints.push(calculateWPM(charsSoFar, timeSoFar));
    }
    consistency = calculateConsistency(wpmHistoryPoints);
  }

  const anomalies = inputHistory ? detectAnomalies(inputHistory) : null;

  return {
    wpm,
    rawWpm,
    accuracy,
    consistency,
    characters: chars,
    anomalies,
  };
}

export default {
  calculateWPM,
  calculateRawWPM,
  calculateAccuracy,
  calculateConsistency,
  classifyCharacters,
  detectAnomalies,
  calculateTestMetrics,
};
