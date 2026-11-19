import { getDb } from "@/database/db";
import { getSetting, setSetting } from "@/database/repositories/settingsRepository";
import { sanitizeLook, type Look } from "@/game/wardrobe";

const LOOK_KEY = "look";

// item id -> price paid
export async function fetchPurchases(): Promise<Record<string, number>> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ item_id: string; price: number }>("SELECT item_id, price FROM purchases");
  return Object.fromEntries(rows.map((r) => [r.item_id, r.price]));
}

export async function insertPurchases(items: { id: string; price: number }[]): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();
  await db.withTransactionAsync(async () => {
    for (const item of items) {
      await db.runAsync("INSERT OR IGNORE INTO purchases (item_id, price, bought_at) VALUES (?, ?, ?)", [
        item.id,
        item.price,
        now,
      ]);
    }
  });
}

export async function clearPurchases(): Promise<void> {
  const db = await getDb();
  await db.execAsync("DELETE FROM purchases;");
}

export async function fetchLook(): Promise<Look> {
  const raw = await getSetting(LOOK_KEY);
  if (!raw) return sanitizeLook(null);
  try {
    return sanitizeLook(JSON.parse(raw));
  } catch {
    return sanitizeLook(null);
  }
}

export async function saveLook(look: Look): Promise<void> {
  await setSetting(LOOK_KEY, JSON.stringify(look));
}
