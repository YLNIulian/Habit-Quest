import { router } from "expo-router";
import { useState } from "react";
import { View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CampProgress } from "@/components/today/CampProgress";
import { HabitStep } from "@/components/today/HabitStep";
import { QuestCard } from "@/components/today/QuestCard";
import { StatPill } from "@/components/today/StatPill";
import { WeatherNote } from "@/components/today/WeatherNote";
import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { MountainScene } from "@/components/world/MountainScene";
import { tierForLevel } from "@/game/gear";
import { countOn, dueOn, isDone } from "@/game/history";
import { XP_PER_HABIT } from "@/game/rules";
import { useCoins } from "@/hooks/useCoins";
import { useCountUp } from "@/hooks/useCountUp";
import { useJourney } from "@/hooks/useJourney";
import { useToday } from "@/hooks/useToday";
import { fromIso, relativeDayLabel } from "@/lib/dates";
import { useHabitStore } from "@/store/useHabitStore";
import { useWardrobeStore } from "@/store/useWardrobeStore";
import { layout, spacing } from "@/theme/tokens";
import { useTheme } from "@/theme/useTheme";

export default function TodayScreen() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { width: winW } = useWindowDimensions();
  const width = Math.min(winW, layout.maxWidth);
  const [hop, setHop] = useState(0);

  const today = useToday();
  const habits = useHabitStore((s) => s.habits);
  const log = useHabitStore((s) => s.log);
  const checkIn = useHabitStore((s) => s.checkIn);
  const checkOut = useHabitStore((s) => s.checkOut);
  const { player, quests } = useJourney();
  const { balance } = useCoins();
  const look = useWardrobeStore((s) => s.look);

  const due = dueOn(habits, today);
  const doneCount = due.filter((h) => isDone(h, log, today)).length;
  const remaining = due.length - doneCount;
  const altitude = useCountUp(player.totalXp);
  const missed = player.missedHabitIds
    .map((id) => habits.find((h) => h.id === id)?.name)
    .filter((name): name is string => !!name);

  const heading =
    habits.length === 0
      ? "Your route is empty"
      : due.length === 0
        ? "Rest day"
        : remaining === 0
          ? "Today's route is done"
          : `${remaining} ${remaining === 1 ? "step" : "steps"} left today`;

  return (
    <Screen bleed>
      <MountainScene
        width={width}
        weather={player.weather}
        tier={tierForLevel(player.level)}
        look={look}
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
          <View accessible accessibilityLabel={`Camp ${player.level}, ${altitude} metres`}>
            <AppText variant="heading">Camp {player.level}</AppText>
            <View style={{ flexDirection: "row", alignItems: "baseline", gap: 6 }}>
              <AppText variant="numeral">{altitude.toLocaleString("en-US")}</AppText>
              <AppText variant="figure">m</AppText>
            </View>
          </View>
          <View style={{ gap: spacing.sm, alignItems: "flex-end" }}>
            <StatPill
              icon="flame"
              label="Warmth"
              value={`${player.hp}`}
              color={player.weather === "storm" ? c.cold : c.sun}
            />
            <StatPill icon="flag" label="Day streak" value={`${player.streakDays}`} color={c.accent} />
            <StatPill icon="coin" label="Coins" value={`${balance}`} color={c.sunText} />
          </View>
        </View>
      </MountainScene>

      <View style={{ paddingHorizontal: layout.screenPadding }}>
        <CampProgress level={player.level} xp={player.xp} xpToNext={player.xpToNext} />

        {player.weather !== "clear" && (
          <View style={{ marginTop: spacing.xl }}>
            <WeatherNote
              weather={player.weather}
              missedHabits={missed}
              when={player.missedOn ? relativeDayLabel(player.missedOn, today) : undefined}
              warmthLost={player.warmthLost}
            />
          </View>
        )}

        <View style={{ marginTop: spacing.xxl, marginBottom: spacing.sm }}>
          <AppText variant="title">{heading}</AppText>
          <AppText variant="label" color={c.textMuted} style={{ marginTop: 2 }}>
            {due.length > 0 ? `${doneCount} of ${due.length} done · ` : ""}
            {fromIso(today).format("dddd, D MMMM")}
          </AppText>
        </View>

        {habits.length === 0 ? (
          <View style={{ marginTop: spacing.md, gap: spacing.lg }}>
            <AppText color={c.textMuted}>
              Add a habit and it becomes a marker on Nim&apos;s trail. Every one you finish is a few metres higher.
            </AppText>
            <Button label="Add your first habit" onPress={() => router.push("/habit-form")} />
          </View>
        ) : due.length === 0 ? (
          <AppText color={c.textMuted} style={{ marginTop: spacing.md }}>
            Nothing is due. Nim is keeping the fire going until tomorrow.
          </AppText>
        ) : (
          due.map((habit, i) => (
            <HabitStep
              key={habit.id}
              habit={habit}
              count={countOn(log, habit.id, today)}
              done={isDone(habit, log, today)}
              reward={XP_PER_HABIT}
              hasNext={i < due.length - 1}
              nextDone={i < due.length - 1 && isDone(due[i + 1], log, today)}
              onToggle={() => {
                if (!isDone(habit, log, today)) setHop((h) => h + 1);
                checkIn(habit.id, today);
              }}
              onUndoOne={() => checkOut(habit.id, today)}
            />
          ))
        )}

        {quests.length > 0 && (
          <>
            <AppText variant="title" style={{ marginTop: spacing.xxl, marginBottom: spacing.md }}>
              Quests
            </AppText>
            <View style={{ gap: spacing.md }}>
              {quests.map((quest) => (
                <QuestCard key={quest.id} quest={quest} />
              ))}
            </View>
          </>
        )}
      </View>
    </Screen>
  );
}
