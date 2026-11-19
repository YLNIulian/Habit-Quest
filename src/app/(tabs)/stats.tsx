import { View, useWindowDimensions } from "react-native";

import { AttributeRow } from "@/components/stats/AttributeRow";
import { GearShelf } from "@/components/stats/GearShelf";
import { Heatmap } from "@/components/stats/Heatmap";
import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Screen } from "@/components/ui/Screen";
import { ATTRIBUTES, PLAYER, dayRatio } from "@/data/mock";
import { useUi } from "@/store/ui";
import { layout, radius, spacing, type Scheme } from "@/theme/tokens";
import { useTheme } from "@/theme/useTheme";
import type { Weather } from "@/types";

const APPEARANCE: { label: string; value: Scheme | null }[] = [
  { label: "System", value: null },
  { label: "Night", value: "dark" },
  { label: "Day", value: "light" },
];

const WEATHER: { label: string; value: Weather }[] = [
  { label: "Clear", value: "clear" },
  { label: "Cold wind", value: "wind" },
  { label: "Blizzard", value: "storm" },
];

export default function StatsScreen() {
  const { c } = useTheme();
  const { width } = useWindowDimensions();
  const level = useUi((s) => s.level);
  const themeOverride = useUi((s) => s.themeOverride);
  const setThemeOverride = useUi((s) => s.setThemeOverride);
  const weather = useUi((s) => s.weather);
  const setWeather = useUi((s) => s.setWeather);
  const previewCamp = useUi((s) => s.previewCamp);
  const previewRecord = useUi((s) => s.previewRecord);
  const contentWidth = Math.min(width, layout.maxWidth) - layout.screenPadding * 2;

  return (
    <Screen>
      <AppText variant="title">Logbook</AppText>

      {/* The one number that matters, then the two that explain it. */}
      <View style={{ flexDirection: "row", alignItems: "baseline", gap: 6, marginTop: spacing.md }}>
        <AppText variant="numeral">{PLAYER.totalXp.toLocaleString("en-US")}</AppText>
        <AppText variant="figure">m climbed</AppText>
      </View>
      <View style={{ flexDirection: "row", marginTop: spacing.lg }}>
        <Figure value={String(level)} label="Camp" color={c.sunText} />
        <Figure value={String(PLAYER.streakDays)} label="Day streak" color={c.accent} />
        <Figure value={String(PLAYER.bestStreakDays)} label="Longest streak" />
      </View>

      <Section title="Attributes">
        {ATTRIBUTES.map((stat) => (
          <AttributeRow key={stat.attribute} stat={stat} />
        ))}
      </Section>

      <Section title="Last 12 weeks">
        <View style={{ marginTop: spacing.sm }}>
          <Heatmap width={contentWidth} weeks={12} ratioFor={dayRatio} />
        </View>
      </Section>

      <Section title="Gear">
        <View style={{ marginTop: spacing.md }}>
          <GearShelf level={level} />
        </View>
      </Section>

      {/* Demo controls. Everything in this box is for previewing states, not part of the app. */}
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
          <AppText variant="heading">Preview tools</AppText>
          <AppText variant="caption" color={c.textMuted}>
            For the demo only. Not part of the final app.
          </AppText>
        </View>
        <View accessibilityRole="radiogroup" style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
          {APPEARANCE.map((option) => (
            <Chip
              key={option.label}
              label={option.label}
              selected={themeOverride === option.value}
              onPress={() => setThemeOverride(option.value)}
            />
          ))}
        </View>
        <View accessibilityRole="radiogroup" style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
          {WEATHER.map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              selected={weather === option.value}
              onPress={() => setWeather(option.value)}
            />
          ))}
        </View>
        <View style={{ flexDirection: "row", gap: spacing.sm }}>
          <Button label="Next camp" variant="ghost" size="sm" onPress={previewCamp} style={{ flex: 1 }} />
          <Button label="Streak record" variant="ghost" size="sm" onPress={previewRecord} style={{ flex: 1 }} />
        </View>
      </View>
    </Screen>
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
