// Per-weight imports: only the five files the app uses end up in the bundle.
import { BigShoulders_700Bold } from "@expo-google-fonts/big-shoulders/700Bold";
import { BigShoulders_900Black } from "@expo-google-fonts/big-shoulders/900Black";
import { InstrumentSans_400Regular } from "@expo-google-fonts/instrument-sans/400Regular";
import { InstrumentSans_500Medium } from "@expo-google-fonts/instrument-sans/500Medium";
import { InstrumentSans_600SemiBold } from "@expo-google-fonts/instrument-sans/600SemiBold";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import { useEffect } from "react";
import { View } from "react-native";

import { MomentOverlay } from "@/components/MomentOverlay";
import { useTheme } from "@/theme/useTheme";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { c, scheme } = useTheme();
  // Runtime loading: works in Expo Go and on web (the config plugin does not).
  const [loaded, error] = useFonts({
    BigShoulders_700Bold,
    BigShoulders_900Black,
    InstrumentSans_400Regular,
    InstrumentSans_500Medium,
    InstrumentSans_600SemiBold,
  });

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync();
  }, [loaded, error]);

  // Keeps the area behind screens (modals, overscroll) on-theme.
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(c.bg).catch(() => {});
  }, [c.bg]);

  if (!loaded && !error) return null;

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
