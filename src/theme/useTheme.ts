import { useColorScheme } from "react-native";

import { useUi } from "@/store/ui";
import { palette, shadows, type Scheme } from "@/theme/tokens";

/** Resolved theme. Dark-first: anything that is not explicitly light is dark. */
export function useTheme() {
  const system = useColorScheme();
  const override = useUi((s) => s.themeOverride);
  const scheme: Scheme = override ?? (system === "light" ? "light" : "dark");
  return { scheme, c: palette[scheme], shadow: shadows[scheme] };
}
