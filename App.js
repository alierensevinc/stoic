import React, { useEffect, useState, useCallback } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import mobileAds from "react-native-google-mobile-ads";
import * as SplashScreen from "expo-splash-screen";
import { ThemeProvider } from "./app/context/ThemeContext";
import HomeScreen from "./app/screens/Home";
import FavoritesScreen from "./app/screens/Favorites";
import ShareQuoteScreen from "./app/screens/ShareQuote";
import { useFonts } from "expo-font";

const Stack = createStackNavigator();
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [loaded, error] = useFonts({
    "Montserrat-Bold": require("./assets/fonts/montserrat/Montserrat-Bold.ttf"),
    "Montserrat-Italic": require("./assets/fonts/montserrat/Montserrat-Italic.ttf"),
    "Montserrat-Medium": require("./assets/fonts/montserrat/Montserrat-Medium.ttf"),
    "Montserrat-Regular": require("./assets/fonts/montserrat/Montserrat-Regular.ttf"),
  });

  useEffect(() => {
    async function prepare() {
      try {
        await mobileAds().initialize();

        setAppIsReady(true);
      } catch (e) {
        console.warn(e);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady && (loaded || error)) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady && !loaded && !error) {
    return null;
  }

  return (
    <SafeAreaProvider onLayout={onLayoutRootView}>
      <ThemeProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Favorites" component={FavoritesScreen} />
            <Stack.Screen name="ShareQuote" component={ShareQuoteScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
