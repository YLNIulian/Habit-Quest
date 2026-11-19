import type { ReactNode } from "react";
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

import { springs } from "@/theme/tokens";

type Props = Omit<PressableProps, "style" | "children"> & {
  children: ReactNode;
  /** Layout style for the outer pressable (flex, width…). */
  style?: StyleProp<ViewStyle>;
  /** Visual style for the part that scales. */
  contentStyle?: StyleProp<ViewStyle>;
  pressedScale?: number;
};

/** Pressable that compresses under the finger and springs back. */
export function PressableScale({
  children,
  style,
  contentStyle,
  pressedScale = 0.96,
  onPressIn,
  onPressOut,
  ...rest
}: Props) {
  const scale = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));

  return (
    <Pressable
      {...rest}
      style={style}
      onPressIn={(e) => {
        scale.set(withSpring(pressedScale, springs.press));
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.set(withSpring(1, springs.press));
        onPressOut?.(e);
      }}
    >
      <Animated.View style={[contentStyle, animated]}>{children}</Animated.View>
    </Pressable>
  );
}
