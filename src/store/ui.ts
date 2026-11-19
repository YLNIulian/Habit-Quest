import { create } from "zustand";

import { getSetting, setSetting } from "@/database/repositories/settingsRepository";
import { GEAR_CAMPS } from "@/game/gear";
import { campFromXp, xpForCamp } from "@/game/levels";
import type { Scheme } from "@/theme/tokens";
import type { Weather } from "@/types";

export type Moment = { kind: "camp"; from: number; to: number } | { kind: "record"; days: number };

const THEME_KEY = "theme";

interface UiState {
  // null = use the phone setting
  themeOverride: Scheme | null;
  setThemeOverride: (scheme: Scheme | null) => void;
  loadSettings: () => Promise<void>;

  moment: Moment | null;
  showMoment: (moment: Moment) => void;
  dismissMoment: () => void;

  // dev only, not saved
  weatherPreview: Weather | null;
  setWeatherPreview: (weather: Weather | null) => void;
  // extra metres added on top of the real ones
  devBonusXp: number;
  previewCamp: (realTotalXp: number) => void;
  previewRecord: (best: number) => void;
  resetPreview: () => void;
}

export const useUi = create<UiState>((set, get) => ({
  themeOverride: null,
  setThemeOverride: (themeOverride) => {
    set({ themeOverride });
    setSetting(THEME_KEY, themeOverride).catch(() => {});
  },
  loadSettings: async () => {
    const theme = await getSetting(THEME_KEY);
    if (theme === "dark" || theme === "light") set({ themeOverride: theme });
  },

  moment: null,
  showMoment: (moment) => set({ moment }),
  dismissMoment: () => set({ moment: null }),

  weatherPreview: null,
  setWeatherPreview: (weatherPreview) => set({ weatherPreview }),
  devBonusXp: 0,
  // jumps to the next camp that gives new gear
  previewCamp: (realTotalXp) => {
    const total = realTotalXp + get().devBonusXp;
    const level = campFromXp(total).level;
    const next = GEAR_CAMPS.find((camp) => camp > level);
    if (!next) {
      // already at the top, start over
      set({ devBonusXp: 0 });
      return;
    }
    set({
      devBonusXp: get().devBonusXp + xpForCamp(next) - total,
      moment: { kind: "camp", from: level, to: next },
    });
  },
  previewRecord: (best) => set({ moment: { kind: "record", days: best + 1 } }),
  resetPreview: () => set({ devBonusXp: 0, weatherPreview: null }),
}));
