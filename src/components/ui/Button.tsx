import type { StyleProp, ViewStyle } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { PressableScale } from "@/components/ui/PressableScale";
import { radius, spacing } from "@/theme/tokens";
import { useTheme } from "@/theme/useTheme";

type Props = {
  label: string;
  onPress: () => void;
  variant?: "primary" | "ghost";
  size?: "md" | "sm";
  style?: StyleProp<ViewStyle>;
};

export function Button({ label, onPress, variant = "primary", size = "md", style }: Props) {
  const { c } = useTheme();
  const primary = variant === "primary";
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      style={style}
      contentStyle={{
        height: size === "md" ? 52 : 44,
        paddingHorizontal: size === "md" ? spacing.xl : spacing.lg,
        borderRadius: radius.pill,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: primary ? c.accent : "transparent",
        borderWidth: primary ? 0 : 1,
        borderColor: c.border,
      }}
    >
      <AppText variant={size === "md" ? "bodyStrong" : "label"} color={primary ? c.onAccent : c.text}>
        {label}
      </AppText>
    </PressableScale>
  );
}
