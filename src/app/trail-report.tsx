import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { BackHandler, ScrollView, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Blaze } from "@/components/blaze/Blaze";
import { Glyph } from "@/components/icons/Glyph";
import { TentScene } from "@/components/report/TentScene";
import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { PressableScale } from "@/components/ui/PressableScale";
import { tierForLevel } from "@/game/gear";
import { isDone } from "@/game/history";
import { simulateJourney } from "@/game/journey";
import { trailReport } from "@/game/trailReport";
import { useToday } from "@/hooks/useToday";
import { addDays, fromIso } from "@/lib/dates";
import { ATTRIBUTE_LABEL } from "@/lib/habits";
import { haptic } from "@/lib/haptics";
import { useHabitStore } from "@/store/useHabitStore";
import { useWardrobeStore } from "@/store/useWardrobeStore";
import { layout, radius, spacing } from "@/theme/tokens";
import { useTheme } from "@/theme/useTheme";
import type { Habit } from "@/types";

export default function TrailReportScreen() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { width: winW } = useWindowDimensions();
  const width = Math.min(winW, layout.maxWidth);

  const today = useToday();
  const yesterday = addDays(today, -1);
  const habits = useHabitStore((s) => s.habits);
  const log = useHabitStore((s) => s.log);
  const settledThrough = useHabitStore((s) => s.settledThrough);
  const setDayDone = useHabitStore((s) => s.setDayDone);
  const settleThrough = useHabitStore((s) => s.settleThrough);
  const look = useWardrobeStore((s) => s.look);
  const [starting, setStarting] = useState(false);

  const live = useMemo(() => trailReport(habits, log, today, settledThrough), [habits, log, today, settledThrough]);
  // keep the list as it was when the screen opened, so ticked habits don't jump away
  const [report, setReport] = useState(live);
  const listed = (report?.missedYesterday ?? [])
    .map((h) => habits.find((x) => x.id === h.id))
    .filter((h): h is Habit => !!h);

  // habits were reloaded (new ids): start from the fresh report
  if (listed.length === 0 && live && live.missedYesterday.length > 0 && report !== live) setReport(live);

  // what pressing the button will cost
  const { now, after } = useMemo(
    () => ({
      now: simulateJourney(habits, log, today, settledThrough).player,
      after: simulateJourney(habits, log, today, yesterday).player,
    }),
    [habits, log, today, settledThrough, yesterday],
  );
  const warmthLost = Math.max(0, now.hp - after.hp);
  const retreat = after.retreats > now.retreats;

  // must press the button to leave
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => true);
    return () => sub.remove();
  }, []);

  const start = async () => {
    if (starting) return;
    setStarting(true);
    haptic.success();
    await settleThrough(yesterday);
    if (router.canGoBack()) router.back();
    else router.replace("/");
  };

  const doneBefore = (report?.dueYesterday.length ?? 0) - listed.length;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.bg }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        width: "100%",
        maxWidth: layout.maxWidth,
        alignSelf: "center",
        paddingBottom: insets.bottom + spacing.xxl,
      }}
    >
      <View style={{ paddingTop: insets.top, backgroundColor: c.scene.skyTop }}>
        <TentScene width={width} tier={tierForLevel(now.level)} look={look} cold={after.weather === "storm"} />
      </View>

      <View style={{ paddingHorizontal: layout.screenPadding }}>
        <AppText variant="title" style={{ marginTop: spacing.lg }}>
          Good morning
        </AppText>
        <AppText variant="label" color={c.textMuted} style={{ marginTop: 2 }}>
          Trail report for {fromIso(yesterday).format("dddd, D MMMM")}
        </AppText>

        {listed.length > 0 && (
          <>
            <AppText style={{ marginTop: spacing.lg }}>
              {doneBefore > 0 ? `You finished ${doneBefore} of ${report?.dueYesterday.length} yesterday. ` : ""}
              These were still open when the day ended. Did any of them after all? Tick them now.
            </AppText>

            <View style={{ marginTop: spacing.md }}>
              {listed.map((habit, i) => (
                <MissedRow
                  key={habit.id}
                  habit={habit}
                  done={isDone(habit, log, yesterday)}
                  last={i === listed.length - 1}
                  onToggle={(done) => {
                    if (done) haptic.step();
                    else haptic.tap();
                    setDayDone(habit.id, yesterday, done);
                  }}
                />
              ))}
            </View>
          </>
        )}

        {report && report.olderDays.length > 0 && (
          <AppText variant="label" color={c.textMuted} style={{ marginTop: spacing.lg }}>
            You were away for {report.olderDays.length} more {report.olderDays.length === 1 ? "day" : "days"} before
            that
            {report.olderMisses > 0
              ? `, with ${report.olderMisses} ${report.olderMisses === 1 ? "habit" : "habits"} left open. They count too.`
              : ". Nothing was missed there."}
          </AppText>
        )}

        <Outcome warmthLost={warmthLost} weather={after.weather} retreat={retreat} />

        <Button
          label={starting ? "Starting..." : "Start the day"}
          onPress={start}
          style={{ marginTop: spacing.xl }}
        />
      </View>
    </ScrollView>
  );
}

type RowProps = { habit: Habit; done: boolean; last: boolean; onToggle: (done: boolean) => void };

function MissedRow({ habit, done, last, onToggle }: RowProps) {
  const { c } = useTheme();
  return (
    <PressableScale
      pressedScale={0.98}
      onPress={() => onToggle(!done)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: done }}
      accessibilityLabel={`${habit.name}, ${done ? "done" : "not done"}`}
      contentStyle={{
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.lg,
        paddingVertical: spacing.md,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: c.border,
      }}
    >
      <Blaze shape={habit.shape} color={habit.color} size={40} />
      <View style={{ flex: 1 }}>
        <AppText variant="bodyStrong" numberOfLines={1} style={{ opacity: done ? 0.6 : 1 }}>
          {habit.name}
        </AppText>
        <AppText variant="caption" color={c.textMuted}>
          {ATTRIBUTE_LABEL[habit.attribute]}
          {habit.targetPerDay > 1 ? `, ${habit.targetPerDay} times` : ""}
        </AppText>
      </View>
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: done ? c.accent : "transparent",
          borderWidth: done ? 0 : 2,
          borderColor: c.track,
        }}
      >
        {done && <Glyph name="check" size={22} color={c.onAccent} strokeWidth={2.8} />}
      </View>
    </PressableScale>
  );
}

type OutcomeProps = { warmthLost: number; weather: string; retreat: boolean };

function Outcome({ warmthLost, weather, retreat }: OutcomeProps) {
  const { c } = useTheme();
  const clear = warmthLost === 0 && !retreat;
  const weatherText = weather === "storm" ? "a blizzard" : weather === "wind" ? "a cold wind" : "clear skies";

  let text: string;
  if (clear) text = "Everything is accounted for. Clear skies ahead.";
  else if (retreat) text = "Nim runs out of warmth and heads back to the start of this camp to warm up.";
  else text = `Starting now costs ${warmthLost} warmth and brings ${weatherText}.`;

  return (
    <View
      accessibilityRole="summary"
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
        marginTop: spacing.xl,
        padding: spacing.md,
        paddingRight: spacing.lg,
        borderRadius: radius.md,
        backgroundColor: clear ? c.accentSoft : c.coldSoft,
      }}
    >
      <Glyph name={clear ? "flame" : weather === "storm" ? "snow" : "wind"} size={22} color={clear ? c.sunText : c.cold} />
      <AppText variant="label" style={{ flex: 1 }}>
        {text}
      </AppText>
    </View>
  );
}
