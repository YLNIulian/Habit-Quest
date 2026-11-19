import { useEffect, useState } from "react";
import { View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

import { AppText } from "@/components/ui/AppText";
import { blazePlate, radius, spacing, springs } from "@/theme/tokens";
import { useTheme } from "@/theme/useTheme";

const BAR = 10;
const KNOB = 20;

type Props = { level: number; xp: number; xpToNext: number };

/** The stretch between this camp and the next: XP as distance still to climb. */
export function CampProgress({ level, xp, xpToNext }: Props) {
  const { c } = useTheme();
  const [width, setWidth] = useState(0);
  const progress = xp / xpToNext;
  const p = useSharedValue(progress);

  useEffect(() => {
    p.set(withSpring(progress, springs.settle));
  }, [p, progress]);

  const fillStyle = useAnimatedStyle(() => ({
    width: Math.max(BAR, width * Math.min(Math.max(p.get(), 0), 1)),
  }));
  const knobStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: Math.max(0, width * Math.min(Math.max(p.get(), 0), 1) - KNOB / 2) }],
  }));

  return (
    <View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
        <View
          onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
          accessibilityRole="progressbar"
          accessibilityValue={{ min: 0, max: xpToNext, now: xp }}
          style={{ flex: 1, height: KNOB, justifyContent: "center" }}
        >
          <View style={{ height: BAR, borderRadius: radius.pill, backgroundColor: c.track }} />
          <Animated.View
            style={[
              { position: "absolute", height: BAR, borderRadius: radius.pill, backgroundColor: c.accent },
              fillStyle,
            ]}
          />
          <Animated.View
            style={[
              {
                position: "absolute",
                width: KNOB,
                height: KNOB,
                borderRadius: KNOB / 2,
                backgroundColor: blazePlate,
                borderWidth: 5,
                borderColor: c.accent,
              },
              knobStyle,
            ]}
          />
        </View>
        {/* The next camp, waiting at the end of the line. */}
        <View
          style={{
            minWidth: 34,
            height: 26,
            paddingHorizontal: 8,
            borderRadius: 13,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 2,
            borderColor: c.sun,
          }}
        >
          <AppText variant="figure" color={c.sunText} style={{ fontSize: 17, lineHeight: 19 }}>
            {level + 1}
          </AppText>
        </View>
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: spacing.sm }}>
        <AppText variant="label">
          {xpToNext - xp} m to Camp {level + 1}
        </AppText>
        <AppText variant="label" color={c.textMuted}>
          {xp} of {xpToNext} m
        </AppText>
      </View>
    </View>
  );
}
