import { useEffect, useId, useState } from "react";
import { Pressable, StyleSheet, View, useWindowDimensions } from "react-native";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from "react-native-svg";

import { Burst } from "@/components/fx/Burst";
import { AppText } from "@/components/ui/AppText";
import { Bunting } from "@/components/world/Bunting";
import { Nim } from "@/components/world/Nim";
import { Sunburst } from "@/components/world/Sunburst";
import { GearToken } from "@/components/stats/GearShelf";
import { gearUnlockedAt, tierForLevel } from "@/game/gear";
import { useJourney } from "@/hooks/useJourney";
import { haptic } from "@/lib/haptics";
import { useUi, type Moment } from "@/store/ui";
import { alpha, layout, spacing, springs } from "@/theme/tokens";
import { useTheme } from "@/theme/useTheme";

const NIM = 230;

/** Mounted once at the root; shows whenever the store holds a moment. */
export function MomentOverlay() {
  const moment = useUi((s) => s.moment);
  const dismiss = useUi((s) => s.dismissMoment);
  const level = useJourney().player.level;
  if (!moment) return null;
  return <MomentScene moment={moment} level={level} onDone={dismiss} />;
}

type SceneProps = { moment: Moment; level: number; onDone: () => void };

// The one big moment per achievement: flags unfurl, Nim climbs into view, the number lands.
function MomentScene({ moment, level, onDone }: SceneProps) {
  const { c, scheme } = useTheme();
  const s = c.scene;
  const insets = useSafeAreaInsets();
  const { width: winW, height } = useWindowDimensions();
  const width = Math.min(winW, layout.maxWidth);
  const reduced = useReducedMotion();
  const sky = `moment${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const [landed, setLanded] = useState(reduced);
  const [hop, setHop] = useState(0);

  const veil = useSharedValue(0);
  const rise = useSharedValue(reduced ? 1 : 0);
  const number = useSharedValue(reduced ? 1 : 0);
  const text = useSharedValue(reduced ? 1 : 0);

  useEffect(() => {
    veil.set(withTiming(1, { duration: 240 }));
    if (reduced) {
      haptic.success();
      return;
    }
    rise.set(withDelay(200, withSpring(1, springs.burst)));
    number.set(withDelay(520, withSpring(1, springs.burst)));
    text.set(withDelay(820, withSpring(1, springs.settle)));
    const land = setTimeout(() => {
      setLanded(true);
      setHop((h) => h + 1);
      haptic.heavy();
    }, 540);
    const cheer = setTimeout(() => {
      setHop((h) => h + 1);
      haptic.success();
    }, 1150);
    return () => {
      clearTimeout(land);
      clearTimeout(cheer);
    };
  }, [reduced, veil, rise, number, text]);

  const veilStyle = useAnimatedStyle(() => ({ opacity: veil.get() }));
  const riseStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - rise.get()) * 220 }],
  }));
  const numberStyle = useAnimatedStyle(() => ({
    opacity: Math.min(Math.max(number.get() * 1.5, 0), 1),
    transform: [{ scale: 0.6 + 0.4 * number.get() }],
  }));
  const textStyle = useAnimatedStyle(() => ({
    opacity: Math.min(Math.max(text.get(), 0), 1),
    transform: [{ translateY: 16 * (1 - text.get()) }],
  }));

  const camp = moment.kind === "camp";
  const gear = camp ? gearUnlockedAt(moment.to) : undefined;
  const tier = tierForLevel(camp ? moment.to : level);
  const label = camp ? "Camp" : "Day streak";
  const value = camp ? moment.to : moment.days;
  const line = camp
    ? gear
      ? `New gear: ${gear.name}`
      : "A new camp, a little higher"
    : "Your longest climb yet";
  const sub = camp ? "Nim has somewhere warm to sleep tonight." : "No storm has reached you in all that time.";
  const groundTop = height * 0.6;
  const g = groundTop;
  const burstSize = height * 1.5;

  return (
    <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: s.skyTop }, veilStyle]}>
      <Pressable
        onPress={landed ? onDone : undefined}
        accessibilityRole="button"
        accessibilityLabel={`${label} ${value}. ${line}. Continue`}
        style={{ flex: 1, alignItems: "center" }}
      >
        {/* Sky, then turning rays, then the ledge Nim arrives on (which hides the lower rays). */}
        <Svg width={winW} height={height} style={{ position: "absolute" }}>
          <Defs>
            <LinearGradient id={sky} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={s.skyTop} />
              <Stop offset="0.7" stopColor={s.skyBottom} />
            </LinearGradient>
          </Defs>
          <Rect width={winW} height={height} fill={`url(#${sky})`} />
        </Svg>
        <Sunburst
          size={burstSize}
          color={scheme === "dark" ? alpha(s.orb, 0.07) : alpha("#FFFFFF", 0.26)}
          style={{ position: "absolute", left: (winW - burstSize) / 2, top: groundTop - NIM * 0.45 - burstSize / 2 }}
        />
        <Svg width={winW} height={height} style={{ position: "absolute" }}>
          <Path
            d={`M0 ${g + 46} L${winW * 0.22} ${g - 8} L${winW * 0.4} ${g + 34} L${winW * 0.7} ${g - 30} L${winW} ${g + 30} L${winW} ${height} L0 ${height} Z`}
            fill={s.ridgeMid}
          />
          <Path
            d={`M0 ${g + 70} C${winW * 0.25} ${g + 40} ${winW * 0.3} ${g + 58} ${winW * 0.5} ${g + 56} C${winW * 0.7} ${g + 54} ${winW * 0.8} ${g + 44} ${winW} ${g + 62} L${winW} ${height} L0 ${height} Z`}
            fill={c.bg}
          />
        </Svg>
        <View style={{ marginTop: insets.top + spacing.md }}>
          <Bunting width={width} />
        </View>

        <Animated.View
          style={[{ position: "absolute", top: groundTop + 56 - NIM * 0.96, alignItems: "center" }, riseStyle]}
        >
          <Nim tier={tier} size={NIM} hop={hop} />
          <Burst
            trigger={landed ? 1 : 0}
            colors={[c.blaze.red, c.blaze.yellow, c.blaze.blue]}
            count={26}
            distance={210}
            size={9}
            gravity={150}
            duration={1500}
          />
        </Animated.View>

        <Animated.View style={[{ alignItems: "center", marginTop: spacing.sm }, numberStyle]}>
          <AppText variant="heading" color={c.textMuted}>
            {label}
          </AppText>
          <AppText variant="mega" color={c.text}>
            {value}
          </AppText>
        </Animated.View>

        <Animated.View
          style={[
            {
              position: "absolute",
              bottom: insets.bottom + spacing.xxl,
              left: spacing.xl,
              right: spacing.xl,
              alignItems: "center",
            },
            textStyle,
          ]}
        >
          {gear && (
            <View style={{ marginBottom: spacing.md }}>
              <GearToken tier={gear.tier} owned size={64} />
            </View>
          )}
          <AppText variant="title" color={c.accent} style={{ textAlign: "center" }}>
            {line}
          </AppText>
          <AppText color={c.textMuted} style={{ marginTop: spacing.sm, textAlign: "center" }}>
            {sub}
          </AppText>
          <AppText variant="label" color={c.textMuted} style={{ marginTop: spacing.xl }}>
            Tap anywhere to continue
          </AppText>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}
