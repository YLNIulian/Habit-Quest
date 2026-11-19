import { useEffect } from "react";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";

import { nimColors, springs } from "@/theme/tokens";

/** The fire Nim lights when the day's route is done. Springs up, then flickers. */
export function Campfire({ size = 34 }: { size?: number }) {
  const reduced = useReducedMotion();
  const lit = useSharedValue(reduced ? 1 : 0);
  const flicker = useSharedValue(0);

  useEffect(() => {
    if (reduced) return;
    lit.set(withSpring(1, springs.burst));
    flicker.set(withRepeat(withTiming(1, { duration: 420, easing: Easing.inOut(Easing.sin) }), -1, true));
  }, [lit, flicker, reduced]);

  const flame = useAnimatedStyle(() => ({
    transform: [{ scaleX: lit.get() * (1 - 0.08 * flicker.get()) }, { scaleY: lit.get() * (1 + 0.12 * flicker.get()) }],
  }));

  return (
    <Animated.View style={{ width: size, height: size }}>
      <Animated.View style={[{ position: "absolute", transformOrigin: "50% 88%" }, flame]}>
        <Svg width={size} height={size} viewBox="0 0 34 34">
          <Path d="M17 3 C18 10 26 13 26 21 A9 9 0 0 1 8 21 C8 16 12 15 13 10 C15 12 16 9 17 3 Z" fill="#F0452F" />
          <Path d="M17 14 C18 18 22 19 22 23.5 A5 5 0 0 1 12 23.5 C12 21 14 20 15 17.5 C16 18.5 16.6 17 17 14 Z" fill={nimColors.lamp} />
        </Svg>
      </Animated.View>
      <Svg width={size} height={size} viewBox="0 0 34 34" style={{ position: "absolute" }}>
        <Path d="M6 31 L28 27 M6 27 L28 31" stroke={nimColors.ink} strokeWidth={3.4} strokeLinecap="round" />
      </Svg>
    </Animated.View>
  );
}
