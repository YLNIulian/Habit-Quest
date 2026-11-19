import { openDatabaseAsync, type SQLiteDatabase } from "expo-sqlite";
import { Platform } from "react-native";

import { MIGRATIONS } from "@/database/schema";

const DATABASE_NAME = "uphill.db";

// async open, because on web sqlite runs in a worker that loads in the background
let db: Promise<SQLiteDatabase> | null = null;

export function getDb(): Promise<SQLiteDatabase> {
  db ??= openDatabaseAsync(DATABASE_NAME).catch((error) => {
    db = null;
    throw error;
  });
  return db;
}

let ready: Promise<void> | null = null;

export function initDatabase(): Promise<void> {
  ready ??= getDb()
    .then(migrate)
    .catch((error) => {
      ready = null;
      throw error;
    });
  return ready;
}

async function migrate(database: SQLiteDatabase) {
  // needed for ON DELETE CASCADE
  await database.execAsync("PRAGMA foreign_keys = ON;");
  if (Platform.OS !== "web") await database.execAsync("PRAGMA journal_mode = WAL;");

  const row = await database.getFirstAsync<{ user_version: number }>("PRAGMA user_version");
  const current = row?.user_version ?? 0;

  for (let version = current; version < MIGRATIONS.length; version++) {
    await database.withTransactionAsync(async () => {
      await database.execAsync(MIGRATIONS[version]);
      await database.execAsync(`PRAGMA user_version = ${version + 1}`);
    });
  }
}
