import { ATTRIBUTE_XP_PER_LEVEL, MAX_CAMP, xpToNextCamp } from "@/game/rules";

export interface CampPosition {
  level: number;
  xp: number;
  xpToNext: number;
}

export function campFromXp(totalXp: number): CampPosition {
  let level = 1;
  let rest = Math.max(0, totalXp);
  while (level < MAX_CAMP && rest >= xpToNextCamp(level)) {
    rest -= xpToNextCamp(level);
    level++;
  }
  const xpToNext = xpToNextCamp(level);
  // at the top the bar just stays full
  return { level, xp: Math.min(rest, xpToNext), xpToNext };
}

// total metres needed to reach a camp
export function xpForCamp(level: number): number {
  let total = 0;
  for (let l = 1; l < Math.min(level, MAX_CAMP); l++) total += xpToNextCamp(l);
  return total;
}

export function attributeFromXp(xp: number): { level: number; progress: number } {
  return {
    level: Math.floor(xp / ATTRIBUTE_XP_PER_LEVEL) + 1,
    progress: (xp % ATTRIBUTE_XP_PER_LEVEL) / ATTRIBUTE_XP_PER_LEVEL,
  };
}
