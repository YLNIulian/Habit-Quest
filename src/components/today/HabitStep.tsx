import { useEffect, useState } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { Blaze } from "@/components/blaze/Blaze";
import { Burst } from "@/components/fx/Burst";
import { Glyph } from "@/components/icons/Glyph";
import { AppText } from "@/components/ui/AppText";
import { PressableScale } from "@/components/ui/PressableScale";
import { ATTRIBUTE_LABEL } from "@/lib/habits";
import { haptic } from "@/lib/haptics";
import { spacing, springs } from "@/theme/tokens";
import { useTheme } from "@/theme/useTheme";
import type { Habit } from "@/types";

export const STEP_HEIGHT = 76;
const BLAZE = 46;
const CHECK = 44;

type Props = {
  habit: Habit;
  /** Times done today before finishing. */
  count: number;
  done: boolean;
  /** Metres awarded, shown when the step is climbed. */
  reward: number;
  /** Draws the trail down to the next step. */
  hasNext: boolean;
  /** The trail is solid only between two finished steps. */
  nextDone?: boolean;
  onToggle: () => void;
  // long press removes one check (for habits done more times a day)
  onUndoOne?: () => void;
};

/** One habit on today's route: blaze, name, and a check that turns it into metres climbed. */
export function HabitStep({ habit, count, done, reward, hasNext, nextDone = false, onToggle, onUndoOne }: Props) {
  const { c } = useTheme();
  const reduced = useReducedMotion();
  const [burst, setBurst] = useState(0);

  const on = useSharedValue(done ? 1 : 0);
  const stamp = useSharedValue(0);
  const float = useSharedValue(1);

  useEffect(() => {
    on.set(withSpring(done ? 1 : 0, done ? springs.burst : springs.settle));
  }, [on, done]);

  const checkStyle = useAnimatedStyle(() => ({
    opacity: Math.min(Math.max(on.get(), 0), 1),
    transform: [{ scale: 0.5 + 0.5 * on.get() }],
  }));
  const blazeStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${-10 * stamp.get()}deg` }, { scale: 1 + 0.16 * stamp.get() }],
  }));
  // "+15 m" rises and fades: good things go up.
  const floatStyle = useAnimatedStyle(() => ({
    opacity: float.get() >= 1 ? 0 : 1 - float.get() * float.get(),
    transform: [{ translateY: -38 * float.get() }],
  }));

  const multi = habit.targetPerDay > 1;
  const filled = done ? habit.targetPerDay : count;
  const status = done ? "climbed" : multi ? `${count} of ${habit.targetPerDay}` : "not done";

  return (
    <PressableScale
      pressedScale={0.98}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: done }}
      accessibilityLabel={`${habit.name}, ${status}`}
      accessibilityHint={multi && count > 0 ? "Long press to remove one" : undefined}
      onLongPress={
        multi && count > 0 && onUndoOne
          ? () => {
              haptic.tap();
              onUndoOne();
            }
          : undefined
      }
      onPress={() => {
        if (done) {
          haptic.tap();
        } else {
          haptic.step();
          setBurst((b) => b + 1);
          if (!reduced) {
            stamp.set(withSequence(withTiming(1, { duration: 90 }), withSpring(0, springs.burst)));
          }
          // the "+15 m" only shows when the habit gets finished
          if (!reduced && count + 1 >= habit.targetPerDay) {
            float.set(0);
            float.set(withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) }));
          }
        }
        onToggle();
      }}
      contentStyle={{ height: STEP_HEIGHT, flexDirection: "row", alignItems: "center", gap: spacing.lg }}
    >
      {/* Trail to the next step: walked = solid, ahead = dotted. */}
      {hasNext && (
        <View
          style={{
            position: "absolute",
            left: BLAZE / 2 - 1.5,
            top: (STEP_HEIGHT + BLAZE) / 2 + 5,
            height: STEP_HEIGHT - BLAZE - 10,
            width: 3,
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {done && nextDone ? (
            <View style={{ flex: 1, width: 3, borderRadius: 1.5, backgroundColor: c.accent }} />
          ) : (
            [0, 1, 2].map((i) => (
              <View key={i} style={{ width: 3, height: 3, borderRadius: 1.5, backgroundColor: c.textMuted, opacity: 0.6 }} />
            ))
          )}
        </View>
      )}

      <Animated.View style={blazeStyle}>
        <Blaze shape={habit.shape} color={habit.color} size={BLAZE} />
      </Animated.View>

      <View style={{ flex: 1 }}>
        <AppText variant="bodyStrong" numberOfLines={1}>
          {habit.name}
        </AppText>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 3 }}>
          <Glyph name={habit.attribute} size={13} color={c.textMuted} strokeWidth={2.2} />
          <AppText variant="caption" color={c.textMuted}>
            {ATTRIBUTE_LABEL[habit.attribute]}
          </AppText>
          {multi && (
            <View style={{ flexDirection: "row", gap: 3, marginLeft: 6 }}>
              {Array.from({ length: habit.targetPerDay }, (_, i) => (
                <View
                  key={i}
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: 2,
                    backgroundColor: i < filled ? c.blaze[habit.color] : c.track,
                  }}
                />
              ))}
            </View>
          )}
        </View>
      </View>

      <View style={{ width: CHECK, height: CHECK, alignItems: "center", justifyContent: "center" }}>
        <View
          style={{
            position: "absolute",
            width: CHECK,
            height: CHECK,
            borderRadius: CHECK / 2,
            borderWidth: 2,
            borderColor: c.track,
          }}
        />
        <Animated.View
          style={[
            {
              width: CHECK,
              height: CHECK,
              borderRadius: CHECK / 2,
              backgroundColor: c.accent,
              alignItems: "center",
              justifyContent: "center",
            },
            checkStyle,
          ]}
        >
          <Glyph name="check" size={24} color={c.onAccent} strokeWidth={2.8} />
        </Animated.View>
        <Burst trigger={burst} colors={[c.accent, c.sun, c.cold]} count={9} distance={38} size={5} />
        <Animated.View style={[{ position: "absolute", top: -6, width: 80, alignItems: "center" }, floatStyle]}>
          <AppText variant="figure" color={c.accent} style={{ fontSize: 22, lineHeight: 24 }}>
            +{reward} m
          </AppText>
        </Animated.View>
      </View>
    </PressableScale>
  );
}
