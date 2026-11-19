// convert between database rows and app objects
import type { HabitRow } from "@/database/schema";
import type { Attribute, BlazeColor, BlazeShape, Habit, Weekday } from "@/types";

export function habitFromRow(row: HabitRow): Habit {
  const days = row.target_days
    .split(",")
    .filter((d) => d !== "")
    .map((d) => Number(d) as Weekday);
  return {
    id: row.id,
    name: row.name,
    shape: row.icon as BlazeShape,
    color: row.color as BlazeColor,
    attribute: row.attribute as Attribute,
    frequency: row.frequency_type === "every_day" ? { kind: "daily" } : { kind: "weekly", days },
    targetPerDay: row.target_per_day,
    reminderTime: row.reminder_time,
    createdAt: row.created_at,
  };
}

export function habitToRow(habit: Habit): HabitRow {
  const weekly = habit.frequency.kind === "weekly";
  return {
    id: habit.id,
    name: habit.name,
    icon: habit.shape,
    color: habit.color,
    attribute: habit.attribute,
    frequency_type: weekly ? "specific_weekdays" : "every_day",
    target_days: habit.frequency.kind === "weekly" ? [...habit.frequency.days].sort((a, b) => a - b).join(",") : "",
    target_per_day: habit.targetPerDay,
    reminder_time: habit.reminderTime,
    created_at: habit.createdAt,
  };
}
