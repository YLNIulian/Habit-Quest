import { useEffect, useState } from "react";
import { AppState } from "react-native";

import { todayIso } from "@/lib/dates";
import type { IsoDate } from "@/types";

// today's date, updates after midnight or when the app is opened again
export function useToday(): IsoDate {
  const [today, setToday] = useState(todayIso);

  useEffect(() => {
    const check = () => setToday(todayIso());
    const timer = setInterval(check, 60_000);
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") check();
    });
    return () => {
      clearInterval(timer);
      sub.remove();
    };
  }, []);

  return today;
}
