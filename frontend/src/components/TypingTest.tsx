import { FC, useEffect, useRef } from "react";
import { useTestStore } from "../context/testStore";
import useCountdown from "../hooks/useCountdown";
import TypingDisplay from "./TypingDisplay";
import TestStats from "./TestStats";

/**
 * TypingTest Component
 * Main typing test interface
 */

interface TypingTestProps {
  text: string;
  duration: number;
  difficulty: string;
  onComplete: (results: any) => void;
}

const TypingTest: FC<TypingTestProps> = ({
  text,
  duration,
  difficulty,
  onComplete,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { originalText, typedText, startTest, updateTypedText, finishTest } =
    useTestStore();
  const {
    timeLeft,
    isRunning,
    start: startTimer,
    stop: stopTimer,
  } = useCountdown(duration, () => {
    handleComplete();
  });

  const [wpm, accuracy] = [0, 100]; // Calculate from typedText

  // Start test on mount
  useEffect(() => {
    startTest(duration, text, difficulty as any);
    inputRef.current?.focus();
    startTimer();
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isRunning) return;
    updateTypedText(e.target.value);
  };

  const handleComplete = () => {
    stopTimer();
    finishTest();
    onComplete({
      wpm,
      accuracy,
      typedText,
      originalText: text,
      duration,
      difficulty,
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <TestStats
        wpm={wpm}
        accuracy={accuracy}
        timeLeft={timeLeft}
        totalTime={duration}
      />

      <TypingDisplay originalText={originalText} typedText={typedText} />

      <input
        ref={inputRef}
        type="text"
        value={typedText}
        onChange={handleInput}
        className="w-full p-4 bg-slate-800 border-2 border-slate-700 focus:border-primary rounded-lg outline-none text-slate-100 placeholder-slate-500"
        placeholder="Start typing..."
        spellCheck="false"
        autoComplete="off"
      />

      {timeLeft === 0 && (
        <div className="mt-8 text-center">
          <p className="text-slate-400 mb-4">
            Test completed! Submitting results...
          </p>
        </div>
      )}
    </div>
  );
};

export default TypingTest;
