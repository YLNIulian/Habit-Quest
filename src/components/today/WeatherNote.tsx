import { View } from "react-native";

import { Glyph } from "@/components/icons/Glyph";
import { AppText } from "@/components/ui/AppText";
import { radius, spacing } from "@/theme/tokens";
import { useTheme } from "@/theme/useTheme";
import type { Weather } from "@/types";

type Props = {
  weather: Weather;
  missedHabits: string[];
  // "yesterday", "on Monday"...
  when?: string;
  warmthLost: number;
};

/** The consequence of a missed habit, stated plainly. No guilt. */
export function WeatherNote({ weather, missedHabits, when = "yesterday", warmthLost }: Props) {
  const { c } = useTheme();
  if (weather === "clear") return null;

  const storm = weather === "storm";
  const title = storm ? "Blizzard" : "Cold wind";
  const what =
    missedHabits.length === 0
      ? "a habit"
      : missedHabits.length === 1
        ? missedHabits[0]
        : `${missedHabits.length} habits`;
  const body = storm
    ? `You skipped ${what} ${when} and lost ${warmthLost} warmth. Finish one habit to relight the fire.`
    : `You skipped ${what} ${when} and lost ${warmthLost} warmth.`;

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
