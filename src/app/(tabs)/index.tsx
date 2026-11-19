import dayjs from "dayjs";
import { useState } from "react";
import { View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CampProgress } from "@/components/today/CampProgress";
import { HabitStep } from "@/components/today/HabitStep";
import { QuestCard } from "@/components/today/QuestCard";
import { StatPill } from "@/components/today/StatPill";
import { WeatherNote } from "@/components/today/WeatherNote";
import { AppText } from "@/components/ui/AppText";
import { Screen } from "@/components/ui/Screen";
import { MountainScene } from "@/components/world/MountainScene";
import {
  HABITS,
  PLAYER,
  QUESTS,
  TODAY_ISO,
  WARMTH_BY_WEATHER,
  XP_PER_HABIT,
  countOn,
} from "@/data/mock";
import { tierForLevel } from "@/lib/gear";
import { isDueOn } from "@/lib/habits";
import { useCountUp } from "@/lib/useCountUp";
import { INITIAL_DONE_COUNT, useUi } from "@/store/ui";
import { layout, spacing } from "@/theme/tokens";
import { useTheme } from "@/theme/useTheme";

export default function TodayScreen() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { width: winW } = useWindowDimensions();
  const width = Math.min(winW, layout.maxWidth);
  const done = useUi((s) => s.done);
  const toggleDone = useUi((s) => s.toggleDone);
  const level = useUi((s) => s.level);
  const weather = useUi((s) => s.weather);
  const [hop, setHop] = useState(0);

  const today = dayjs();
  const due = HABITS.filter((h) => isDueOn(h, today));
  const remaining = due.filter((h) => !done[h.id]).length;

  // Mock XP: each finished habit is 15 m. Real rules replace this later.
  const gained = (Object.values(done).filter(Boolean).length - INITIAL_DONE_COUNT) * XP_PER_HABIT;
  const xp = Math.min(Math.max(PLAYER.xp + gained, 0), PLAYER.xpToNext);
  const altitude = useCountUp(PLAYER.totalXp + (xp - PLAYER.xp));
  const warmth = WARMTH_BY_WEATHER[weather];
  const missed = HABITS.find((h) => h.id === PLAYER.missedHabitId)?.name;

  const heading =
    due.length === 0
      ? "Rest day"
      : remaining === 0
        ? "Today's route is done"
        : `${remaining} ${remaining === 1 ? "step" : "steps"} left today`;

  return (
    <Screen bleed>
      <MountainScene
        width={width}
        weather={weather}
        tier={tierForLevel(level)}
        hop={hop}
        fire={due.length > 0 && remaining === 0}
        topInset={insets.top}
      >
        <View
          style={{
            position: "absolute",
            top: insets.top + spacing.md,
            left: layout.screenPadding,
            right: layout.screenPadding,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <View accessible accessibilityLabel={`Camp ${level}, ${altitude} metres`}>
            <AppText variant="heading">Camp {level}</AppText>
            <View style={{ flexDirection: "row", alignItems: "baseline", gap: 6 }}>
              <AppText variant="numeral">{altitude.toLocaleString("en-US")}</AppText>
              <AppText variant="figure">m</AppText>
            </View>
          </View>
          <View style={{ gap: spacing.sm, alignItems: "flex-end" }}>
            <StatPill
              icon="flame"
              label="Warmth"
              value={`${warmth}`}
              color={weather === "storm" ? c.cold : c.sun}
            />
            <StatPill icon="flag" label="Day streak" value={`${PLAYER.streakDays}`} color={c.accent} />
          </View>
        </View>
      </MountainScene>

      <View style={{ paddingHorizontal: layout.screenPadding }}>
        <CampProgress level={level} xp={xp} xpToNext={PLAYER.xpToNext} />

        {weather !== "clear" && (
          <View style={{ marginTop: spacing.xl }}>
            <WeatherNote weather={weather} missedHabit={missed} />
          </View>
        )}

        <View style={{ marginTop: spacing.xxl, marginBottom: spacing.sm }}>
          <AppText variant="title">{heading}</AppText>
          <AppText variant="label" color={c.textMuted} style={{ marginTop: 2 }}>
            {today.format("dddd, D MMMM")}
          </AppText>
        </View>

        {due.length === 0 ? (
          <AppText color={c.textMuted} style={{ marginTop: spacing.md }}>
            Nothing is due. Nim is keeping the fire going until tomorrow.
          </AppText>
        ) : (
          due.map((habit, i) => (
            <HabitStep
              key={habit.id}
              habit={habit}
              count={countOn(habit.id, TODAY_ISO)}
              done={!!done[habit.id]}
              reward={XP_PER_HABIT}
              hasNext={i < due.length - 1}
              nextDone={i < due.length - 1 && !!done[due[i + 1].id]}
              onToggle={() => {
                if (!done[habit.id]) setHop((h) => h + 1);
                toggleDone(habit.id);
              }}
            />
          ))
        )}

        <AppText variant="title" style={{ marginTop: spacing.xxl, marginBottom: spacing.md }}>
          Quests
        </AppText>
        <View style={{ gap: spacing.md }}>
          {QUESTS.map((quest) => (
            <QuestCard key={quest.id} quest={quest} />
          ))}
        </View>
      </View>
    </Screen>
  );
}
