import dayjs from "dayjs";
import { View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { weekdayOf } from "@/lib/dates";
import { WEEKDAY_INITIAL } from "@/lib/habits";
import { alpha, spacing } from "@/theme/tokens";
import { useTheme } from "@/theme/useTheme";

const GAP = 4;
const LABEL_WIDTH = 18;

type Props = {
  /** Total width available. */
  width: number;
  weeks?: number;
  /** 0..1 for a date, or null when nothing was due. */
  ratioFor: (iso: string) => number | null;
};

/** Calendar heatmap: one column per week (Mon–Sun), brighter ember = more runes lit. */
export function Heatmap({ width, weeks = 12, ratioFor }: Props) {
  const { c } = useTheme();
  const today = dayjs().startOf("day");
  const firstMonday = today.subtract(weekdayOf(today), "day").subtract(weeks - 1, "week");
  const cell = Math.floor((width - LABEL_WIDTH - GAP * weeks) / weeks);

  const fill = (ratio: number | null) => {
    if (ratio === null || ratio === 0) return c.track;
    if (ratio < 0.4) return alpha(c.accent, 0.3);
    if (ratio < 0.7) return alpha(c.accent, 0.55);
    if (ratio < 1) return alpha(c.accent, 0.8);
    return c.accent;
  };

  const columns = Array.from({ length: weeks }, (_, w) => {
    const monday = firstMonday.add(w, "week");
    // Label a column when a new month starts inside it.
    const prev = monday.subtract(1, "week");
    const monthLabel = w === 0 || monday.month() !== prev.month() ? monday.format("MMM") : "";
    return { monday, monthLabel };
  });

  return (
    <View accessible accessibilityLabel={`Habit history for the last ${weeks} weeks`}>
      <View style={{ flexDirection: "row", marginLeft: LABEL_WIDTH + GAP, marginBottom: spacing.sm }}>
        {columns.map(({ monday, monthLabel }) => (
          <View key={monday.valueOf()} style={{ width: cell + GAP }}>
            {/* Wider than its column on purpose: month names overflow to the right. */}
            <AppText variant="caption" color={c.textMuted} numberOfLines={1} style={{ width: 40 }}>
              {monthLabel}
            </AppText>
          </View>
        ))}
      </View>

      <View style={{ flexDirection: "row" }}>
        <View style={{ width: LABEL_WIDTH, gap: GAP }}>
          {WEEKDAY_INITIAL.map((d, i) => (
            <View key={i} style={{ height: cell, justifyContent: "center" }}>
              <AppText variant="caption" color={c.textMuted}>
                {i % 2 === 0 ? d : ""}
              </AppText>
            </View>
          ))}
        </View>

        {columns.map(({ monday }) => (
          <View key={monday.valueOf()} style={{ marginLeft: GAP, gap: GAP }}>
            {Array.from({ length: 7 }, (_, d) => {
              const date = monday.add(d, "day");
              const future = date.isAfter(today);
              const isToday = date.isSame(today, "day");
              return (
                <View
                  key={d}
                  style={{
                    width: cell,
                    height: cell,
                    borderRadius: 6,
                    backgroundColor: future ? "transparent" : fill(ratioFor(date.format("YYYY-MM-DD"))),
                    borderWidth: isToday ? 1.5 : 0,
                    borderColor: c.text,
                  }}
                />
              );
            })}
          </View>
        ))}
      </View>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: GAP,
          marginTop: spacing.md,
        }}
      >
        <AppText variant="caption" color={c.textMuted} style={{ marginRight: spacing.xs }}>
          Less
        </AppText>
        {[0, 0.3, 0.6, 0.9, 1].map((r) => (
          <View key={r} style={{ width: 12, height: 12, borderRadius: 4, backgroundColor: fill(r) }} />
        ))}
        <AppText variant="caption" color={c.textMuted} style={{ marginLeft: spacing.xs }}>
          More
        </AppText>
      </View>
    </View>
  );
}
