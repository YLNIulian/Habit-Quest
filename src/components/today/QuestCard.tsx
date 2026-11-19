import { View } from "react-native";

import { Glyph } from "@/components/icons/Glyph";
import { AppText } from "@/components/ui/AppText";
import { Contours } from "@/components/world/Contours";
import { radius, spacing } from "@/theme/tokens";
import { useTheme } from "@/theme/useTheme";
import type { Quest } from "@/types";

/** A named stretch of the route with a reward at the end. */
export function QuestCard({ quest }: { quest: Quest }) {
  const { c, shadow } = useTheme();
  return (
    <View
      accessible
      accessibilityLabel={`Quest: ${quest.title}. ${quest.description}. ${quest.progress} of ${quest.goal}. Reward ${quest.rewardXp} metres.`}
      style={{
        backgroundColor: c.surface,
        borderRadius: radius.lg,
        padding: spacing.lg,
        overflow: "hidden",
        boxShadow: shadow.card,
      }}
    >
      <Contours size={190} color={c.border} style={{ position: "absolute", right: -60, top: -70 }} />

      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: spacing.md }}>
        <View style={{ flex: 1 }}>
          <AppText variant="heading">{quest.title}</AppText>
          <AppText variant="label" color={c.textMuted} style={{ marginTop: 2 }}>
            {quest.description}
          </AppText>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <AppText variant="figure" color={c.sunText}>
            +{quest.rewardXp} m
          </AppText>
        </View>
      </View>

      {/* One segment per step of the quest. */}
      <View style={{ flexDirection: "row", gap: 5, marginTop: spacing.lg }}>
        {Array.from({ length: quest.goal }, (_, i) => (
          <View
            key={i}
            style={{
              flex: 1,
              height: 8,
              borderRadius: 4,
              backgroundColor: i < quest.progress ? c.accent : c.track,
            }}
          />
        ))}
      </View>

      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: spacing.md }}>
        <AppText variant="caption" color={c.textMuted}>
          {quest.progress} of {quest.goal} done
        </AppText>
        {quest.daysLeft !== undefined && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
            <Glyph name="flag" size={13} color={c.textMuted} strokeWidth={2.2} />
            <AppText variant="caption" color={c.textMuted}>
              {quest.daysLeft === 1 ? "Last day" : `${quest.daysLeft} days left`}
            </AppText>
          </View>
        )}
      </View>
    </View>
  );
}
