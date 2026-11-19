// Demo data so the app doesn't look empty when presenting it.
import { getDb } from "@/database/db";
import { habitToRow } from "@/database/mappers";
import { isScheduled } from "@/game/history";
import { addDays, todayIso } from "@/lib/dates";
import { createId } from "@/lib/id";
import type { Habit } from "@/types";

const HISTORY_DAYS = 90;

type DemoHabit = Omit<Habit, "id" | "createdAt"> & { startsDaysAgo: number };

const DEMO_HABITS: DemoHabit[] = [
  { name: "Drink water", shape: "dot", color: "blue", attribute: "vigor", frequency: { kind: "daily" }, targetPerDay: 8, reminderTime: null, startsDaysAgo: 90 },
  { name: "Read 20 pages", shape: "band", color: "red", attribute: "focus", frequency: { kind: "daily" }, targetPerDay: 1, reminderTime: null, startsDaysAgo: 90 },
  { name: "Morning run", shape: "triangle", color: "red", attribute: "vigor", frequency: { kind: "weekly", days: [0, 2, 4] }, targetPerDay: 1, reminderTime: null, startsDaysAgo: 80 },
  { name: "Meditate", shape: "dot", color: "yellow", attribute: "calm", frequency: { kind: "daily" }, targetPerDay: 1, reminderTime: null, startsDaysAgo: 70 },
  { name: "Practice guitar", shape: "cross", color: "yellow", attribute: "craft", frequency: { kind: "weekly", days: [1, 3, 5] }, targetPerDay: 1, reminderTime: null, startsDaysAgo: 60 },
  { name: "Stretch", shape: "triangle", color: "blue", attribute: "vigor", frequency: { kind: "daily" }, targetPerDay: 2, reminderTime: null, startsDaysAgo: 45 },
];

// same "random" numbers every time
function rand(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

// replaces everything in the database with the demo habits and ~3 months of history
export async function loadDemoData(): Promise<void> {
  const db = await getDb();
  const today = todayIso();
  const habits: Habit[] = DEMO_HABITS.map(({ startsDaysAgo, ...h }) => ({
    ...h,
    id: createId(),
    createdAt: addDays(today, -startsDaysAgo),
  }));

  await db.withTransactionAsync(async () => {
    await db.execAsync("DELETE FROM completions; DELETE FROM habits;");

    for (const habit of habits) {
      const r = habitToRow(habit);
      await db.runAsync(
        `INSERT INTO habits (id, name, icon, color, attribute, frequency_type, target_days, target_per_day, reminder_time, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [r.id, r.name, r.icon, r.color, r.attribute, r.frequency_type, r.target_days, r.target_per_day, r.reminder_time, r.created_at],
      );
    }

    // leave today empty so there is something to check off
    for (let back = HISTORY_DAYS; back >= 1; back--) {
      const iso = addDays(today, -back);
      for (let i = 0; i < habits.length; i++) {
        const habit = habits[i];
        if (!isScheduled(habit, iso)) continue;
        // gets better over time
        const consistency = 0.55 + 0.4 * (1 - back / HISTORY_DAYS);
        const r = rand(back * 7 + i * 13 + 1);
        const count = r < consistency ? habit.targetPerDay : r < consistency + 0.1 ? habit.targetPerDay - 1 : 0;
        if (count <= 0) continue;
        await db.runAsync(
          "INSERT INTO completions (id, habit_id, completion_date, count, completed_at) VALUES (?, ?, ?, ?, ?)",
          [createId(), habit.id, iso, count, `${iso}T09:00:00.000Z`],
        );
      }
    }
  });
}

export async function clearAllData(): Promise<void> {
  const db = await getDb();
  await db.execAsync("DELETE FROM completions; DELETE FROM habits;");
}
