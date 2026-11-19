import { dueOn, isDone } from "@/game/history";
import { addDays, daysBetween } from "@/lib/dates";
import type { CompletionLog, Habit, IsoDate } from "@/types";

export interface TrailReport {
  yesterday: IsoDate;
  dueYesterday: Habit[];
  // due yesterday and still not done
  missedYesterday: Habit[];
  // days before yesterday that will be settled automatically
  olderDays: IsoDate[];
  olderMisses: number;
}

// days waiting to be settled, or null if there is nothing to show
export function trailReport(
  habits: Habit[],
  log: CompletionLog,
  today: IsoDate,
  settledThrough: IsoDate | null,
): TrailReport | null {
  const yesterday = addDays(today, -1);
  if (!settledThrough || settledThrough >= yesterday) return null;

  const dueYesterday = dueOn(habits, yesterday);
  const missedYesterday = dueYesterday.filter((h) => !isDone(h, log, yesterday));

  const olderDays = daysBetween(addDays(settledThrough, 1), addDays(yesterday, -1));
  const olderMisses = olderDays.reduce(
    (sum, iso) => sum + dueOn(habits, iso).filter((h) => !isDone(h, log, iso)).length,
    0,
  );

  // only bother the user when something was missed
  if (missedYesterday.length === 0 && olderMisses === 0) return null;
  return { yesterday, dueYesterday, missedYesterday, olderDays, olderMisses };
}
