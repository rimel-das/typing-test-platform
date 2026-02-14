import { create } from "zustand";

/**
 * Theme Store (Zustand)
 * Manages theme and UI preferences
 */

export type Theme = "dark" | "light" | "custom";
export type CaretStyle = "line" | "block" | "underline";

export interface ThemeState {
  theme: Theme;
  soundsEnabled: boolean;
  animationsEnabled: boolean;
  caretStyle: CaretStyle;
  fontSize: number;

  setTheme: (theme: Theme) => void;
  toggleSounds: () => void;
  toggleAnimations: () => void;
  setCaretStyle: (style: CaretStyle) => void;
  setFontSize: (size: number) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: "dark",
  soundsEnabled: true,
  animationsEnabled: true,
  caretStyle: "line",
  fontSize: 16,

  setTheme: (theme) => set({ theme }),
  toggleSounds: () => set((state) => ({ soundsEnabled: !state.soundsEnabled })),
  toggleAnimations: () =>
    set((state) => ({ animationsEnabled: !state.animationsEnabled })),
  setCaretStyle: (caretStyle) => set({ caretStyle }),
  setFontSize: (fontSize) => set({ fontSize }),
}));
