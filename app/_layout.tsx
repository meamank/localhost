import { useColorScheme } from "@/src/components/useColorScheme";

import { useModelStore } from "@/src/store/modelStore";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import {
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  Montserrat_800ExtraBold,
  Montserrat_900Black,
  useFonts,
} from "@expo-google-fonts/montserrat";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { initExecutorch } from "react-native-executorch";
import { ExpoResourceFetcher } from "react-native-executorch-expo-resource-fetcher";
import { KeyboardProvider } from "react-native-keyboard-controller";
import "react-native-reanimated";
import Toast from "react-native-toast-message";
export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

initExecutorch({
  resourceFetcher: ExpoResourceFetcher,
});

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView>
      <SafeAreaProvider>
        <KeyboardProvider>
          <ThemeProvider
            value={colorScheme === "light" ? DefaultTheme : DarkTheme}
          >
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="[card]" options={{ headerShown: false }} />
            </Stack>

            <StatusBar style="auto" />
          </ThemeProvider>
        </KeyboardProvider>
      </SafeAreaProvider>
      <Toast />
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  const isInitializing = useModelStore((state) => state.isInitializing);
  const initializeStore = useModelStore((state) => state.initializeStore);
  const setModelSizes = useModelStore((state) => state.setModelSizes);

  const [loaded, error] = useFonts({
    GoogleSansFlexRound_300Light: require("@/src/assets/fonts/GoogleSansFlexRound_300Light.ttf"),
    GoogleSansFlexRound_400Regular: require("@/src/assets/fonts/GoogleSansFlexRound_400Regular.ttf"),
    GoogleSansFlexRound_500Medium: require("@/src/assets/fonts/GoogleSansFlexRound_500Medium.ttf"),
    GoogleSansFlexRound_600SemiBold: require("@/src/assets/fonts/GoogleSansFlexRound_600SemiBold.ttf"),
    GoogleSansFlexRound_700Bold: require("@/src/assets/fonts/GoogleSansFlexRound_700Bold.ttf"),
    GoogleSansFlexRound_800ExtraBold: require("@/src/assets/fonts/GoogleSansFlexRound_800ExtraBold.ttf"),

    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Montserrat_800ExtraBold,
    Montserrat_900Black,
  });

  // initiate app boot
  useEffect(() => {
    initializeStore();
  }, [initializeStore]);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded && !isInitializing) {
      SplashScreen.hideAsync();
      setModelSizes();
    }
  }, [loaded, isInitializing]);

  if (!loaded || isInitializing) {
    return null;
  }

  return <RootLayoutNav />;
}
