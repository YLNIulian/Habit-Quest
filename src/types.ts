// YYYY-MM-DD, local time
export type IsoDate = string;

export type BlazeShape = "band" | "cross" | "triangle" | "dot" | "diamond";

export type BlazeColor = "red" | "yellow" | "blue";

export type Attribute = "vigor" | "focus" | "craft" | "calm";

// Monday = 0 ... Sunday = 6
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type Frequency = { kind: "daily" } | { kind: "weekly"; days: Weekday[] };

export interface Habit {
  id: string;
  name: string;
  shape: BlazeShape;
  color: BlazeColor;
  attribute: Attribute;
  frequency: Frequency;
  targetPerDay: number;
  // "HH:mm" or null
  reminderTime: string | null;
  createdAt: IsoDate;
}

export type HabitDraft = Omit<Habit, "id" | "createdAt">;

// habitId -> date -> count
export type CompletionLog = Record<string, Record<IsoDate, number>>;

export type Weather = "clear" | "wind" | "storm";

export interface PlayerState {
  level: number;
  // xp inside the current level (1 xp = 1 m)
  xp: number;
  xpToNext: number;
  totalXp: number;
  hp: number;
  maxHp: number;
  streakDays: number;
  bestStreakDays: number;
  weather: Weather;
  missedHabitIds: string[];
  missedOn?: IsoDate;
  warmthLost: number;
  retreats: number;
}

export interface AttributeStat {
  attribute: Attribute;
  level: number;
  // 0..1
  progress: number;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  progress: number;
  goal: number;
  rewardXp: number;
  daysLeft?: number;
}

export interface HabitStreak {
  current: number;
  best: number;
  totalDone: number;
}
