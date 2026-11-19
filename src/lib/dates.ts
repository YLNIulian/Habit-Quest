import dayjs, { type Dayjs } from "dayjs";

import type { IsoDate, Weekday } from "@/types";

export const ISO_FORMAT = "YYYY-MM-DD";

export function toIso(date: Dayjs): IsoDate {
  return date.format(ISO_FORMAT);
}

export function todayIso(): IsoDate {
  return toIso(dayjs());
}

export function fromIso(iso: IsoDate): Dayjs {
  return dayjs(iso, ISO_FORMAT);
}

export function addDays(iso: IsoDate, days: number): IsoDate {
  return toIso(fromIso(iso).add(days, "day"));
}

// dayjs starts the week on Sunday, we start on Monday
export function weekdayOf(date: Dayjs | IsoDate): Weekday {
  const d = typeof date === "string" ? fromIso(date) : date;
  return ((d.day() + 6) % 7) as Weekday;
}

export function weekStart(iso: IsoDate): IsoDate {
  return addDays(iso, -weekdayOf(iso));
}

export function daysBetween(from: IsoDate, to: IsoDate): IsoDate[] {
  const out: IsoDate[] = [];
  for (let d = from; d <= to; d = addDays(d, 1)) out.push(d);
  return out;
}

export function relativeDayLabel(iso: IsoDate, today: IsoDate): string {
  if (iso === addDays(today, -1)) return "yesterday";
  const diff = fromIso(today).diff(fromIso(iso), "day");
  return diff < 7 ? `on ${fromIso(iso).format("dddd")}` : `on ${fromIso(iso).format("D MMMM")}`;
}
