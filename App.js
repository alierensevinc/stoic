import React, { useEffect, useState, useCallback } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator, TransitionSpecs } from "@react-navigation/stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import mobileAds from "react-native-google-mobile-ads";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { ThemeProvider } from "./app/context/ThemeContext";
import HomeScreen from "./app/screens/Home";
import BookmarksScreen from "./app/screens/Bookmarks";
import { bookmarkScreenInterpolator } from "./app/utils/animations";

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
            <Stack.Screen
              name="Bookmarks"
              component={BookmarksScreen}
              options={{
                transitionSpec: {
                  open: TransitionSpecs.TransitionIOSSpec,
                  close: TransitionSpecs.TransitionIOSSpec,
                },
                cardStyleInterpolator: bookmarkScreenInterpolator,
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
