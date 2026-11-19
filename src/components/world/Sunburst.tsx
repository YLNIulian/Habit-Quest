import { useEffect } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";

type Props = { size: number; color: string; rays?: number; style?: StyleProp<ViewStyle> };

/** Poster-style rays turning slowly behind a celebration. */
export function Sunburst({ size, color, rays = 14, style }: Props) {
  const reduced = useReducedMotion();
  const turn = useSharedValue(0);

  useEffect(() => {
    if (reduced) return;
    turn.set(withRepeat(withTiming(1, { duration: 48000, easing: Easing.linear }), -1, false));
  }, [turn, reduced]);

  const spin = useAnimatedStyle(() => ({ transform: [{ rotate: `${turn.get() * 360}deg` }] }));

  // Each ray is a thin wedge from the centre to the edge.
  const step = (Math.PI * 2) / rays;
  const wedges = Array.from({ length: rays }, (_, i) => {
    const a = i * step;
    const b = a + step * 0.42;
    const p = (angle: number) => `${50 + Math.cos(angle) * 50} ${50 + Math.sin(angle) * 50}`;
    return `M50 50 L${p(a)} L${p(b)} Z`;
  }).join(" ");

  return (
    <Animated.View style={[{ width: size, height: size, pointerEvents: "none" }, style, spin]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Path d={wedges} fill={color} />
      </Svg>
    </Animated.View>
  );
}
