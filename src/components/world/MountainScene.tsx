import { useEffect, useId, type ReactNode } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle, Defs, Ellipse, LinearGradient, Line, Path, Rect, Stop } from "react-native-svg";

import { Campfire } from "@/components/world/Campfire";
import { Nim } from "@/components/world/Nim";
import { Snowfall } from "@/components/world/Snowfall";
import type { GearTier } from "@/game/gear";
import { nimColors } from "@/theme/tokens";
import { useTheme } from "@/theme/useTheme";
import type { Weather } from "@/types";

// The scene is designed on a 390×330 grid and scaled to the screen width.
const W = 390;
const H = 330;
export const SCENE_RATIO = H / W;

const RIDGE_FAR =
  "M0 214 L46 186 L92 204 L150 160 L196 186 L255 92 L292 142 L326 124 L362 176 L390 160 L390 330 L0 330 Z";
const SNOW_CAP = "M255 92 L276 121 L265 116 L256 129 L246 114 L236 122 Z";
const SNOW_CAP_2 = "M326 124 L339 144 L331 141 L325 149 L318 139 L311 133 Z";
const SNOW_CAP_3 = "M150 160 L163 168 L156 170 L150 178 L143 170 L135 171 Z";
const RIDGE_MID =
  "M0 250 L50 215 L95 240 L150 196 L200 234 L250 208 L310 246 L360 216 L390 232 L390 330 L0 330 Z";
const RIDGE_NEAR =
  "M0 290 L60 262 L120 284 L190 252 L260 282 L330 258 L390 276 L390 330 L0 330 Z";
// Nearest ground. Painted in the page background so the UI sits on the mountain.
const GROUND =
  "M0 322 C50 306 90 312 130 304 C170 296 190 298 220 298 L300 298 C330 298 350 306 390 300 L390 331 L0 331 Z";
const TRAIL_BEHIND = "M86 309 C130 301 170 299 228 298";
const TRAIL_AHEAD = "M300 296 C336 274 304 236 322 204 C338 174 284 150 262 112";

// Pines as [x of trunk, y of base, height].
const PINES_BACK: [number, number, number][] = [
  [22, 280, 22], [36, 274, 28], [150, 270, 20], [164, 264, 26], [352, 266, 24], [368, 272, 18],
];
const PINES_FRONT: [number, number, number][] = [
  [14, 320, 34], [340, 303, 30], [362, 304, 40], [380, 302, 26],
];

/** A two-tier pine silhouette. */
function pine(x: number, y: number, h: number) {
  const w = h * 0.34;
  return `M${x} ${y - h} L${x + w * 0.7} ${y - h * 0.45} L${x + w * 0.35} ${y - h * 0.45} L${x + w} ${y} L${x - w} ${y} L${x - w * 0.35} ${y - h * 0.45} L${x - w * 0.7} ${y - h * 0.45} Z`;
}

const STARS: [number, number, number][] = [
  [28, 40, 1.2], [70, 96, 0.9], [112, 30, 1.4], [150, 82, 0.8], [188, 44, 1.1], [214, 118, 0.8],
  [236, 22, 1], [286, 58, 0.8], [352, 34, 1.3], [372, 112, 0.9], [40, 150, 0.8], [330, 16, 0.8],
];

type Props = {
  width: number;
  weather: Weather;
  tier: GearTier;
  /** Bump to make Nim hop. */
  hop: number;
  /** Today's route is finished: Nim has a fire going. */
  fire?: boolean;
  /** Extra sky above the scene (status bar area). */
  topInset?: number;
  /** Overlay content, positioned over the sky. */
  children?: ReactNode;
};

/** The mountain: layered ridges, the camp behind, the route ahead, and Nim on the path. */
export function MountainScene({ width, weather, tier, hop, fire = false, topInset = 0, children }: Props) {
  const { c, scheme } = useTheme();
  const s = c.scene;
  const k = width / W;
  const height = width * SCENE_RATIO;
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const sky = `sky${uid}`;
  const far = `far${uid}`;
  const mid = `mid${uid}`;
  const reduced = useReducedMotion();
  const drift = useSharedValue(0);

  useEffect(() => {
    if (reduced) return;
    drift.set(withRepeat(withTiming(1, { duration: 70000, easing: Easing.linear }), -1, false));
  }, [drift, reduced]);

  const cloudA = useAnimatedStyle(() => ({
    transform: [{ translateX: ((drift.get() + 0.15) % 1) * (width + 180) - 150 }],
  }));
  const cloudB = useAnimatedStyle(() => ({
    transform: [{ translateX: ((drift.get() * 2 + 0.6) % 1) * (width + 180) - 150 }],
  }));

  const nimSize = 116 * k;
  const snowCount = weather === "storm" ? 38 : weather === "wind" ? 16 : 0;

  return (
    <View style={{ width, height: height + topInset, backgroundColor: s.skyTop }}>
      <View style={{ position: "absolute", top: topInset, width, height }}>
        <Svg width={width} height={height} viewBox={`0 0 ${W} ${H}`}>
          <Defs>
            <LinearGradient id={sky} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={s.skyTop} />
              <Stop offset="0.82" stopColor={s.skyBottom} />
            </LinearGradient>
            {/* Ridges fade towards their base: haze gives the range its depth. */}
            <LinearGradient id={far} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0.25" stopColor={s.ridgeFar} />
              <Stop offset="0.8" stopColor={s.haze} />
            </LinearGradient>
            <LinearGradient id={mid} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0.55" stopColor={s.ridgeMid} />
              <Stop offset="1" stopColor={s.ridgeFar} />
            </LinearGradient>
          </Defs>
          <Rect width={W} height={H} fill={`url(#${sky})`} />

          {scheme === "dark" &&
            STARS.map(([x, y, r]) => <Circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill={s.star} opacity={0.75} />)}

          {/* Moon by night, sun by day, rising from behind the far ridge. */}
          <Circle cx={342} cy={140} r={50} fill={s.orb} opacity={0.1} />
          <Circle cx={342} cy={140} r={34} fill={s.orb} opacity={0.12} />
          <Circle cx={342} cy={140} r={22} fill={s.orb} />

          <Path d={RIDGE_FAR} fill={`url(#${far})`} />
          <Path d={SNOW_CAP} fill={s.snow} />
          <Path d={SNOW_CAP_2} fill={s.snow} opacity={0.85} />
          <Path d={SNOW_CAP_3} fill={s.snow} opacity={0.7} />
          {/* The summit flag: where all of this is going. */}
          <Line x1={255} y1={92} x2={255} y2={79} stroke={s.trail} strokeWidth={1.4} />
          <Path d="M255 79 L264 82 L255 85.5 Z" fill={c.accent} />

          <Path d={RIDGE_MID} fill={`url(#${mid})`} />
          <Path d={TRAIL_AHEAD} stroke={s.trail} strokeWidth={1.6} strokeDasharray={[2, 6]} strokeLinecap="round" fill="none" />
          <Path d={RIDGE_NEAR} fill={s.ridgeNear} />
          {PINES_BACK.map(([x, y, h]) => (
            <Path key={`${x}-${y}`} d={pine(x, y, h)} fill={s.ridgeNear} />
          ))}

          {weather === "storm" && <Rect width={W} height={H} fill={s.storm} />}

          <Path d={GROUND} fill={c.bg} />
          {PINES_FRONT.map(([x, y, h]) => (
            <Path key={`${x}-${y}`} d={pine(x, y, h)} fill={s.pine} />
          ))}
          <Path d={TRAIL_BEHIND} stroke={c.textMuted} strokeWidth={1.6} strokeDasharray={[2, 6]} strokeLinecap="round" fill="none" />

          {/* The last camp, left behind on the slope. */}
          <Line x1={66} y1={285} x2={66} y2={268} stroke={c.textMuted} strokeWidth={1.4} />
          <Path d="M66 268 L77 272 L66 276 Z" fill={c.accent} />
          <Path d="M44 314 L66 284 L88 312 Z" fill={nimColors.scarf} />
          <Path d="M66 284 L88 312 L74 313 Z" fill={nimColors.scarfShade} />
          <Path d="M60 314 L66 300 L72 313 Z" fill={nimColors.ink} />

          {/* Nim's shadow on the ledge. */}
          <Ellipse cx={262} cy={299} rx={30} ry={4} fill={nimColors.ink} opacity={scheme === "dark" ? 0.5 : 0.14} />
        </Svg>

        <Animated.View style={[{ position: "absolute", top: 34 * k }, cloudA]}>
          <Cloud width={130 * k} color={s.cloud} />
        </Animated.View>
        <Animated.View style={[{ position: "absolute", top: 150 * k }, cloudB]}>
          <Cloud width={92 * k} color={s.cloud} />
        </Animated.View>

        {fire && (
          <View style={{ position: "absolute", left: 176 * k, top: 299 * k - 36 * k * 0.9 }}>
            <Campfire size={36 * k} />
          </View>
        )}

        {/* Nim stands on the ledge at x 220–300, y 298. */}
        <View style={{ position: "absolute", left: 216 * k, top: 298 * k - nimSize * 0.96 }}>
          <Nim tier={tier} size={nimSize} cold={weather === "storm"} hop={hop} />
        </View>

        {snowCount > 0 && (
          <Snowfall width={width} height={height} count={snowCount} color={s.snow} wind={weather === "storm" ? 110 : 44} />
        )}
      </View>

      {children}
    </View>
  );
}

function Cloud({ width, color }: { width: number; color: string }) {
  return (
    <Svg width={width} height={width * 0.32} viewBox="0 0 100 32">
      <Path
        d="M10 30 C2 30 0 22 7 20 C6 12 16 8 22 13 C26 3 44 2 49 12 C58 6 70 10 70 18 C80 15 90 19 90 25 C96 25 98 30 92 30 Z"
        fill={color}
      />
    </Svg>
  );
}
