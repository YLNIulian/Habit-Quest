import { View } from "react-native";

import { Glyph } from "@/components/icons/Glyph";
import { AppText } from "@/components/ui/AppText";
import { radius } from "@/theme/tokens";
import { useTheme } from "@/theme/useTheme";

type Props = { amount: number; size?: "sm" | "md" };

export function CoinBadge({ amount, size = "md" }: Props) {
  const { c } = useTheme();
  const small = size === "sm";
  return (
    <View
      accessible
      accessibilityLabel={`${amount} coins`}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: small ? 3 : 6,
        paddingHorizontal: small ? 0 : 12,
        height: small ? undefined : 36,
        borderRadius: radius.pill,
        backgroundColor: small ? "transparent" : c.surface,
      }}
    >
      <Glyph name="coin" size={small ? 13 : 18} color={c.sunText} strokeWidth={2.4} />
      <AppText variant="figure" color={c.sunText} style={small ? { fontSize: 16, lineHeight: 18 } : undefined}>
        {amount.toLocaleString("en-US")}
      </AppText>
    </View>
  );
}
