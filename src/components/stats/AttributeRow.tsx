import { View } from "react-native";

import { Glyph } from "@/components/icons/Glyph";
import { AppText } from "@/components/ui/AppText";
import { ATTRIBUTE_HINT, ATTRIBUTE_LABEL } from "@/lib/habits";
import { spacing } from "@/theme/tokens";
import { useTheme } from "@/theme/useTheme";
import type { AttributeStat } from "@/types";

/** One RPG attribute: what it is, its level, and progress to the next. */
export function AttributeRow({ stat }: { stat: AttributeStat }) {
  const { c } = useTheme();
  return (
    <View
      accessible
      accessibilityLabel={`${ATTRIBUTE_LABEL[stat.attribute]} level ${stat.level}`}
      style={{ flexDirection: "row", alignItems: "center", gap: spacing.md, paddingVertical: spacing.md }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: c.surface,
        }}
      >
        <Glyph name={stat.attribute} size={20} color={c.text} />
      </View>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" }}>
          <AppText variant="bodyStrong">{ATTRIBUTE_LABEL[stat.attribute]}</AppText>
          <AppText variant="caption" color={c.textMuted}>
            {ATTRIBUTE_HINT[stat.attribute]}
          </AppText>
        </View>
        <View style={{ height: 6, borderRadius: 3, backgroundColor: c.track, marginTop: 8 }}>
          <View
            style={{
              width: `${Math.round(stat.progress * 100)}%`,
              height: 6,
              borderRadius: 3,
              backgroundColor: c.accent,
            }}
          />
        </View>
      </View>
      <AppText variant="figure" style={{ width: 34, textAlign: "right" }}>
        {stat.level}
      </AppText>
    </View>
  );
}
