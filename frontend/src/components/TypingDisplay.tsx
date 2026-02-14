import { FC, memo } from "react";

/**
 * TypingDisplay Component
 * Displays the text to type with character highlighting
 */

interface TypingDisplayProps {
  originalText: string;
  typedText: string;
}

const TypingDisplay: FC<TypingDisplayProps> = memo(
  ({ originalText, typedText }) => {
    return (
      <div className="mb-8 p-8 bg-slate-800 rounded-lg border border-slate-700 font-mono text-lg leading-relaxed">
        {originalText.split("").map((char, idx) => {
          const typedChar = typedText[idx];
          let charClass = "text-slate-300";

          if (typedChar === undefined) {
            // Not typed yet
            if (idx === typedText.length) {
              charClass = "current bg-blue-500 bg-opacity-40 cursor";
            }
          } else if (char === typedChar) {
            charClass = "correct text-green-400";
          } else {
            charClass = "incorrect text-red-400 bg-red-400 bg-opacity-20";
          }

          return (
            <span key={idx} className={`character ${charClass}`}>
              {char}
            </span>
          );
        })}

        {/* Extra characters typed */}
        {typedText.length > originalText.length && (
          <span className="extra text-red-500 bg-red-500 bg-opacity-20">
            {typedText
              .slice(originalText.length)
              .split("")
              .map((char, idx) => (
                <span key={idx}>{char}</span>
              ))}
          </span>
        )}
      </div>
    );
  },
);

TypingDisplay.displayName = "TypingDisplay";

export default TypingDisplay;
