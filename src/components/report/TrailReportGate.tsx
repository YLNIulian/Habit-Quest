import { router } from "expo-router";
import { useEffect, useRef } from "react";

import { trailReport } from "@/game/trailReport";
import { useToday } from "@/hooks/useToday";
import { addDays } from "@/lib/dates";
import { useHabitStore } from "@/store/useHabitStore";

// opens the trail report when a new day starts and something was missed
export function TrailReportGate() {
  const ready = useHabitStore((s) => s.ready);
  const settledThrough = useHabitStore((s) => s.settledThrough);
  const today = useToday();
  const opened = useRef<string | null>(null);

  useEffect(() => {
    if (!ready || !settledThrough) return;
    const yesterday = addDays(today, -1);
    if (settledThrough >= yesterday) return;

    const { habits, log, settleThrough } = useHabitStore.getState();
    const report = trailReport(habits, log, today, settledThrough);
    // nothing missed: close the days quietly
    if (!report) {
      settleThrough(yesterday);
      return;
    }

    const key = `${today}|${settledThrough}`;
    if (opened.current === key) return;
    const timer = setTimeout(() => {
      opened.current = key;
      router.push("/trail-report");
    }, 50);
    return () => clearTimeout(timer);
  }, [ready, settledThrough, today]);

  return null;
}
