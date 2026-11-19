import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";

type Props = {
  /** Bump this number to fire. 0 = never fired. */
  trigger: number;
  /** Pieces cycle through these colours. */
  colors: string[];
  count?: number;
  distance?: number;
  size?: number;
  /** How far pieces fall back down at the end, in px. */
  gravity?: number;
  duration?: number;
};

/** Confetti thrown from the centre of the parent. One shared value drives every piece. */
export function Burst({ trigger, colors, count = 8, distance = 40, size = 5, gravity = 0, duration = 700 }: Props) {
  const t = useSharedValue(1);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (trigger === 0 || reduced) return;
    t.set(0);
    t.set(withTiming(1, { duration, easing: Easing.out(Easing.cubic) }));
  }, [t, trigger, reduced, duration]);

  return (
    <View style={{ position: "absolute", left: "50%", top: "50%", pointerEvents: "none" }}>
      {Array.from({ length: count }, (_, i) => (
        <Piece
          key={i}
          t={t}
          index={i}
          count={count}
          color={colors[i % colors.length]}
          distance={distance}
          size={size}
          gravity={gravity}
        />
      ))}
    </View>
  );
}

type PieceProps = {
  t: SharedValue<number>;
  index: number;
  count: number;
  color: string;
  distance: number;
  size: number;
  gravity: number;
};

function Piece({ t, index, count, color, distance, size, gravity }: PieceProps) {
  // Deterministic variety: alternate angle offsets, reach, and shape.
  const angle = (index / count) * Math.PI * 2 + (index % 2 ? 0.3 : 0);
  const reach = distance * (0.6 + 0.4 * (((index * 37) % 10) / 10));
  const side = index % 3 === 0 ? size * 1.5 : size;
  const round = index % 2 === 0;

  const style = useAnimatedStyle(() => {
    const v = t.get();
    return {
      opacity: v >= 1 ? 0 : 1 - v * v * v,
      transform: [
        { translateX: Math.cos(angle) * reach * v },
        { translateY: Math.sin(angle) * reach * v + gravity * v * v },
        { rotate: `${v * (index % 2 ? 220 : -160)}deg` },
        { scale: 1 - 0.4 * v },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: side,
          height: side,
          marginLeft: -side / 2,
          marginTop: -side / 2,
          borderRadius: round ? side / 2 : 1.5,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
}
