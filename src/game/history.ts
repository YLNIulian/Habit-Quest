import { addDays } from "@/lib/dates";
import { isDueOn } from "@/lib/habits";
import type { CompletionLog, Habit, IsoDate } from "@/types";

export function countOn(log: CompletionLog, habitId: string, iso: IsoDate): number {
  return log[habitId]?.[iso] ?? 0;
}

// due that day and the habit already existed
export function isScheduled(habit: Habit, iso: IsoDate): boolean {
  return habit.createdAt <= iso && isDueOn(habit, iso);
}

export function isDone(habit: Habit, log: CompletionLog, iso: IsoDate): boolean {
  return countOn(log, habit.id, iso) >= habit.targetPerDay;
}

export function dueOn(habits: Habit[], iso: IsoDate): Habit[] {
  return habits.filter((h) => isScheduled(h, iso));
}

// 0..1, null if nothing was due
export function dayRatio(habits: Habit[], log: CompletionLog, iso: IsoDate): number | null {
  const due = dueOn(habits, iso);
  if (due.length === 0) return null;
  return due.filter((h) => isDone(h, log, iso)).length / due.length;
}

export type DayMark = "done" | "missed" | "rest" | "today";

export function recentDays(habit: Habit, log: CompletionLog, today: IsoDate, days = 7): DayMark[] {
  return Array.from({ length: days }, (_, i) => {
    const iso = addDays(today, i - (days - 1));
    if (!isScheduled(habit, iso)) return "rest";
    if (isDone(habit, log, iso)) return "done";
    return iso === today ? "today" : "missed";
  });
}

export function firstDay(habits: Habit[]): IsoDate | null {
  if (habits.length === 0) return null;
  return habits.reduce((min, h) => (h.createdAt < min ? h.createdAt : min), habits[0].createdAt);
}
