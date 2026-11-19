import { View } from "react-native";

import { Glyph, type GlyphName } from "@/components/icons/Glyph";
import { AppText } from "@/components/ui/AppText";
import { alpha, blazePlate, nimColors, radius, spacing } from "@/theme/tokens";
import { useTheme } from "@/theme/useTheme";
import type { BlazeColor } from "@/types";

type Props = {
  value: number;
  label: string;
  icon: GlyphName;
  color: BlazeColor;
  // slight tilt so it looks painted by hand
  tilt?: number;
};

// a number painted on a white trail plate
export function StreakMarker({ value, label, icon, color, tilt = 0 }: Props) {
  const { c, shadow } = useTheme();
  const paint = c.blaze[color];
  return (
    <View
      accessible
      accessibilityLabel={`${label}: ${value} ${value === 1 ? "day" : "days"}`}
      style={{
        flex: 1,
        backgroundColor: blazePlate,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: alpha(nimColors.ink, 0.1),
        overflow: "hidden",
        transform: [{ rotate: `${tilt}deg` }],
        boxShadow: shadow.card,
      }}
    >
      <View style={{ height: 10, backgroundColor: paint }} />
      <View style={{ padding: spacing.md, paddingTop: spacing.sm }}>
        <View style={{ flexDirection: "row", alignItems: "baseline", gap: 4 }}>
          <AppText variant="numeral" color={nimColors.ink} style={{ fontSize: 56, lineHeight: 56 }}>
            {value}
          </AppText>
          <AppText variant="figure" color={alpha(nimColors.ink, 0.6)}>
            {value === 1 ? "day" : "days"}
          </AppText>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginTop: 2 }}>
          <Glyph name={icon} size={13} color={paint} strokeWidth={2.4} />
          <AppText variant="caption" color={alpha(nimColors.ink, 0.7)}>
            {label}
          </AppText>
        </View>
      </View>
    </View>
  );
}
