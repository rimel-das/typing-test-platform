import { create } from "zustand";

/**
 * Typing Test Store (Zustand)
 * Manages typing test state
 */

export interface TestState {
  // Test session state
  isTestActive: boolean;
  timeRemaining: number;
  difficulty: "easy" | "normal" | "hard";
  testMode: "time" | "words" | "quote" | "zen";
  testDuration: number;

  // Typing state
  originalText: string;
  typedText: string;
  currentCharIndex: number;
  errors: number;
  corrections: number;

  // Stats
  wpm: number;
  accuracy: number;
  consistency: number;

  // Actions
  startTest: (
    duration: number,
    text: string,
    difficulty: "easy" | "normal" | "hard",
  ) => void;
  updateTypedText: (text: string) => void;
  finishTest: () => void;
  resetTest: () => void;
  setDifficulty: (difficulty: "easy" | "normal" | "hard") => void;
  decrementTime: () => void;
}

export const useTestStore = create<TestState>((set) => ({
  isTestActive: false,
  timeRemaining: 60,
  difficulty: "normal",
  testMode: "time",
  testDuration: 60,

  originalText: "",
  typedText: "",
  currentCharIndex: 0,
  errors: 0,
  corrections: 0,

  wpm: 0,
  accuracy: 100,
  consistency: 0,

  startTest: (duration, text, difficulty) =>
    set({
      isTestActive: true,
      timeRemaining: duration,
      testDuration: duration,
      originalText: text,
      typedText: "",
      currentCharIndex: 0,
      errors: 0,
      corrections: 0,
      wpm: 0,
      accuracy: 100,
      difficulty,
    }),

  updateTypedText: (text) =>
    set((state) => ({
      typedText: text,
      currentCharIndex: text.length,
    })),

  finishTest: () =>
    set({
      isTestActive: false,
    }),

  resetTest: () =>
    set({
      isTestActive: false,
      timeRemaining: 60,
      originalText: "",
      typedText: "",
      currentCharIndex: 0,
      errors: 0,
      corrections: 0,
      wpm: 0,
      accuracy: 100,
      consistency: 0,
    }),

  setDifficulty: (difficulty) => set({ difficulty }),

  decrementTime: () =>
    set((state) => ({
      timeRemaining: Math.max(0, state.timeRemaining - 1),
    })),
}));
