import { router } from "expo-router";
import { View } from "react-native";

import { Blaze } from "@/components/blaze/Blaze";
import { Glyph } from "@/components/icons/Glyph";
import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { PressableScale } from "@/components/ui/PressableScale";
import { Screen } from "@/components/ui/Screen";
import { recentDays, type DayMark } from "@/game/history";
import { useToday } from "@/hooks/useToday";
import { ATTRIBUTE_LABEL, frequencyLabel } from "@/lib/habits";
import { useHabitStore } from "@/store/useHabitStore";
import { spacing } from "@/theme/tokens";
import { useTheme } from "@/theme/useTheme";
import type { CompletionLog, Habit, IsoDate } from "@/types";

export default function HabitsScreen() {
  const { c } = useTheme();
  const habits = useHabitStore((s) => s.habits);
  const log = useHabitStore((s) => s.log);
  const today = useToday();

  return (
    <Screen>
      <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" }}>
        <View>
          <AppText variant="title">Habits</AppText>
          <AppText variant="label" color={c.textMuted} style={{ marginTop: 2 }}>
            {habits.length === 1 ? "1 marker on your route" : `${habits.length} markers on your route`}
          </AppText>
        </View>
        <Button label="Add habit" size="sm" onPress={() => router.push("/habit-form")} />
      </View>

      {habits.length === 0 ? (
        <View style={{ marginTop: spacing.xxl, alignItems: "center", gap: spacing.md }}>
          <Blaze shape="band" color="red" size={64} style={{ transform: [{ rotate: "-4deg" }] }} />
          <AppText variant="heading" style={{ textAlign: "center" }}>
            No markers yet
          </AppText>
          <AppText color={c.textMuted} style={{ textAlign: "center" }}>
            Each habit gets its own trail marker. Add one to start climbing.
          </AppText>
        </View>
      ) : (
        <>
          <View style={{ marginTop: spacing.lg }}>
            {habits.map((habit, i) => (
              <HabitRow key={habit.id} habit={habit} log={log} today={today} last={i === habits.length - 1} />
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
        </>
      )}
    </Screen>
  );
}

function DayDot({ kind }: { kind: DayMark }) {
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
        borderColor: kind === "today" ? c.textMuted : c.cold,
      }}
    />
  );
}

function Legend({ kind, label }: { kind: DayMark; label: string }) {
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

type RowProps = { habit: Habit; log: CompletionLog; today: IsoDate; last: boolean };

function HabitRow({ habit, log, today, last }: RowProps) {
  const { c } = useTheme();
  const week = recentDays(habit, log, today);
  return (
    <PressableScale
      pressedScale={0.98}
      accessibilityRole="button"
      accessibilityLabel={`Open ${habit.name}`}
      onPress={() => router.push({ pathname: "/habit/[id]", params: { id: habit.id } })}
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
