import { FC, memo } from "react";

/**
 * TestResults Component
 * Displays test results after completion
 */

interface TestResultsProps {
  wpm: number;
  accuracy: number;
  consistency: number;
  totalCharacters: number;
  correctCharacters: number;
  errors: number;
  duration: number;
  difficulty: string;
  onRetry: () => void;
}

const TestResults: FC<TestResultsProps> = memo(
  ({
    wpm,
    accuracy,
    consistency,
    totalCharacters,
    correctCharacters,
    errors,
    duration,
    difficulty,
    onRetry,
  }) => {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold mb-2 text-primary">
            {wpm.toFixed(2)} WPM
          </h2>
          <p className="text-slate-400">Typing Test Complete!</p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="text-slate-400 text-sm mb-2">Accuracy</div>
            <div
              className={`text-3xl font-bold ${accuracy >= 95 ? "text-green-400" : accuracy >= 85 ? "text-yellow-400" : "text-red-400"}`}
            >
              {accuracy.toFixed(2)}%
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="text-slate-400 text-sm mb-2">Consistency</div>
            <div className="text-3xl font-bold text-blue-400">
              {consistency.toFixed(2)}%
            </div>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8 text-sm">
          <div className="bg-slate-800 rounded p-4 border border-slate-700 text-center">
            <div className="text-slate-400 mb-1">Characters</div>
            <div className="text-xl font-bold text-slate-100">
              {totalCharacters}
            </div>
          </div>

          <div className="bg-slate-800 rounded p-4 border border-slate-700 text-center">
            <div className="text-slate-400 mb-1">Correct</div>
            <div className="text-xl font-bold text-green-400">
              {correctCharacters}
            </div>
          </div>

          <div className="bg-slate-800 rounded p-4 border border-slate-700 text-center">
            <div className="text-slate-400 mb-1">Errors</div>
            <div className="text-xl font-bold text-red-400">{errors}</div>
          </div>
        </div>

        {/* Metadata */}
        <div className="flex justify-between items-center text-sm text-slate-400 mb-8">
          <span>Duration: {duration}s</span>
          <span className="capitalize">Difficulty: {difficulty}</span>
        </div>

        {/* Actions */}
        <button
          onClick={onRetry}
          className="w-full bg-primary hover:bg-yellow-500 text-black font-bold py-3 px-6 rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  },
);

TestResults.displayName = "TestResults";

export default TestResults;
