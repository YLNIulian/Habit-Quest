import { View } from "react-native";

import { Glyph, type GlyphName } from "@/components/icons/Glyph";
import { AppText } from "@/components/ui/AppText";
import { alpha, radius } from "@/theme/tokens";
import { useTheme } from "@/theme/useTheme";

type Props = { icon: GlyphName; value: string; label: string; color: string };

/** Small status readout that floats over the sky. */
export function StatPill({ icon, value, label, color }: Props) {
  const { c } = useTheme();
  return (
    <View
      accessible
      accessibilityLabel={`${label} ${value}`}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        height: 34,
        paddingLeft: 10,
        paddingRight: 12,
        borderRadius: radius.pill,
        backgroundColor: alpha(c.bg, 0.55),
        borderWidth: 1,
        borderColor: c.border,
      }}
    >
      <Glyph name={icon} size={16} color={color} strokeWidth={2.2} />
      <AppText variant="figure" style={{ fontSize: 20, lineHeight: 22 }}>
        {value}
      </AppText>
    </View>
  );
}
