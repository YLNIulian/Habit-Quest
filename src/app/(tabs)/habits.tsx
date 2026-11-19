import { router } from "expo-router";
import { View } from "react-native";

import { Blaze } from "@/components/blaze/Blaze";
import { Glyph } from "@/components/icons/Glyph";
import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { PressableScale } from "@/components/ui/PressableScale";
import { Screen } from "@/components/ui/Screen";
import { HABITS, lastWeek } from "@/data/mock";
import { ATTRIBUTE_LABEL, frequencyLabel } from "@/lib/habits";
import { spacing } from "@/theme/tokens";
import { useTheme } from "@/theme/useTheme";
import type { Habit } from "@/types";

export default function HabitsScreen() {
  const { c } = useTheme();
  return (
    <Screen>
      <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" }}>
        <View>
          <AppText variant="title">Habits</AppText>
          <AppText variant="label" color={c.textMuted} style={{ marginTop: 2 }}>
            {HABITS.length} markers on your route
          </AppText>
        </View>
        <Button label="Add habit" size="sm" onPress={() => router.push("/habit-form")} />
      </View>

      <View style={{ marginTop: spacing.lg }}>
        {HABITS.map((habit, i) => (
          <HabitRow key={habit.id} habit={habit} last={i === HABITS.length - 1} />
        ))}
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.lg, marginTop: spacing.xl }}>
        <Legend kind="done" label="Done" />
        <Legend kind="missed" label="Missed" />
        <Legend kind="rest" label="Not due" />
        <AppText variant="caption" color={c.textMuted} style={{ flex: 1, textAlign: "right" }}>
          Last 7 days
        </AppText>
      </View>
    </Screen>
  );
}

type DayKind = "done" | "missed" | "rest";

function DayDot({ kind }: { kind: DayKind }) {
  const { c } = useTheme();
  if (kind === "rest") {
    return (
      <View style={{ width: 9, height: 9, alignItems: "center", justifyContent: "center" }}>
        <View style={{ width: 3, height: 3, borderRadius: 1.5, backgroundColor: c.textMuted, opacity: 0.6 }} />
      </View>
    );
  }
  return (
    <View
      style={{
        width: 9,
        height: 9,
        borderRadius: 4.5,
        backgroundColor: kind === "done" ? c.accent : "transparent",
        borderWidth: kind === "done" ? 0 : 1.5,
        borderColor: c.cold,
      }}
    />
  );
}

function Legend({ kind, label }: { kind: DayKind; label: string }) {
  const { c } = useTheme();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      <DayDot kind={kind} />
      <AppText variant="caption" color={c.textMuted}>
        {label}
      </AppText>
    </View>
  );
}

function HabitRow({ habit, last }: { habit: Habit; last: boolean }) {
  const { c } = useTheme();
  const week = lastWeek(habit);
  return (
    <PressableScale
      pressedScale={0.98}
      accessibilityRole="button"
      accessibilityLabel={`Edit ${habit.name}`}
      onPress={() => router.push({ pathname: "/habit-form", params: { id: habit.id } })}
      contentStyle={{
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.lg,
        paddingVertical: spacing.lg,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: c.border,
      }}
    >
      <Blaze shape={habit.shape} color={habit.color} size={46} />
      <View style={{ flex: 1 }}>
        <AppText variant="bodyStrong" numberOfLines={1}>
          {habit.name}
        </AppText>
        <AppText variant="label" color={c.textMuted} style={{ marginTop: 2 }}>
          {frequencyLabel(habit.frequency)}
          {habit.targetPerDay > 1 ? `, ${habit.targetPerDay} a day` : ""}
        </AppText>
      </View>
      <View style={{ alignItems: "flex-end", gap: 8 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
          <Glyph name={habit.attribute} size={13} color={c.textMuted} strokeWidth={2.2} />
          <AppText variant="caption" color={c.textMuted}>
            {ATTRIBUTE_LABEL[habit.attribute]}
          </AppText>
        </View>
        <View style={{ flexDirection: "row", gap: 4 }}>
          {week.map((kind, i) => (
            <DayDot key={i} kind={kind} />
          ))}
        </View>
      </View>
    </PressableScale>
  );
}
