import { isDone, isScheduled } from "@/game/history";
import { daysBetween } from "@/lib/dates";
import type { CompletionLog, Habit, HabitStreak, IsoDate } from "@/types";

export function habitStreak(habit: Habit, log: CompletionLog, today: IsoDate): HabitStreak {
  let current = 0;
  let best = 0;
  let totalDone = 0;
  let dueDays = 0;

  for (const iso of daysBetween(habit.createdAt, today)) {
    // days when it's not due don't count
    if (!isScheduled(habit, iso)) continue;
    if (isDone(habit, log, iso)) {
      current++;
      totalDone++;
      dueDays++;
      best = Math.max(best, current);
    } else if (iso !== today) {
      // today isn't over yet, so it can't break the streak
      current = 0;
      dueDays++;
    }
  }

  return { current, best, totalDone, dueDays };
}

// 0..1, null if nothing was due yet
export function successRate(streak: HabitStreak): number | null {
  return streak.dueDays === 0 ? null : streak.totalDone / streak.dueDays;
}
