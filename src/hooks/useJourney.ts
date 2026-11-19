import { useMemo } from "react";

import { simulateJourney, type Journey } from "@/game/journey";
import { campFromXp } from "@/game/levels";
import { useToday } from "@/hooks/useToday";
import { useHabitStore } from "@/store/useHabitStore";
import { useUi } from "@/store/ui";

export function useJourney(): Journey {
  const habits = useHabitStore((s) => s.habits);
  const log = useHabitStore((s) => s.log);
  const weatherPreview = useUi((s) => s.weatherPreview);
  const devBonusXp = useUi((s) => s.devBonusXp);
  const today = useToday();

  return useMemo(() => {
    const journey = simulateJourney(habits, log, today);
    if (!weatherPreview && !devBonusXp) return journey;

    // dev tools preview
    const player = { ...journey.player };
    if (weatherPreview) player.weather = weatherPreview;
    if (devBonusXp) {
      player.totalXp += devBonusXp;
      Object.assign(player, campFromXp(player.totalXp));
    }
    return { ...journey, player };
  }, [habits, log, today, weatherPreview, devBonusXp]);
}
