import type { ReactNode } from "react";
import { Platform, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { layout, spacing } from "@/theme/tokens";
import { useTheme } from "@/theme/useTheme";

type Props = {
  children: ReactNode;
  /** No top or side padding: the screen starts with full-width artwork. */
  bleed?: boolean;
};

/** Scrolling tab screen: safe area on top, clearance for the floating tab bar below. */
export function Screen({ children, bleed = false }: Props) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      // On web the tab slot grows with its content, so pin the height to the viewport there.
      // A CSS unit (not a measured number) keeps server and client render identical.
      style={[{ backgroundColor: c.bg }, Platform.OS === "web" ? { height: "100vh" } : { flex: 1 }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        width: "100%",
        maxWidth: layout.maxWidth,
        alignSelf: "center",
        paddingTop: bleed ? 0 : insets.top + spacing.lg,
        paddingBottom: insets.bottom + layout.tabBarClearance,
        paddingHorizontal: bleed ? 0 : layout.screenPadding,
      }}
    >
      {children}
    </ScrollView>
  );
}
