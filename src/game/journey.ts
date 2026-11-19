// Calculates the player state by going through every day from the first habit until today.
// Nothing is added up in the database, so undo / edit / delete always give the right result.
import { dueOn, firstDay, isDone } from "@/game/history";
import { attributeFromXp, campFromXp } from "@/game/levels";
import { questsFor, weeklyPlan, type WeeklyPlan } from "@/game/quests";
import {
  COINS_DAILY_QUEST,
  COINS_PER_CAMP,
  COINS_PER_HABIT,
  COINS_STREAK_WEEK,
  COINS_WEEKLY_QUEST,
  DAILY_QUEST_REWARD,
  MAX_WARMTH,
  RETREAT_WARMTH,
  STORM_MISSES,
  WARMTH_PER_CLEAN_DAY,
  WARMTH_PER_MISS,
  WEEKLY_QUEST_REWARD,
  XP_PER_HABIT,
} from "@/game/rules";
import { daysBetween, weekStart } from "@/lib/dates";
import { ATTRIBUTES } from "@/lib/habits";
import type { Attribute, AttributeStat, CompletionLog, Habit, IsoDate, PlayerState, Quest, Weather } from "@/types";

export interface Journey {
  player: PlayerState;
  attributes: AttributeStat[];
  quests: Quest[];
  // all coins earned so far (spending is tracked separately)
  coinsEarned: number;
}

interface ClosedDay {
  iso: IsoDate;
  missed: string[];
}

// settledThrough: last day the user already "closed" with Start the day.
// misses after it don't cost anything yet. undefined = every past day counts.
export function simulateJourney(
  habits: Habit[],
  log: CompletionLog,
  today: IsoDate,
  settledThrough?: IsoDate | null,
): Journey {
  let totalXp = 0;
  let warmth = MAX_WARMTH;
  let streak = 0;
  let best = 0;
  let retreats = 0;
  let coins = 0;
  // highest camp ever reached, so a retreat doesn't pay the same camp twice
  let topCamp = 1;
  const attributeXp: Record<Attribute, number> = { vigor: 0, focus: 0, craft: 0, calm: 0 };

  // last two past days that had habits due (used for the weather)
  let last: ClosedDay | null = null;
  let previous: ClosedDay | null = null;

  let week: IsoDate | null = null;
  let plan: WeeklyPlan | null = null;
  let weekProgress = 0;
  let weekRewarded = false;

  let todayDue = 0;
  let todayDone = 0;

  const start = firstDay(habits);
  for (const iso of start ? daysBetween(start, today) : []) {
    const due = dueOn(habits, iso);
    const done = due.filter((h) => isDone(h, log, iso));

    totalXp += done.length * XP_PER_HABIT;
    coins += done.length * COINS_PER_HABIT;
    for (const h of done) attributeXp[h.attribute] += XP_PER_HABIT;

    if (due.length > 0 && done.length === due.length) {
      totalXp += DAILY_QUEST_REWARD;
      coins += COINS_DAILY_QUEST;
    }

    const monday = weekStart(iso);
    if (monday !== week) {
      week = monday;
      plan = weeklyPlan(habits, monday);
      weekProgress = 0;
      weekRewarded = false;
    }
    if (plan) {
      const attribute = plan.attribute;
      weekProgress += done.filter((h) => h.attribute === attribute).length;
      if (!weekRewarded && weekProgress >= plan.goal) {
        totalXp += WEEKLY_QUEST_REWARD;
        coins += COINS_WEEKLY_QUEST;
        weekRewarded = true;
      }
    }

    const camp = campFromXp(totalXp).level;
    if (camp > topCamp) {
      coins += (camp - topCamp) * COINS_PER_CAMP;
      topCamp = camp;
    }

    if (iso === today) {
      todayDue = due.length;
      todayDone = done.length;
      break;
    }

    if (due.length === 0) continue;
    const missed = due.filter((h) => !isDone(h, log, iso)).map((h) => h.id);
    const settled = !settledThrough || iso <= settledThrough;
    // waiting for the trail report, nothing happens yet
    if (missed.length > 0 && !settled) continue;
    if (missed.length === 0) {
      streak++;
      best = Math.max(best, streak);
      if (streak % 7 === 0) coins += COINS_STREAK_WEEK;
      warmth = Math.min(MAX_WARMTH, warmth + WARMTH_PER_CLEAN_DAY);
    } else {
      streak = 0;
      warmth -= missed.length * WARMTH_PER_MISS;
      if (warmth <= 0) {
        // no warmth left: go back to the start of the current camp
        totalXp -= campFromXp(totalXp).xp;
        warmth = RETREAT_WARMTH;
        retreats++;
      }
    }
    previous = last;
    last = { iso, missed };
  }

  // today counts for the streak once everything is done
  const todayClean = todayDue > 0 && todayDone === todayDue;
  const streakDays = streak + (todayClean ? 1 : 0);
  const bestStreakDays = Math.max(best, streakDays);
  if (todayClean && streakDays % 7 === 0) coins += COINS_STREAK_WEEK;

  const missedHabitIds = last?.missed ?? [];
  const camp = campFromXp(totalXp);

  return {
    player: {
      level: camp.level,
      xp: camp.xp,
      xpToNext: camp.xpToNext,
      totalXp,
      hp: warmth,
      maxHp: MAX_WARMTH,
      streakDays,
      bestStreakDays,
      weather: weatherFor(last, previous, todayDone, todayDue),
      missedHabitIds,
      missedOn: missedHabitIds.length > 0 ? last?.iso : undefined,
      warmthLost: missedHabitIds.length * WARMTH_PER_MISS,
      retreats,
    },
    attributes: ATTRIBUTES.map((attribute) => ({ attribute, ...attributeFromXp(attributeXp[attribute]) })),
    quests: questsFor(habits, log, today),
    coinsEarned: coins,
  };
}

function weatherFor(last: ClosedDay | null, previous: ClosedDay | null, todayDone: number, todayDue: number): Weather {
  let weather: Weather = "clear";
  if (last && last.missed.length > 0) {
    const storm = last.missed.length >= STORM_MISSES || (previous !== null && previous.missed.length > 0);
    weather = storm ? "storm" : "wind";
  }
  // doing today's habits makes it better
  if (todayDue > 0 && todayDone === todayDue) return "clear";
  if (weather === "storm" && todayDone > 0) return "wind";
  return weather;
}
