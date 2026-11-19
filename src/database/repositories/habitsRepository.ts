import { getDb } from "@/database/db";
import { habitFromRow, habitToRow } from "@/database/mappers";
import type { HabitRow } from "@/database/schema";
import type { Habit } from "@/types";

export async function fetchHabits(): Promise<Habit[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<HabitRow>("SELECT * FROM habits ORDER BY created_at, rowid");
  return rows.map(habitFromRow);
}

export async function insertHabit(habit: Habit): Promise<void> {
  const db = await getDb();
  const r = habitToRow(habit);
  await db.runAsync(
    `INSERT INTO habits (id, name, icon, color, attribute, frequency_type, target_days, target_per_day, reminder_time, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [r.id, r.name, r.icon, r.color, r.attribute, r.frequency_type, r.target_days, r.target_per_day, r.reminder_time, r.created_at],
  );
}

export async function updateHabit(habit: Habit): Promise<void> {
  const db = await getDb();
  const r = habitToRow(habit);
  await db.runAsync(
    `UPDATE habits
        SET name = ?, icon = ?, color = ?, attribute = ?, frequency_type = ?, target_days = ?, target_per_day = ?, reminder_time = ?
      WHERE id = ?`,
    [r.name, r.icon, r.color, r.attribute, r.frequency_type, r.target_days, r.target_per_day, r.reminder_time, r.id],
  );
}

export async function deleteHabit(id: string): Promise<void> {
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    await db.runAsync("DELETE FROM completions WHERE habit_id = ?", [id]);
    await db.runAsync("DELETE FROM habits WHERE id = ?", [id]);
  });
}
