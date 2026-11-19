import type { StyleProp, ViewStyle } from "react-native";
import Svg, { Ellipse } from "react-native-svg";

type Props = { size: number; color: string; rings?: number; style?: StyleProp<ViewStyle> };

/** Map contour lines: the app's quiet texture. Decorative only. */
export function Contours({ size, color, rings = 7, style }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" style={[{ pointerEvents: "none" }, style]}>
      {Array.from({ length: rings }, (_, i) => {
        const step = i + 1;
        // Each ring drifts and turns a little, like real terrain.
        const cx = 54 - i * 1.4;
        const cy = 46 + i * 1.1;
        return (
          <Ellipse
            key={i}
            cx={cx}
            cy={cy}
            rx={step * 7.2}
            ry={step * 5.4 + (i % 2) * 1.5}
            transform={`rotate(${-24 + i * 5} ${cx} ${cy})`}
            stroke={color}
            strokeWidth={0.7}
            fill="none"
          />
        );
      })}
    </Svg>
  );
}
