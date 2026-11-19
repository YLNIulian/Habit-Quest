import { Text, type TextProps } from "react-native";

import { type as typeScale, type TypeVariant } from "@/theme/tokens";
import { useTheme } from "@/theme/useTheme";

type Props = TextProps & {
  variant?: TypeVariant;
  /** Any colour from the theme; defaults to primary text. */
  color?: string;
};

export function AppText({ variant = "body", color, style, ...rest }: Props) {
  const { c } = useTheme();
  return <Text {...rest} style={[typeScale[variant], { color: color ?? c.text }, style]} />;
}
