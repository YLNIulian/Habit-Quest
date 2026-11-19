import { create } from "zustand";

import { saveCharacterSnapshot } from "@/database/repositories/characterRepository";
import { fetchCompletionLog, setCompletionCount } from "@/database/repositories/completionsRepository";
import * as habitsRepo from "@/database/repositories/habitsRepository";
import { clearAllData, loadDemoData } from "@/database/seed";
import { countOn } from "@/game/history";
import { simulateJourney } from "@/game/journey";
import { todayIso } from "@/lib/dates";
import { createId } from "@/lib/id";
import { useUi } from "@/store/ui";
import type { CompletionLog, Habit, HabitDraft, IsoDate } from "@/types";

interface HabitState {
  ready: boolean;
  habits: Habit[];
  log: CompletionLog;

  load: () => Promise<void>;
  addHabit: (draft: HabitDraft) => Promise<Habit>;
  updateHabit: (id: string, draft: HabitDraft) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;

  // tap: +1 (or undo if already done)
  checkIn: (habitId: string, date: IsoDate) => void;
  // long press: -1
  checkOut: (habitId: string, date: IsoDate) => void;

  loadDemo: () => Promise<void>;
  clearAll: () => Promise<void>;
}

export const useHabitStore = create<HabitState>((set, get) => {
  // update the screen first, then save. if saving fails, reload from the database
  const setCount = (habitId: string, date: IsoDate, count: number) => {
    const { habits, log } = get();
    const before = simulateJourney(habits, log, todayIso());

    const days = { ...log[habitId] };
    if (count > 0) days[date] = count;
    else delete days[date];
    const nextLog = { ...log, [habitId]: days };
    set({ log: nextLog });

    const after = simulateJourney(habits, nextLog, todayIso());
    celebrate(before.player, after.player);

    setCompletionCount(habitId, date, count)
      .then(() => saveCharacterSnapshot(after))
      .catch(() => get().load());
  };

  const reload = async () => {
    const [habits, log] = await Promise.all([habitsRepo.fetchHabits(), fetchCompletionLog()]);
    set({ habits, log, ready: true });
    saveCharacterSnapshot(simulateJourney(habits, log, todayIso())).catch(() => {});
  };

  return {
    ready: false,
    habits: [],
    log: {},

    load: reload,

    addHabit: async (draft) => {
      const habit: Habit = { ...draft, id: createId(), createdAt: todayIso() };
      await habitsRepo.insertHabit(habit);
      set((s) => ({ habits: [...s.habits, habit] }));
      return habit;
    },

    updateHabit: async (id, draft) => {
      const old = get().habits.find((h) => h.id === id);
      if (!old) return;
      const habit: Habit = { ...old, ...draft };
      await habitsRepo.updateHabit(habit);
      set((s) => ({ habits: s.habits.map((h) => (h.id === id ? habit : h)) }));
    },

    deleteHabit: async (id) => {
      await habitsRepo.deleteHabit(id);
      set((s) => {
        const log = { ...s.log };
        delete log[id];
        return { habits: s.habits.filter((h) => h.id !== id), log };
      });
    },

    checkIn: (habitId, date) => {
      const habit = get().habits.find((h) => h.id === habitId);
      if (!habit) return;
      const count = countOn(get().log, habitId, date);
      setCount(habitId, date, count >= habit.targetPerDay ? 0 : count + 1);
    },

    checkOut: (habitId, date) => {
      const count = countOn(get().log, habitId, date);
      if (count > 0) setCount(habitId, date, count - 1);
    },

    loadDemo: async () => {
      await loadDemoData();
      await reload();
    },

    clearAll: async () => {
      await clearAllData();
      await reload();
    },
  };
});

// big full screen moment on new camp or new best streak
function celebrate(
  before: { level: number; bestStreakDays: number },
  after: { level: number; streakDays: number; bestStreakDays: number },
) {
  const { showMoment } = useUi.getState();
  if (after.level > before.level) {
    showMoment({ kind: "camp", from: before.level, to: after.level });
  } else if (after.bestStreakDays > before.bestStreakDays && after.streakDays === after.bestStreakDays && before.bestStreakDays > 0) {
    showMoment({ kind: "record", days: after.streakDays });
  }
}
