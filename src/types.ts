// Domain types. Real storage/logic should produce these same shapes.

/** Trail-marker shape: the habit's icon. */
export type BlazeShape = "band" | "cross" | "triangle" | "dot" | "diamond";

/** Trail-marker paint: the habit's colour. */
export type BlazeColor = "red" | "yellow" | "blue";

/** RPG attribute a habit trains. */
export type Attribute = "vigor" | "focus" | "craft" | "calm";

/** Monday = 0 … Sunday = 6 */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type Frequency = { kind: "daily" } | { kind: "weekly"; days: Weekday[] };

export interface Habit {
  id: string;
  name: string;
  shape: BlazeShape;
  color: BlazeColor;
  attribute: Attribute;
  frequency: Frequency;
  /** How many times per due day the habit must be done. */
  targetPerDay: number;
  /** ISO date, YYYY-MM-DD */
  createdAt: string;
}

export interface Completion {
  id: string;
  habitId: string;
  /** ISO date, YYYY-MM-DD */
  date: string;
  count: number;
}

/** Consequence of missed habits, shown as weather on the mountain. */
export type Weather = "clear" | "wind" | "storm";

export interface PlayerState {
  /** Shown as the camp number. */
  level: number;
  /** XP inside the current level. 1 XP = 1 metre climbed. */
  xp: number;
  xpToNext: number;
  /** Lifetime XP, shown as altitude in metres. */
  totalXp: number;
  /** Shown as warmth. */
  hp: number;
  maxHp: number;
  streakDays: number;
  bestStreakDays: number;
  weather: Weather;
  /** Habit skipped yesterday that caused the weather, if any. */
  missedHabitId?: string;
}

export interface AttributeStat {
  attribute: Attribute;
  level: number;
  /** 0..1 towards the next attribute level. */
  progress: number;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  progress: number;
  goal: number;
  /** Reward in XP (metres). */
  rewardXp: number;
  /** Days left, when the quest expires. */
  daysLeft?: number;
}
