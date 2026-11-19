import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import { useEffect } from "react";
import { Text, View } from "react-native";

import { MomentOverlay } from "@/components/MomentOverlay";
import { useAppReady } from "@/hooks/useAppReady";
import { useTheme } from "@/theme/useTheme";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { c, scheme } = useTheme();
  const { ready, error } = useAppReady();

  useEffect(() => {
    if (ready || error) SplashScreen.hideAsync();
  }, [ready, error]);

  // Keeps the area behind screens (modals, overscroll) on-theme.
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(c.bg).catch(() => {});
  }, [c.bg]);

  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor: c.bg, alignItems: "center", justifyContent: "center", padding: 24 }}>
        <Text style={{ color: c.text, fontSize: 17, fontWeight: "600" }}>Could not open the database</Text>
        <Text style={{ color: c.textMuted, marginTop: 8, textAlign: "center" }}>{error.message}</Text>
      </View>
    );
  }

  if (!ready) return null;

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.bg } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="habit-form" options={{ presentation: "modal" }} />
      </Stack>
      <MomentOverlay />
    </View>
  );
}
