// UI-only state for the visual shell. No persistence, no real game rules.
import { create } from "zustand";

import { HABITS, PLAYER, TODAY_ISO, countOn } from "@/data/mock";
import { GEAR_CAMPS } from "@/lib/gear";
import type { Scheme } from "@/theme/tokens";
import type { Weather } from "@/types";

const initialDone: Record<string, boolean> = Object.fromEntries(
  HABITS.map((h) => [h.id, countOn(h.id, TODAY_ISO) >= h.targetPerDay]),
);

export const INITIAL_DONE_COUNT = Object.values(initialDone).filter(Boolean).length;

/** A full-screen celebration. */
export type Moment = { kind: "camp"; from: number; to: number } | { kind: "record"; days: number };

interface UiState {
  /** null = follow the system setting. */
  themeOverride: Scheme | null;
  setThemeOverride: (scheme: Scheme | null) => void;

  /** Which habits are finished today (mock toggle). */
  done: Record<string, boolean>;
  toggleDone: (habitId: string) => void;

  /** Preview of the consequence states. */
  weather: Weather;
  setWeather: (weather: Weather) => void;

  level: number;
  moment: Moment | null;
  /** Preview: jumps to the next camp that unlocks gear, so every tier can be shown. */
  previewCamp: () => void;
  /** Preview: a new longest streak. */
  previewRecord: () => void;
  dismissMoment: () => void;
}

export const useUi = create<UiState>((set) => ({
  themeOverride: null,
  setThemeOverride: (themeOverride) => set({ themeOverride }),

  done: initialDone,
  toggleDone: (habitId) => set((s) => ({ done: { ...s.done, [habitId]: !s.done[habitId] } })),

  weather: PLAYER.weather,
  setWeather: (weather) => set({ weather }),

  level: PLAYER.level,
  moment: null,
  previewCamp: () =>
    set((s) => {
      const next = GEAR_CAMPS.find((camp) => camp > s.level);
      // Past the summit: loop back to the first unlock.
      return { moment: next ? { kind: "camp", from: s.level, to: next } : { kind: "camp", from: 4, to: 5 } };
    }),
  previewRecord: () => set({ moment: { kind: "record", days: PLAYER.bestStreakDays + 1 } }),
  dismissMoment: () =>
    set((s) => (s.moment?.kind === "camp" ? { level: s.moment.to, moment: null } : { moment: null })),
}));
