import { BigShoulders_700Bold } from "@expo-google-fonts/big-shoulders/700Bold";
import { BigShoulders_900Black } from "@expo-google-fonts/big-shoulders/900Black";
import { InstrumentSans_400Regular } from "@expo-google-fonts/instrument-sans/400Regular";
import { InstrumentSans_500Medium } from "@expo-google-fonts/instrument-sans/500Medium";
import { InstrumentSans_600SemiBold } from "@expo-google-fonts/instrument-sans/600SemiBold";
import { useFonts } from "expo-font";
import { useEffect, useState } from "react";

import { initDatabase } from "@/database/db";
import { useHabitStore } from "@/store/useHabitStore";
import { useUi } from "@/store/ui";

// fonts + database + saved data
export function useAppReady(): { ready: boolean; error: Error | null } {
  const [fontsLoaded, fontError] = useFonts({
    BigShoulders_700Bold,
    BigShoulders_900Black,
    InstrumentSans_400Regular,
    InstrumentSans_500Medium,
    InstrumentSans_600SemiBold,
  });
  const [dataReady, setDataReady] = useState(false);
  const [dbError, setDbError] = useState<Error | null>(null);

  useEffect(() => {
    initDatabase()
      .then(() => Promise.all([useHabitStore.getState().load(), useUi.getState().loadSettings()]))
      .then(() => setDataReady(true))
      .catch((e: unknown) => setDbError(e instanceof Error ? e : new Error(String(e))));
  }, []);

  // if fonts fail the app still works with system fonts
  const fontsDone = fontsLoaded || !!fontError;
  return { ready: fontsDone && dataReady, error: dbError };
}
