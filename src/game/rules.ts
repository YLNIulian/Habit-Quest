// game balance numbers

export const XP_PER_HABIT = 15;

export const MAX_CAMP = 30;

export function xpToNextCamp(level: number): number {
  return 100 + 50 * (level - 1);
}

export const MAX_WARMTH = 50;
export const WARMTH_PER_MISS = 4;
export const WARMTH_PER_CLEAN_DAY = 3;
// warmth after nim retreats to camp
export const RETREAT_WARMTH = 25;

// this many misses in one day = blizzard
export const STORM_MISSES = 3;

export const ATTRIBUTE_XP_PER_LEVEL = 150;

// how many days back you can still fix a day you forgot to check
export const EDIT_DAYS_BACK = 7;

export const DAILY_QUEST_REWARD = 40;
export const WEEKLY_QUEST_REWARD = 120;
export const WEEKLY_QUEST_MAX_GOAL = 5;

// coins, spent in the outfit shop
export const COINS_PER_HABIT = 5;
export const COINS_DAILY_QUEST = 10;
export const COINS_WEEKLY_QUEST = 30;
export const COINS_PER_CAMP = 50;
// every 7 days in a row
export const COINS_STREAK_WEEK = 25;
// outfits are cheaper than buying the pieces one by one
export const OUTFIT_DISCOUNT = 0.8;
