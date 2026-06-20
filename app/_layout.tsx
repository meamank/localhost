import { useColorScheme } from "@/src/components/useColorScheme";

import { useModelStore } from "@/src/store/modelStore";
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
  ErrorBoundary
} from "expo-router";

initExecutorch({
  resourceFetcher: ExpoResourceFetcher,
});

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <>
      <KeyboardProvider>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <Stack>
            <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
          </Stack>

          <StatusBar style="auto" />
        </ThemeProvider>
      </KeyboardProvider>
      <Toast />
    </>
  );
}

export default function RootLayout() {
  const isInitializing = useModelStore((state) => state.isInitializing);
  const initializeStore = useModelStore((state) => state.initializeStore);
  const setModelSizes = useModelStore((state) => state.setModelSizes);

  const [loaded, error] = useFonts({
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
