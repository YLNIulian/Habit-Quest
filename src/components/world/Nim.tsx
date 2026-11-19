import { useEffect, useState } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle, Ellipse, Line, Path, Rect } from "react-native-svg";

import {
  BackLayer,
  COAT_PAINT,
  HOOD_PAINT,
  HandItem,
  HeadTop,
  SCARF_PAINT,
} from "@/components/world/outfitArt";
import type { GearTier } from "@/game/gear";
import { DEFAULT_LOOK, type Look } from "@/game/wardrobe";
import { nimColors as n, springs } from "@/theme/tokens";

// Nim is drawn on an 80×100 grid, feet on y = 96.
const VIEW = "0 0 80 100";

type Props = {
  /** Gear earned so far; each tier adds a visible item. */
  tier: GearTier;
  /** Height in px. Width is 80% of it. */
  size?: number;
  /** Shivers and loses the rosy cheeks. */
  cold?: boolean;
  /** Bump to make Nim hop. */
  hop?: number;
  // clothes from the outfit shop
  look?: Look;
  // no idle animations (used for small previews)
  still?: boolean;
};

/** The climber. Original character, drawn entirely in SVG. */
export function Nim({ tier, size = 100, cold = false, hop = 0, look = DEFAULT_LOOK, still = false }: Props) {
  const reduced = useReducedMotion();
  const calm = reduced || still;
  const width = size * 0.8;

  const bob = useSharedValue(0);
  const jump = useSharedValue(0);
  const shiver = useSharedValue(0);
  const sway = useSharedValue(0);
  const [blink, setBlink] = useState(false);

  // Ambient: slow breathing bob and a scarf moving in the wind.
  useEffect(() => {
    if (calm) return;
    bob.set(withRepeat(withTiming(1, { duration: 1900, easing: Easing.inOut(Easing.sin) }), -1, true));
    sway.set(withRepeat(withTiming(1, { duration: 1300, easing: Easing.inOut(Easing.sin) }), -1, true));
  }, [bob, sway, calm]);

  useEffect(() => {
    if (calm || !cold) {
      cancelAnimation(shiver);
      shiver.set(0);
      return;
    }
    shiver.set(withRepeat(withTiming(1, { duration: 70, easing: Easing.linear }), -1, true));
  }, [shiver, cold, calm]);

  useEffect(() => {
    if (hop === 0 || reduced) return;
    jump.set(withSequence(withTiming(1, { duration: 160, easing: Easing.out(Easing.quad) }), withSpring(0, springs.burst)));
  }, [jump, hop, reduced]);

  // Blink every few seconds.
  useEffect(() => {
    if (calm) return;
    let close: ReturnType<typeof setTimeout>;
    const open = setInterval(() => {
      setBlink(true);
      close = setTimeout(() => setBlink(false), 130);
    }, 3600);
    return () => {
      clearInterval(open);
      clearTimeout(close);
    };
  }, [calm]);

  const bodyStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: (shiver.get() - 0.5) * 2.2 * (size / 100) },
      { translateY: -bob.get() * 1.6 - jump.get() * size * 0.2 },
      { scaleY: 1 + jump.get() * 0.04 },
    ],
  }));
  const tailStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${-6 + sway.get() * 14}deg` }],
  }));

  const coat = COAT_PAINT[look.coat] ?? COAT_PAINT["coat-red"];
  const scarf = SCARF_PAINT[look.scarf] ?? SCARF_PAINT["scarf-yellow"];
  const hood = HOOD_PAINT[look.head] ?? coat;
  const hasCape = look.cape !== "cape-none";
  const holding = look.hand !== "hand-none";
  const cheek = cold ? "#7FA8F5" : n.coat;

  return (
    <Animated.View style={[{ width, height: size }, bodyStyle]}>
      {/* Cape or wings sit behind the scarf tail. */}
      {hasCape && (
        <View style={{ position: "absolute" }}>
          <Svg width={width} height={size} viewBox={VIEW}>
            <BackLayer id={look.cape} />
          </Svg>
        </View>
      )}

      {/* Scarf tail: its own layer so it can wave. Pivot is where it meets the neck. */}
      <Animated.View style={[{ position: "absolute", transformOrigin: "36% 50%" }, tailStyle]}>
        <Svg width={width} height={size} viewBox={VIEW}>
          <Path d="M30 46 C22 45 15 49 6 45 L7 54 C15 58 22 54 30 54 Z" fill={scarf.shade} />
        </Svg>
      </Animated.View>

      <View style={{ position: "absolute" }}>
        <Svg width={width} height={size} viewBox={VIEW}>
          {/* Tier 4: storm cloak (a bought cape takes its place) */}
          {tier >= 4 && !hasCape && <Path d="M26 44 C10 58 6 80 10 94 L40 90 L40 44 Z" fill={n.cloak} />}

          {/* Tier 5: summit pennant */}
          {tier >= 5 && (
            <>
              <Line x1={24} y1={52} x2={24} y2={2} stroke={n.ink} strokeWidth={2.4} strokeLinecap="round" />
              <Path d="M24 3 L8 9 L24 16 Z" fill={n.scarf} />
            </>
          )}

          {/* Tier 3: pack and ice axe (the axe is hidden when the hand holds something) */}
          {tier >= 3 && (
            <>
              {!holding && (
                <>
                  <Line x1={19} y1={62} x2={12} y2={28} stroke={n.metal} strokeWidth={3} strokeLinecap="round" />
                  <Path d="M4 30 L17 23 L19 28 L9 34 Z" fill={n.metal} />
                </>
              )}
              <Rect x={13} y={47} width={19} height={29} rx={7} fill={n.pack} />
            </>
          )}

          {/* Boots */}
          <Rect x={29} y={80} width={10} height={16} rx={4.5} fill={n.ink} />
          <Rect x={42} y={80} width={10} height={16} rx={4.5} fill={n.ink} />

          {/* Coat */}
          <Path d="M24 80 C22 60 28 46 40 46 C52 46 58 60 56 80 C56 86 52 88 40 88 C28 88 24 86 24 80 Z" fill={coat.main} />
          <Path d="M40 88 C52 88 56 86 56 80 C57 68 55 58 50 51 C52 64 50 80 40 88 Z" fill={coat.shade} />

          <HandItem id={look.hand} />

          {/* Arms and mittens */}
          <Line x1={28} y1={60} x2={22} y2={71} stroke={coat.shade} strokeWidth={7} strokeLinecap="round" />
          <Circle cx={21.5} cy={72} r={4.2} fill={n.ink} />
          <Line x1={52} y1={60} x2={61} y2={68} stroke={coat.shade} strokeWidth={7} strokeLinecap="round" />
          <Circle cx={62} cy={69} r={4.2} fill={n.ink} />

          {/* Tier 2: lantern, glowing at night */}
          {tier >= 2 && (
            <>
              <Line x1={62} y1={72} x2={62} y2={76} stroke={n.ink} strokeWidth={1.6} />
              <Rect x={56.5} y={76} width={11} height={14} rx={3} fill={n.ink} />
              <Rect x={58.5} y={78.5} width={7} height={9} rx={2} fill={n.lamp} />
            </>
          )}

          {/* Scarf wrap */}
          <Rect x={26} y={44} width={28} height={9} rx={4.5} fill={scarf.main} />

          {/* Hood, fur trim, face */}
          <Circle cx={40} cy={29} r={22} fill={hood.main} />
          <Path d="M40 7 C52 7 62 17 62 29 C62 34 60 39 57 43 C58 30 54 16 40 7 Z" fill={hood.shade} />
          <Circle cx={40} cy={31.5} r={16} fill={n.fur} />
          <Circle cx={40} cy={32.5} r={12.6} fill={n.face} />
          <Ellipse cx={35.2} cy={32.5} rx={1.9} ry={blink ? 0.4 : 2.7} fill={n.ink} />
          <Ellipse cx={44.8} cy={32.5} rx={1.9} ry={blink ? 0.4 : 2.7} fill={n.ink} />
          <Circle cx={31.4} cy={37.4} r={2.5} fill={cheek} opacity={0.4} />
          <Circle cx={48.6} cy={37.4} r={2.5} fill={cheek} opacity={0.4} />
          {cold ? (
            <Path d="M37.5 39.6 L39 38.4 L40.5 39.6 L42 38.4 L43.5 39.6" stroke={n.ink} strokeWidth={1.1} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          ) : (
            <Path d="M37.6 38.4 Q40 40.6 42.4 38.4" stroke={n.ink} strokeWidth={1.2} strokeLinecap="round" fill="none" />
          )}

          {/* Hat, crown or pom-pom */}
          <HeadTop id={look.head} />
        </Svg>
      </View>
    </Animated.View>
  );
}
