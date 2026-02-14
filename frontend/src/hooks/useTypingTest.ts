import { useEffect, useState, useRef } from "react";
import { useTestStore } from "../context/testStore";
import {
  calculateWPM,
  calculateAccuracy,
  classifyCharacters,
} from "../utils/typing";

/**
 * Custom Hook: useTypingTest
 * Handles the typing test input and calculations
 */

export function useTypingTest() {
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    originalText,
    typedText,
    isTestActive,
    timeRemaining,
    updateTypedText,
  } = useTestStore();

  // Calculate metrics
  useEffect(() => {
    if (!originalText || !isTestActive) return;

    const chars = classifyCharacters(originalText, typedText);
    const elapsedTime = 60 - (timeRemaining || 1); // Get total elapsed time

    // Calculate WPM
    const newWpm = calculateWPM(chars.correct, elapsedTime);
    setWpm(newWpm);

    // Calculate Accuracy
    const newAccuracy = calculateAccuracy(chars.correct, originalText.length);
    setAccuracy(newAccuracy);
  }, [typedText, timeRemaining, originalText, isTestActive]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isTestActive) return;
    updateTypedText(e.target.value);
  };

  return {
    inputRef,
    handleInput,
    wpm,
    accuracy,
  };
}

export default useTypingTest;
