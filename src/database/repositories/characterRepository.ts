import { getDb } from "@/database/db";
import type { Journey } from "@/game/journey";
import type { Attribute } from "@/types";

// saves the current stats so they are also in the database
export async function saveCharacterSnapshot({ player, attributes }: Journey): Promise<void> {
  const db = await getDb();
  const level = (a: Attribute) => attributes.find((s) => s.attribute === a)?.level ?? 1;
  await db.runAsync(
    `UPDATE character
        SET level = ?, xp = ?, total_xp = ?, hp = ?, streak = ?, best_streak = ?,
            str = ?, int = ?, vit = ?, spi = ?, updated_at = ?
      WHERE id = 1`,
    [
      player.level,
      player.xp,
      player.totalXp,
      player.hp,
      player.streakDays,
      player.bestStreakDays,
      level("vigor"),
      level("focus"),
      level("craft"),
      level("calm"),
      new Date().toISOString(),
    ],
  );
}
