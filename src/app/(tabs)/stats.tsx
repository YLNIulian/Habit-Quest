import { useState } from "react";
import { View, useWindowDimensions } from "react-native";

import { AttributeRow } from "@/components/stats/AttributeRow";
import { GearShelf } from "@/components/stats/GearShelf";
import { Heatmap } from "@/components/stats/Heatmap";
import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Screen } from "@/components/ui/Screen";
import { dayRatio } from "@/game/history";
import { useJourney } from "@/hooks/useJourney";
import { useHabitStore } from "@/store/useHabitStore";
import { useUi } from "@/store/ui";
import { layout, radius, spacing, type Scheme } from "@/theme/tokens";
import { useTheme } from "@/theme/useTheme";
import type { Weather } from "@/types";

const APPEARANCE: { label: string; value: Scheme | null }[] = [
  { label: "System", value: null },
  { label: "Night", value: "dark" },
  { label: "Day", value: "light" },
];

const WEATHER: { label: string; value: Weather | null }[] = [
  { label: "Real", value: null },
  { label: "Clear", value: "clear" },
  { label: "Cold wind", value: "wind" },
  { label: "Blizzard", value: "storm" },
];

export default function StatsScreen() {
  const { c } = useTheme();
  const { width } = useWindowDimensions();
  const { player, attributes } = useJourney();
  const habits = useHabitStore((s) => s.habits);
  const log = useHabitStore((s) => s.log);
  const themeOverride = useUi((s) => s.themeOverride);
  const setThemeOverride = useUi((s) => s.setThemeOverride);
  const contentWidth = Math.min(width, layout.maxWidth) - layout.screenPadding * 2;

  return (
    <Screen>
      <AppText variant="title">Logbook</AppText>

      {/* The one number that matters, then the two that explain it. */}
      <View style={{ flexDirection: "row", alignItems: "baseline", gap: 6, marginTop: spacing.md }}>
        <AppText variant="numeral">{player.totalXp.toLocaleString("en-US")}</AppText>
        <AppText variant="figure">m climbed</AppText>
      </View>
      <View style={{ flexDirection: "row", marginTop: spacing.lg }}>
        <Figure value={String(player.level)} label="Camp" color={c.sunText} />
        <Figure value={String(player.streakDays)} label="Day streak" color={c.accent} />
        <Figure value={String(player.bestStreakDays)} label="Longest streak" />
      </View>

      <Section title="Attributes">
        {attributes.map((stat) => (
          <AttributeRow key={stat.attribute} stat={stat} />
        ))}
      </Section>

      <Section title="Last 12 weeks">
        <View style={{ marginTop: spacing.sm }}>
          <Heatmap width={contentWidth} weeks={12} ratioFor={(iso) => dayRatio(habits, log, iso)} />
        </View>
      </Section>

      <Section title="Gear">
        <View style={{ marginTop: spacing.md }}>
          <GearShelf level={player.level} />
        </View>
      </Section>

      <Section title="Appearance">
        <View
          accessibilityRole="radiogroup"
          style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginTop: spacing.md }}
        >
          {APPEARANCE.map((option) => (
            <Chip
              key={option.label}
              label={option.label}
              selected={themeOverride === option.value}
              onPress={() => setThemeOverride(option.value)}
            />
          ))}
        </View>
      </Section>

      {__DEV__ && <DevTools realTotalXp={player.totalXp} best={player.bestStreakDays} />}
    </Screen>
  );
}

// only shows in development builds
function DevTools({ realTotalXp, best }: { realTotalXp: number; best: number }) {
  const { c } = useTheme();
  const weatherPreview = useUi((s) => s.weatherPreview);
  const setWeatherPreview = useUi((s) => s.setWeatherPreview);
  const devBonusXp = useUi((s) => s.devBonusXp);
  const previewCamp = useUi((s) => s.previewCamp);
  const previewRecord = useUi((s) => s.previewRecord);
  const resetPreview = useUi((s) => s.resetPreview);
  const loadDemo = useHabitStore((s) => s.loadDemo);
  const clearAll = useHabitStore((s) => s.clearAll);
  const [confirmClear, setConfirmClear] = useState(false);

  return (
    <View
      style={{
        marginTop: spacing.xxxl,
        padding: spacing.lg,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: c.border,
        borderStyle: "dashed",
        gap: spacing.md,
      }}
    >
      <View>
        <AppText variant="heading">Dev tools</AppText>
        <AppText variant="caption" color={c.textMuted}>
          Only visible in development.
        </AppText>
      </View>
      <View accessibilityRole="radiogroup" style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
        {WEATHER.map((option) => (
          <Chip
            key={option.label}
            label={option.label}
            selected={weatherPreview === option.value}
            onPress={() => setWeatherPreview(option.value)}
          />
        ))}
      </View>
      <View style={{ flexDirection: "row", gap: spacing.sm }}>
        <Button label="Next camp" variant="ghost" size="sm" onPress={() => previewCamp(realTotalXp - devBonusXp)} style={{ flex: 1 }} />
        <Button label="Streak record" variant="ghost" size="sm" onPress={() => previewRecord(best)} style={{ flex: 1 }} />
      </View>
      {(devBonusXp > 0 || weatherPreview) && (
        <Button label={`Back to real data${devBonusXp > 0 ? ` (+${devBonusXp} m)` : ""}`} variant="ghost" size="sm" onPress={resetPreview} />
      )}
      <View style={{ flexDirection: "row", gap: spacing.sm }}>
        <Button label="Load demo data" variant="ghost" size="sm" onPress={() => loadDemo()} style={{ flex: 1 }} />
        <Button
          label={confirmClear ? "Sure? Tap again" : "Clear all data"}
          variant="ghost"
          size="sm"
          style={{ flex: 1 }}
          onPress={() => {
            if (!confirmClear) {
              setConfirmClear(true);
              return;
            }
            setConfirmClear(false);
            clearAll();
          }}
        />
      </View>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ marginTop: spacing.xxl }}>
      <AppText variant="heading">{title}</AppText>
      {children}
    </View>
  );
}

type FigureProps = { value: string; label: string; color?: string };

function Figure({ value, label, color }: FigureProps) {
  const { c } = useTheme();
  return (
    <View style={{ flex: 1 }}>
      <AppText variant="title" color={color}>
        {value}
      </AppText>
      <AppText variant="caption" color={c.textMuted}>
        {label}
      </AppText>
    </View>
  );
}
