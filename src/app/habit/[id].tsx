import { router, useLocalSearchParams } from "expo-router";
import { useEffect, type ReactNode } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Blaze } from "@/components/blaze/Blaze";
import { HabitCalendar } from "@/components/habit/HabitCalendar";
import { StreakMarker } from "@/components/habit/StreakMarker";
import { Glyph } from "@/components/icons/Glyph";
import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { XP_PER_HABIT, EDIT_DAYS_BACK } from "@/game/rules";
import { habitStreak, successRate } from "@/game/streaks";
import { useToday } from "@/hooks/useToday";
import { fromIso } from "@/lib/dates";
import { ATTRIBUTE_LABEL, frequencyLabel } from "@/lib/habits";
import { useHabitStore } from "@/store/useHabitStore";
import { layout, spacing } from "@/theme/tokens";
import { useTheme } from "@/theme/useTheme";

export default function HabitDetailScreen() {
  const { c, shadow } = useTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string | string[] }>();
  const habitId = Array.isArray(id) ? id[0] : id;
  const habit = useHabitStore((s) => s.habits.find((h) => h.id === habitId));
  const log = useHabitStore((s) => s.log);
  const setDayDone = useHabitStore((s) => s.setDayDone);
  const today = useToday();

  // habit was deleted from the edit screen
  useEffect(() => {
    if (!habit && router.canGoBack()) router.back();
  }, [habit]);

  if (!habit) return null;

  const streak = habitStreak(habit, log, today);
  const rate = successRate(streak);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.bg }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        width: "100%",
        maxWidth: layout.maxWidth,
        alignSelf: "center",
        paddingTop: insets.top + spacing.sm,
        paddingHorizontal: layout.screenPadding,
        paddingBottom: insets.bottom + spacing.xxl,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Back"
          style={{ width: 44, height: 44, justifyContent: "center" }}
        >
          <Glyph name="back" size={24} color={c.text} strokeWidth={2.4} />
        </Pressable>
        <Button
          label="Edit"
          variant="ghost"
          size="sm"
          onPress={() => router.push({ pathname: "/habit-form", params: { id: habit.id } })}
        />
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.lg, marginTop: spacing.md }}>
        <Blaze
          shape={habit.shape}
          color={habit.color}
          size={76}
          style={{ transform: [{ rotate: "-4deg" }], boxShadow: shadow.card }}
        />
        <View style={{ flex: 1 }}>
          <AppText variant="title" numberOfLines={2}>
            {habit.name}
          </AppText>
          <AppText variant="label" color={c.textMuted} style={{ marginTop: 4 }}>
            {frequencyLabel(habit.frequency)}
            {habit.targetPerDay > 1 ? `, ${habit.targetPerDay} a day` : ""}
          </AppText>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 }}>
            <Glyph name={habit.attribute} size={14} color={c.textMuted} strokeWidth={2.2} />
            <AppText variant="label" color={c.textMuted}>
              Trains {ATTRIBUTE_LABEL[habit.attribute]}
            </AppText>
          </View>
        </View>
      </View>

      <View style={{ flexDirection: "row", gap: spacing.md, marginTop: spacing.xl }}>
        <StreakMarker value={streak.current} label="Current streak" icon="flag" color={habit.color} tilt={-1.5} />
        <StreakMarker value={streak.best} label="Best streak" icon="pennant" color="yellow" tilt={1.5} />
      </View>

      <View style={{ flexDirection: "row", marginTop: spacing.xl }}>
        <Figure value={String(streak.totalDone)} label="Times done" />
        <Figure value={rate === null ? "–" : `${Math.round(rate * 100)}%`} label="Success rate" />
        <Figure value={`${(streak.totalDone * XP_PER_HABIT).toLocaleString("en-US")} m`} label="Climbed with it" />
      </View>

      <Section title="History">
        <View style={{ marginTop: spacing.md }}>
          <HabitCalendar
            habit={habit}
            log={log}
            today={today}
            onToggleDay={(iso, done) => setDayDone(habit.id, iso, done)}
          />
        </View>
        <AppText variant="caption" color={c.textMuted} style={{ marginTop: spacing.md }}>
          Forgot to check it? Tap any day from the last {EDIT_DAYS_BACK} days to fix it.
        </AppText>
        <AppText variant="caption" color={c.textMuted} style={{ marginTop: spacing.xs }}>
          On the route since {fromIso(habit.createdAt).format("D MMMM YYYY")}.
        </AppText>
      </Section>
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={{ marginTop: spacing.xxl }}>
      <AppText variant="heading">{title}</AppText>
      {children}
    </View>
  );
}

function Figure({ value, label }: { value: string; label: string }) {
  const { c } = useTheme();
  return (
    <View style={{ flex: 1 }}>
      <AppText variant="title">{value}</AppText>
      <AppText variant="caption" color={c.textMuted}>
        {label}
      </AppText>
    </View>
  );
}
