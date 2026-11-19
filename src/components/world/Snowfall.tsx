import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";

type Props = { width: number; height: number; count: number; color: string; wind?: number };

function rand(seed: number) {
  const x = Math.sin(seed * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/** Falling snow. One looping shared value drives every flake on the UI thread. */
export function Snowfall({ width, height, count, color, wind = 40 }: Props) {
  const t = useSharedValue(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    t.set(0);
    t.set(withRepeat(withTiming(1, { duration: 9000, easing: Easing.linear }), -1, false));
  }, [t, reduced]);

  return (
    <View style={{ position: "absolute", left: 0, top: 0, width, height, overflow: "hidden", pointerEvents: "none" }}>
      {Array.from({ length: count }, (_, i) => (
        <Flake key={i} t={t} index={i} width={width} height={height} color={color} wind={wind} />
      ))}
    </View>
  );
}

type FlakeProps = { t: SharedValue<number>; index: number; width: number; height: number; color: string; wind: number };

function Flake({ t, index, width, height, color, wind }: FlakeProps) {
  const startX = rand(index + 1) * (width + wind) - wind;
  const phase = rand(index + 31);
  // Whole-number speeds keep the loop seamless.
  const speed = 1 + (index % 3);
  const size = 2 + (index % 3);

  const style = useAnimatedStyle(() => {
    const fall = (phase + t.get() * speed) % 1;
    return {
      transform: [{ translateX: startX + fall * wind }, { translateY: fall * (height + 8) - 8 }],
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          opacity: 0.45 + 0.18 * (index % 4),
        },
        style,
      ]}
    />
  );
}
