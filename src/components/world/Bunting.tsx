import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSpring,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";

import { springs } from "@/theme/tokens";
import { useTheme } from "@/theme/useTheme";

const SAG = 34;
const TOP = 6;
const FLAG_W = 26;
const FLAG_H = 32;

/** A line of pennants in the three blaze colours, unfurling one by one. */
export function Bunting({ width, count = 9 }: { width: number; count?: number }) {
  const { c } = useTheme();
  const colors = [c.blaze.red, c.blaze.yellow, c.blaze.blue];
  // The string is a quadratic curve; pennants hang from points along it.
  const yAt = (t: number) => (1 - t) * (1 - t) * TOP + 2 * (1 - t) * t * (TOP + SAG * 2) + t * t * TOP;

  return (
    <View style={{ width, height: TOP + SAG + FLAG_H + 8, pointerEvents: "none" }}>
      <Svg width={width} height={TOP + SAG + 8} style={{ position: "absolute" }}>
        <Path
          d={`M0 ${TOP} Q ${width / 2} ${TOP + SAG * 2} ${width} ${TOP}`}
          stroke={c.textMuted}
          strokeWidth={1.4}
          fill="none"
        />
      </Svg>
      {Array.from({ length: count }, (_, i) => {
        const t = (i + 0.5) / count;
        return (
          <Pennant
            key={i}
            index={i}
            color={colors[i % colors.length]}
            left={t * width - FLAG_W / 2}
            top={yAt(t) - 1}
          />
        );
      })}
    </View>
  );
}

function Pennant({ index, color, left, top }: { index: number; color: string; left: number; top: number }) {
  const reduced = useReducedMotion();
  const open = useSharedValue(reduced ? 1 : 0);

  useEffect(() => {
    if (reduced) return;
    open.set(withDelay(120 + index * 45, withSpring(1, springs.burst)));
  }, [open, index, reduced]);

  const style = useAnimatedStyle(() => ({
    opacity: Math.min(Math.max(open.get() * 2, 0), 1),
    transform: [{ scaleY: open.get() }, { rotate: `${(1 - open.get()) * 18}deg` }],
  }));

  return (
    <Animated.View style={[{ position: "absolute", left, top, transformOrigin: "50% 0%" }, style]}>
      <Svg width={FLAG_W} height={FLAG_H} viewBox="0 0 26 32">
        <Path d="M1 0 L25 0 L13 31 Z" fill={color} />
      </Svg>
    </Animated.View>
  );
}
