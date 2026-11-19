import { View } from "react-native";

import { Glyph } from "@/components/icons/Glyph";
import { AppText } from "@/components/ui/AppText";
import { radius, spacing } from "@/theme/tokens";
import { useTheme } from "@/theme/useTheme";
import type { Weather } from "@/types";

type Props = { weather: Weather; missedHabit?: string };

/** The consequence of a missed habit, stated plainly. No guilt. */
export function WeatherNote({ weather, missedHabit }: Props) {
  const { c } = useTheme();
  if (weather === "clear") return null;

  const storm = weather === "storm";
  const title = storm ? "Blizzard" : "Cold wind";
  const body = storm
    ? "Two days missed in a row. Finish one habit to relight the fire."
    : `You skipped ${missedHabit ?? "a habit"} yesterday and lost 4 warmth.`;

  return (
    <View
      accessibilityRole="alert"
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
        padding: spacing.md,
        paddingRight: spacing.lg,
        borderRadius: radius.md,
        backgroundColor: c.coldSoft,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: c.coldSoft,
        }}
      >
        <Glyph name={storm ? "snow" : "wind"} size={20} color={c.cold} />
      </View>
      <View style={{ flex: 1 }}>
        <AppText variant="label" color={c.cold} style={{ fontFamily: "InstrumentSans_600SemiBold" }}>
          {title}
        </AppText>
        <AppText variant="label" color={c.text} style={{ marginTop: 1 }}>
          {body}
        </AppText>
      </View>
    </View>
  );
}
