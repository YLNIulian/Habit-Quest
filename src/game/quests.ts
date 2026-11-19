import { dueOn, isDone } from "@/game/history";
import { DAILY_QUEST_REWARD, WEEKLY_QUEST_MAX_GOAL, WEEKLY_QUEST_REWARD } from "@/game/rules";
import { addDays, daysBetween, fromIso, weekdayOf, weekStart } from "@/lib/dates";
import { ATTRIBUTE_LABEL, ATTRIBUTES } from "@/lib/habits";
import type { Attribute, CompletionLog, Habit, IsoDate, Quest } from "@/types";

const EXPEDITION: Record<Attribute, string> = {
  vigor: "The North Ridge",
  focus: "Lantern Pass",
  craft: "Carver's Traverse",
  calm: "Still Lake Loop",
};

// any monday, used to count weeks
const EPOCH_MONDAY = "2024-01-01";

export interface WeeklyPlan {
  attribute: Attribute;
  goal: number;
}

// the attribute changes every week, skipping ones the user has no habits for
export function weeklyPlan(habits: Habit[], monday: IsoDate): WeeklyPlan | null {
  const week = daysBetween(monday, addDays(monday, 6));
  const weekIndex = Math.round(fromIso(monday).diff(fromIso(EPOCH_MONDAY), "week", true));
  const n = ATTRIBUTES.length;
  for (let i = 0; i < n; i++) {
    const attribute = ATTRIBUTES[(((weekIndex + i) % n) + n) % n];
    const possible = week.reduce(
      (sum, iso) => sum + dueOn(habits, iso).filter((h) => h.attribute === attribute).length,
      0,
    );
    if (possible > 0) return { attribute, goal: Math.min(WEEKLY_QUEST_MAX_GOAL, possible) };
  }
  return null;
}

export function weeklyProgress(habits: Habit[], log: CompletionLog, plan: WeeklyPlan, monday: IsoDate, upTo: IsoDate) {
  return daysBetween(monday, upTo).reduce(
    (sum, iso) =>
      sum + dueOn(habits, iso).filter((h) => h.attribute === plan.attribute && isDone(h, log, iso)).length,
    0,
  );
}

export function questsFor(habits: Habit[], log: CompletionLog, today: IsoDate): Quest[] {
  const quests: Quest[] = [];

  const monday = weekStart(today);
  const plan = weeklyPlan(habits, monday);
  if (plan) {
    quests.push({
      id: `week-${monday}`,
      title: EXPEDITION[plan.attribute],
      description: `Finish ${plan.goal} ${ATTRIBUTE_LABEL[plan.attribute]} ${plan.goal === 1 ? "habit" : "habits"} this week`,
      progress: Math.min(plan.goal, weeklyProgress(habits, log, plan, monday, today)),
      goal: plan.goal,
      rewardXp: WEEKLY_QUEST_REWARD,
      daysLeft: 7 - weekdayOf(today),
    });
  }

  const due = dueOn(habits, today);
  if (due.length > 0) {
    quests.push({
      id: `day-${today}`,
      title: "First light",
      description: "Finish every habit due today",
      progress: due.filter((h) => isDone(h, log, today)).length,
      goal: due.length,
      rewardXp: DAILY_QUEST_REWARD,
    });
  }

  return quests;
}
