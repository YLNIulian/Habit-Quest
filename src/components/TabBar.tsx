import type { TabTriggerSlotProps } from "expo-router/ui";
import { useEffect, type ComponentProps } from "react";
import { Pressable, useWindowDimensions, type ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Glyph, type GlyphName } from "@/components/icons/Glyph";
import { AppText } from "@/components/ui/AppText";
import { haptic } from "@/lib/haptics";
import { layout, radius, spacing, springs } from "@/theme/tokens";
import { useTheme } from "@/theme/useTheme";

const PADDING = 6;
const BORDER = 1;

/** Geometry + style of the floating bar, shared by the bar and its indicator. */
export function useTabBarMetrics(tabCount: number) {
  const { c, shadow } = useTheme();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const barWidth = Math.min(width, layout.maxWidth) - spacing.xl * 2;
  const itemWidth = (barWidth - (PADDING + BORDER) * 2) / tabCount;

  const barStyle: ViewStyle = {
    position: "absolute",
    bottom: insets.bottom + spacing.md,
    left: (width - barWidth) / 2,
    width: barWidth,
    height: layout.tabBarHeight,
    padding: PADDING,
    flexDirection: "row",
    borderRadius: radius.pill,
    borderWidth: BORDER,
    borderColor: c.border,
    backgroundColor: c.surface,
    boxShadow: shadow.float,
  };
  return { barStyle, itemWidth };
}

/** Pill that slides under the active tab. */
export function TabIndicator({ index, itemWidth }: { index: number; itemWidth: number }) {
  const { c } = useTheme();
  const x = useSharedValue(index * itemWidth);

  useEffect(() => {
    x.set(withSpring(index * itemWidth, springs.settle));
  }, [x, index, itemWidth]);

  const style = useAnimatedStyle(() => ({ transform: [{ translateX: x.get() }] }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          left: PADDING,
          top: PADDING,
          bottom: PADDING,
          width: itemWidth,
          borderRadius: radius.pill,
          backgroundColor: c.accentSoft,
          pointerEvents: "none",
        },
        style,
      ]}
    />
  );
}

type TabButtonProps = Omit<TabTriggerSlotProps, "ref"> & {
  icon: GlyphName;
  label: string;
  ref?: ComponentProps<typeof Pressable>["ref"];
};

/** Child of <TabTrigger asChild>: receives isFocused and the navigation handlers. */
export function TabButton({ icon, label, isFocused, onPress, ...rest }: TabButtonProps) {
  const { c } = useTheme();
  const color = isFocused ? c.accent : c.textMuted;
  return (
    <Pressable
      {...rest}
      onPress={(e) => {
        if (!isFocused) haptic.select();
        onPress?.(e);
      }}
      accessibilityRole="tab"
      accessibilityState={{ selected: !!isFocused }}
      accessibilityLabel={label}
      style={{
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: spacing.sm,
      }}
    >
      <Glyph name={icon} size={20} color={color} strokeWidth={2.1} />
      <AppText variant="label" color={color} style={{ fontFamily: "InstrumentSans_600SemiBold" }}>
        {label}
      </AppText>
    </Pressable>
  );
}
