import type { Dayjs } from "dayjs";

import { weekdayOf } from "@/lib/dates";
import type { Attribute, Frequency, Habit, IsoDate } from "@/types";

export const WEEKDAY_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
export const WEEKDAY_INITIAL = ["M", "T", "W", "T", "F", "S", "S"] as const;

export function isDueOn(habit: Habit, date: Dayjs | IsoDate): boolean {
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

export const ATTRIBUTE_HINT: Record<Attribute, string> = {
  vigor: "Body and movement",
  focus: "Reading and study",
  craft: "Making and practice",
  calm: "Rest and stillness",
};

export const MAX_PER_DAY = 12;
