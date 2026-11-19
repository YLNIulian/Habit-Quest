import { getDb } from "@/database/db";
import type { CompletionRow } from "@/database/schema";
import { createId } from "@/lib/id";
import type { CompletionLog, IsoDate } from "@/types";

export async function fetchCompletionLog(): Promise<CompletionLog> {
  const db = await getDb();
  const rows = await db.getAllAsync<CompletionRow>(
    "SELECT habit_id, completion_date, count FROM completions WHERE count > 0",
  );
  const log: CompletionLog = {};
  for (const row of rows) (log[row.habit_id] ??= {})[row.completion_date] = row.count;
  return log;
}

// count 0 = delete the row (undo)
export async function setCompletionCount(habitId: string, date: IsoDate, count: number): Promise<void> {
  const db = await getDb();
  if (count <= 0) {
    await db.runAsync("DELETE FROM completions WHERE habit_id = ? AND completion_date = ?", [habitId, date]);
    return;
  }
  await db.runAsync(
    `INSERT INTO completions (id, habit_id, completion_date, count, completed_at)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT (habit_id, completion_date)
     DO UPDATE SET count = excluded.count, completed_at = excluded.completed_at`,
    [createId(), habitId, date, count, new Date().toISOString()],
  );
}
