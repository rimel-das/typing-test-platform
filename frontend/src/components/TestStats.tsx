import { FC, memo } from "react";
import { formatTime } from "../utils/typing";

/**
 * TestStats Component
 * Displays real-time statistics during typing test
 */

interface TestStatsProps {
  wpm: number;
  accuracy: number;
  timeLeft: number;
  totalTime: number;
}

const TestStats: FC<TestStatsProps> = memo(
  ({ wpm, accuracy, timeLeft, totalTime }) => {
    const progress = ((totalTime - timeLeft) / totalTime) * 100;

    return (
      <div className="grid grid-cols-4 gap-4 mb-8">
        {/* WPM */}
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="text-xs text-slate-400 uppercase tracking-widest mb-2">
            WPM
          </div>
          <div className="text-4xl font-bold text-primary">
            {wpm.toFixed(1)}
          </div>
        </div>

        {/* Accuracy */}
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="text-xs text-slate-400 uppercase tracking-widest mb-2">
            Accuracy
          </div>
          <div
            className={`text-4xl font-bold ${accuracy >= 95 ? "text-green-400" : accuracy >= 85 ? "text-yellow-400" : "text-red-400"}`}
          >
            {accuracy.toFixed(1)}%
          </div>
        </div>

        {/* Time */}
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="text-xs text-slate-400 uppercase tracking-widest mb-2">
            Time
          </div>
          <div className="text-4xl font-bold text-slate-100">
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="text-xs text-slate-400 uppercase tracking-widest mb-2">
            Progress
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-sm text-slate-400 mt-2 text-right">
            {Math.round(progress)}%
          </div>
        </div>
      </div>
    );
  },
);

TestStats.displayName = "TestStats";

export default TestStats;
