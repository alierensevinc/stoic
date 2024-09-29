import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";
import { ThemeProvider } from "./app/context/ThemeContext";
import AppNavigator from "./app/navigation/AppNavigator";
import { useAppInitialization } from "./app/hooks/useAppInitialization";
import { useFontsLoading } from "./app/hooks/useFontsLoading";

SplashScreen.preventAutoHideAsync();

export default function App() {
  const appIsReady = useAppInitialization();
  const { fontsLoaded, fontsError } = useFontsLoading();

  useEffect(() => {
    const hideSplashScreen = async () => {
      if (appIsReady && (fontsLoaded || fontsError)) {
        await SplashScreen.hideAsync();
      }
    };
    hideSplashScreen();
  }, [appIsReady, fontsLoaded, fontsError]);

  if (!appIsReady || !fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
