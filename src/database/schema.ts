// Each item is one migration. Don't change old ones, add a new one at the end.
export const MIGRATIONS: string[] = [
  `
  CREATE TABLE IF NOT EXISTS habits (
    id             TEXT PRIMARY KEY NOT NULL,
    name           TEXT NOT NULL,
    icon           TEXT NOT NULL,
    color          TEXT NOT NULL,
    attribute      TEXT NOT NULL,
    frequency_type TEXT NOT NULL CHECK (frequency_type IN ('every_day', 'specific_weekdays')),
    target_days    TEXT NOT NULL DEFAULT '',
    target_per_day INTEGER NOT NULL DEFAULT 1,
    reminder_time  TEXT,
    created_at     TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS completions (
    id              TEXT PRIMARY KEY NOT NULL,
    habit_id        TEXT NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
    completion_date TEXT NOT NULL,
    count           INTEGER NOT NULL DEFAULT 1,
    completed_at    TEXT NOT NULL,
    UNIQUE (habit_id, completion_date)
  );
  CREATE INDEX IF NOT EXISTS idx_completions_date ON completions (completion_date);

  CREATE TABLE IF NOT EXISTS character (
    id          INTEGER PRIMARY KEY NOT NULL CHECK (id = 1),
    level       INTEGER NOT NULL DEFAULT 1,
    xp          INTEGER NOT NULL DEFAULT 0,
    total_xp    INTEGER NOT NULL DEFAULT 0,
    hp          INTEGER NOT NULL DEFAULT 50,
    streak      INTEGER NOT NULL DEFAULT 0,
    best_streak INTEGER NOT NULL DEFAULT 0,
    str         INTEGER NOT NULL DEFAULT 1,
    int         INTEGER NOT NULL DEFAULT 1,
    vit         INTEGER NOT NULL DEFAULT 1,
    spi         INTEGER NOT NULL DEFAULT 1,
    updated_at  TEXT
  );
  INSERT OR IGNORE INTO character (id) VALUES (1);

  CREATE TABLE IF NOT EXISTS settings (
    key   TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL
  );
  `,
  // 2: outfit shop
  `
  CREATE TABLE IF NOT EXISTS purchases (
    item_id   TEXT PRIMARY KEY NOT NULL,
    price     INTEGER NOT NULL,
    bought_at TEXT NOT NULL
  );
  `,
];

export interface HabitRow {
  id: string;
  name: string;
  icon: string;
  color: string;
  attribute: string;
  frequency_type: "every_day" | "specific_weekdays";
  // weekdays like "0,2,4"
  target_days: string;
  target_per_day: number;
  reminder_time: string | null;
  created_at: string;
}

export interface CompletionRow {
  habit_id: string;
  completion_date: string;
  count: number;
}
