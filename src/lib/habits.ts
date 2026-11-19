import type { Dayjs } from "dayjs";

import type { Attribute, Frequency, Habit, Weekday } from "@/types";

export const WEEKDAY_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
export const WEEKDAY_INITIAL = ["M", "T", "W", "T", "F", "S", "S"] as const;

/** dayjs uses Sunday = 0; the app uses Monday = 0. */
export function weekdayOf(date: Dayjs): Weekday {
  return ((date.day() + 6) % 7) as Weekday;
}

export function isDueOn(habit: Habit, date: Dayjs): boolean {
  return habit.frequency.kind === "daily" || habit.frequency.days.includes(weekdayOf(date));
}

export function frequencyLabel(frequency: Frequency): string {
  if (frequency.kind === "daily" || frequency.days.length === 7) return "Every day";
  if (frequency.days.length === 0) return "No days chosen";
  return [...frequency.days]
    .sort((a, b) => a - b)
    .map((d) => WEEKDAY_SHORT[d])
    .join(", ");
}

export const ATTRIBUTES: Attribute[] = ["vigor", "focus", "craft", "calm"];

export const ATTRIBUTE_LABEL: Record<Attribute, string> = {
  vigor: "Vigor",
  focus: "Focus",
  craft: "Craft",
  calm: "Calm",
};

/** What each attribute is for, shown where a habit is assigned to one. */
export const ATTRIBUTE_HINT: Record<Attribute, string> = {
  vigor: "Body and movement",
  focus: "Reading and study",
  craft: "Making and practice",
  calm: "Rest and stillness",
};
