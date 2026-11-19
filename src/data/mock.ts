// ALL mock data lives here. Replace these exports with real storage later;
// screens only depend on the shapes in src/types.ts.
import dayjs from "dayjs";

import { isDueOn } from "@/lib/habits";
import type { AttributeStat, Completion, Habit, PlayerState, Quest, Weather } from "@/types";

const TODAY = dayjs().startOf("day");
const ISO = "YYYY-MM-DD";
const HISTORY_DAYS = 90;

export const TODAY_ISO = TODAY.format(ISO);

/** Mock reward for one finished habit, in metres. Real XP rules come later. */
export const XP_PER_HABIT = 15;

export const PLAYER: PlayerState = {
  level: 9,
  xp: 340,
  xpToNext: 500,
  totalXp: 2340,
  hp: 38,
  maxHp: 50,
  streakDays: 12,
  bestStreakDays: 21,
  weather: "wind",
  missedHabitId: "meditate",
};

export const HABITS: Habit[] = [
  {
    id: "water",
    name: "Drink water",
    shape: "dot",
    color: "blue",
    attribute: "vigor",
    frequency: { kind: "daily" },
    targetPerDay: 8,
    createdAt: "2026-08-03",
  },
  {
    id: "read",
    name: "Read 20 pages",
    shape: "band",
    color: "red",
    attribute: "focus",
    frequency: { kind: "daily" },
    targetPerDay: 1,
    createdAt: "2026-08-03",
  },
  {
    id: "run",
    name: "Morning run",
    shape: "triangle",
    color: "red",
    attribute: "vigor",
    frequency: { kind: "weekly", days: [0, 2, 4] },
    targetPerDay: 1,
    createdAt: "2026-08-10",
  },
  {
    id: "meditate",
    name: "Meditate",
    shape: "dot",
    color: "yellow",
    attribute: "calm",
    frequency: { kind: "daily" },
    targetPerDay: 1,
    createdAt: "2026-08-17",
  },
  {
    id: "guitar",
    name: "Practice guitar",
    shape: "cross",
    color: "yellow",
    attribute: "craft",
    frequency: { kind: "weekly", days: [1, 3, 5] },
    targetPerDay: 1,
    createdAt: "2026-09-01",
  },
  {
    id: "stretch",
    name: "Stretch",
    shape: "triangle",
    color: "blue",
    attribute: "vigor",
    frequency: { kind: "daily" },
    targetPerDay: 2,
    createdAt: "2026-09-14",
  },
];

export const ATTRIBUTES: AttributeStat[] = [
  { attribute: "vigor", level: 7, progress: 0.62 },
  { attribute: "focus", level: 5, progress: 0.35 },
  { attribute: "craft", level: 3, progress: 0.8 },
  { attribute: "calm", level: 4, progress: 0.18 },
];

export const QUESTS: Quest[] = [
  {
    id: "north-ridge",
    title: "The North Ridge",
    description: "Finish 5 Focus habits this week",
    progress: 3,
    goal: 5,
    rewardXp: 120,
    daysLeft: 3,
  },
  {
    id: "first-light",
    title: "First light",
    description: "Finish every habit due today",
    progress: 1,
    goal: 4,
    rewardXp: 40,
  },
];

// Fixed state for today so the Today screen always shows a mix of progress.
const TODAY_COUNTS: Record<string, number> = { water: 5, read: 1, stretch: 1 };

// Deterministic pseudo-random, so history looks the same on every reload.
function rand(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function buildCompletions(): Completion[] {
  const out: Completion[] = [];
  for (let back = HISTORY_DAYS; back >= 0; back--) {
    const date = TODAY.subtract(back, "day");
    const iso = date.format(ISO);
    HABITS.forEach((habit, i) => {
      if (!isDueOn(habit, date)) return;
      let count: number;
      if (back === 0) {
        count = TODAY_COUNTS[habit.id] ?? 0;
      } else if (back === 1 && habit.id === PLAYER.missedHabitId) {
        count = 0;
      } else {
        // Consistency improves towards the present.
        const consistency = 0.5 + 0.38 * (1 - back / HISTORY_DAYS);
        const r = rand(back * 7 + i * 13 + 1);
        if (r < consistency) count = habit.targetPerDay;
        else if (r < consistency + 0.12) count = habit.targetPerDay - 1;
        else count = 0;
      }
      if (count > 0) out.push({ id: `${habit.id}-${iso}`, habitId: habit.id, date: iso, count });
    });
  }
  return out;
}

export const COMPLETIONS: Completion[] = buildCompletions();

const countById = new Map(COMPLETIONS.map((c) => [c.id, c.count]));

/** How many times a habit was done on a given ISO date. */
export function countOn(habitId: string, iso: string): number {
  return countById.get(`${habitId}-${iso}`) ?? 0;
}

/** Share of due habits fully completed on a date: 0..1, or null when nothing was due. */
export function dayRatio(iso: string): number | null {
  const date = dayjs(iso);
  const due = HABITS.filter((h) => isDueOn(h, date));
  if (due.length === 0) return null;
  const done = due.filter((h) => countOn(h.id, iso) >= h.targetPerDay).length;
  return done / due.length;
}

/** Last 7 days for one habit, oldest first: done, missed, or not due. */
export function lastWeek(habit: Habit): ("done" | "missed" | "rest")[] {
  return Array.from({ length: 7 }, (_, i) => {
    const date = TODAY.subtract(6 - i, "day");
    if (!isDueOn(habit, date)) return "rest";
    return countOn(habit.id, date.format(ISO)) >= habit.targetPerDay ? "done" : "missed";
  });
}

/** Mock warmth (HP) for each previewable weather state. */
export const WARMTH_BY_WEATHER: Record<Weather, number> = { clear: 46, wind: PLAYER.hp, storm: 14 };
