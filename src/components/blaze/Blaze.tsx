import { View, type StyleProp, type ViewStyle } from "react-native";
import Svg, { Circle, Path, Rect } from "react-native-svg";

import { alpha, blazePlate, nimColors } from "@/theme/tokens";
import { useTheme } from "@/theme/useTheme";
import type { BlazeColor, BlazeShape } from "@/types";

export const BLAZE_SHAPES: BlazeShape[] = ["band", "cross", "triangle", "dot", "diamond"];
export const BLAZE_COLORS: BlazeColor[] = ["red", "yellow", "blue"];

type Props = {
  shape: BlazeShape;
  color: BlazeColor;
  size?: number;
  style?: StyleProp<ViewStyle>;
};

/** A habit's icon: a trail marker painted on a white plate, like the ones on mountain paths. */
export function Blaze({ shape, color, size = 44, style }: Props) {
  const { c } = useTheme();
  const paint = c.blaze[color];
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size * 0.27,
          backgroundColor: blazePlate,
          borderWidth: 1,
          borderColor: alpha(nimColors.ink, 0.1),
          overflow: "hidden",
        },
        style,
      ]}
    >
      <Svg width={size - 2} height={size - 2} viewBox="0 0 24 24">
        {shape === "band" && <Rect x={8.25} y={0} width={7.5} height={24} fill={paint} />}
        {shape === "cross" && (
          <>
            <Rect x={9.75} y={4.5} width={4.5} height={15} rx={0.6} fill={paint} />
            <Rect x={4.5} y={9.75} width={15} height={4.5} rx={0.6} fill={paint} />
          </>
        )}
        {shape === "triangle" && (
          <Path d="M12 5 L19.6 18 L4.4 18 Z" fill={paint} stroke={paint} strokeWidth={1} strokeLinejoin="round" />
        )}
        {shape === "dot" && <Circle cx={12} cy={12} r={6.2} fill={paint} />}
        {shape === "diamond" && (
          <Path d="M12 4.6 L19.4 12 L12 19.4 L4.6 12 Z" fill={paint} stroke={paint} strokeWidth={1} strokeLinejoin="round" />
        )}
      </Svg>
    </View>
  );
}
