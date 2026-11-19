import { create } from "zustand";

import { saveCharacterSnapshot } from "@/database/repositories/characterRepository";
import { fetchCompletionLog, setCompletionCount } from "@/database/repositories/completionsRepository";
import * as habitsRepo from "@/database/repositories/habitsRepository";
import { getSetting, setSetting } from "@/database/repositories/settingsRepository";
import { clearAllData, loadDemoData } from "@/database/seed";
import { countOn } from "@/game/history";
import { simulateJourney } from "@/game/journey";
import { addDays, todayIso } from "@/lib/dates";
import { createId } from "@/lib/id";
import { useUi } from "@/store/ui";
import type { CompletionLog, Habit, HabitDraft, IsoDate } from "@/types";

const SETTLED_KEY = "settled_through";

interface HabitState {
  ready: boolean;
  habits: Habit[];
  log: CompletionLog;
  // last day whose misses already cost warmth (set by "Start the day")
  settledThrough: IsoDate | null;

  load: () => Promise<void>;
  addHabit: (draft: HabitDraft) => Promise<Habit>;
  updateHabit: (id: string, draft: HabitDraft) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;

  // tap: +1 (or undo if already done)
  checkIn: (habitId: string, date: IsoDate) => void;
  // long press: -1
  checkOut: (habitId: string, date: IsoDate) => void;
  // calendar: mark a whole day done or not done
  setDayDone: (habitId: string, date: IsoDate, done: boolean) => void;
  settleThrough: (date: IsoDate) => Promise<void>;
  // dev only: opens yesterday again so the trail report shows
  reopenYesterday: () => Promise<void>;

  loadDemo: () => Promise<void>;
  clearAll: () => Promise<void>;
}

export const useHabitStore = create<HabitState>((set, get) => {
  const journeyOf = (log: CompletionLog) => simulateJourney(get().habits, log, todayIso(), get().settledThrough);

  // update the screen first, then save. if saving fails, reload from the database
  const setCount = (habitId: string, date: IsoDate, count: number) => {
    const { log } = get();
    const before = journeyOf(log);

    const days = { ...log[habitId] };
    if (count > 0) days[date] = count;
    else delete days[date];
    const nextLog = { ...log, [habitId]: days };
    set({ log: nextLog });

    const after = journeyOf(nextLog);
    celebrate(before.player, after.player);

    setCompletionCount(habitId, date, count)
      .then(() => saveCharacterSnapshot(after))
      .catch(() => get().load());
  };

  const saveSettled = async (date: IsoDate) => {
    set({ settledThrough: date });
    await setSetting(SETTLED_KEY, date);
  };

  const reload = async () => {
    const [habits, log, settled] = await Promise.all([
      habitsRepo.fetchHabits(),
      fetchCompletionLog(),
      getSetting(SETTLED_KEY),
    ]);
    set({ habits, log, settledThrough: settled, ready: true });
    // first launch: nothing to report yet
    if (!settled) await saveSettled(addDays(todayIso(), -1));
    saveCharacterSnapshot(journeyOf(log)).catch(() => {});
  };

  return {
    ready: false,
    habits: [],
    log: {},
    settledThrough: null,

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

    setDayDone: (habitId, date, done) => {
      const habit = get().habits.find((h) => h.id === habitId);
      if (!habit) return;
      setCount(habitId, date, done ? habit.targetPerDay : 0);
    },

    settleThrough: async (date) => {
      const current = get().settledThrough;
      if (current && current >= date) return;
      await saveSettled(date);
      saveCharacterSnapshot(journeyOf(get().log)).catch(() => {});
    },

    reopenYesterday: () => saveSettled(addDays(todayIso(), -2)),

    loadDemo: async () => {
      await loadDemoData();
      await reload();
      // leave yesterday open so the trail report shows up
      await saveSettled(addDays(todayIso(), -2));
    },

    clearAll: async () => {
      await clearAllData();
      await reload();
      await saveSettled(addDays(todayIso(), -1));
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
