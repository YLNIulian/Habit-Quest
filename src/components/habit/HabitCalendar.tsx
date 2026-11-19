import { useState } from "react";
import { Pressable, View } from "react-native";

import { Glyph } from "@/components/icons/Glyph";
import { AppText } from "@/components/ui/AppText";
import { countOn, isScheduled } from "@/game/history";
import { EDIT_DAYS_BACK } from "@/game/rules";
import { addDays, daysBetween, fromIso, toIso, weekdayOf } from "@/lib/dates";
import { WEEKDAY_INITIAL } from "@/lib/habits";
import { haptic } from "@/lib/haptics";
import { spacing } from "@/theme/tokens";
import { useTheme } from "@/theme/useTheme";
import type { CompletionLog, Habit, IsoDate } from "@/types";

type Props = {
  habit: Habit;
  log: CompletionLog;
  today: IsoDate;
  onToggleDay: (iso: IsoDate, done: boolean) => void;
};

type CellKind = "out" | "rest" | "done" | "partial" | "missed" | "today";

function monthStart(iso: IsoDate): IsoDate {
  return `${iso.slice(0, 7)}-01`;
}

function addMonths(month: IsoDate, n: number): IsoDate {
  return toIso(fromIso(month).add(n, "month"));
}

export function HabitCalendar({ habit, log, today, onToggleDay }: Props) {
  const { c } = useTheme();
  const [month, setMonth] = useState(monthStart(today));

  const firstMonth = monthStart(habit.createdAt);
  const canGoBack = month > firstMonth;
  const canGoForward = month < monthStart(today);
  const editableFrom = addDays(today, -EDIT_DAYS_BACK);

  const days = daysBetween(month, addDays(addMonths(month, 1), -1));
  const blanks = weekdayOf(month);

  const kindOf = (iso: IsoDate): CellKind => {
    if (iso > today || iso < habit.createdAt) return "out";
    if (!isScheduled(habit, iso)) return "rest";
    const count = countOn(log, habit.id, iso);
    if (count >= habit.targetPerDay) return "done";
    if (count > 0) return "partial";
    return iso === today ? "today" : "missed";
  };

  const changeMonth = (n: number) => {
    haptic.select();
    setMonth((m) => addMonths(m, n));
  };

  return (
    <View>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <NavButton icon="back" label="Previous month" disabled={!canGoBack} onPress={() => changeMonth(-1)} />
        <AppText variant="heading">{fromIso(month).format("MMMM YYYY")}</AppText>
        <NavButton icon="next" label="Next month" disabled={!canGoForward} onPress={() => changeMonth(1)} />
      </View>

      <View style={{ flexDirection: "row", marginTop: spacing.md }}>
        {WEEKDAY_INITIAL.map((d, i) => (
          <View key={i} style={{ width: `${100 / 7}%`, alignItems: "center" }}>
            <AppText variant="caption" color={c.textMuted}>
              {d}
            </AppText>
          </View>
        ))}
      </View>

      <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: spacing.xs }}>
        {Array.from({ length: blanks }, (_, i) => (
          <View key={`blank-${i}`} style={{ width: `${100 / 7}%` }} />
        ))}
        {days.map((iso) => {
          const kind = kindOf(iso);
          const editable = kind !== "out" && kind !== "rest" && iso >= editableFrom;
          const done = kind === "done";
          return (
            <View key={iso} style={{ width: `${100 / 7}%`, padding: 3 }}>
              <Pressable
                disabled={!editable}
                onPress={() => {
                  if (done) haptic.tap();
                  else haptic.step();
                  onToggleDay(iso, !done);
                }}
                accessibilityRole={editable ? "checkbox" : undefined}
                accessibilityState={editable ? { checked: done } : undefined}
                accessibilityLabel={`${fromIso(iso).format("D MMMM")}, ${kind === "out" ? "not tracked" : kind}`}
                style={({ pressed }) => ({
                  aspectRatio: 1,
                  borderRadius: 10,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: done ? c.accent : kind === "partial" ? c.accentSoft : "transparent",
                  borderWidth: kind === "missed" || kind === "today" ? 1.5 : 0,
                  borderColor: kind === "today" ? c.text : c.cold,
                  opacity: pressed ? 0.6 : 1,
                })}
              >
                <AppText
                  variant="label"
                  color={
                    done
                      ? c.onAccent
                      : kind === "out" || kind === "rest"
                        ? c.textMuted
                        : c.text
                  }
                  style={{ opacity: kind === "out" ? 0.35 : 1 }}
                >
                  {fromIso(iso).date()}
                </AppText>
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
}

type NavProps = { icon: "back" | "next"; label: string; disabled: boolean; onPress: () => void };

function NavButton({ icon, label, disabled, onPress }: NavProps) {
  const { c } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={{
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: c.surface,
        opacity: disabled ? 0.35 : 1,
      }}
    >
      <Glyph name={icon} size={20} color={c.text} strokeWidth={2.4} />
    </Pressable>
  );
}
