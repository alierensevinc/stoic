import { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";
import * as TrackingTransparency from "expo-tracking-transparency";
import { ThemeProvider } from "context/ThemeContext";
import AppNavigator from "navigation/AppNavigator";
import { useAppInitialization } from "hooks/useAppInitialization";
import { useFontsLoading } from "hooks/useFontsLoading";
import { initializeNotifications } from "store/quoteStore";

SplashScreen.preventAutoHideAsync();
initializeNotifications();

export default function App() {
  const appIsReady = useAppInitialization();
  const { fontsLoaded, fontsError } = useFontsLoading();

  useEffect(() => {
    const hideSplashScreen = async () => {
      if (appIsReady && (fontsLoaded || fontsError)) {
        await SplashScreen.hideAsync();
        await TrackingTransparency.requestTrackingPermissionsAsync();
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
