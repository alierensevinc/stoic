import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator, TransitionSpecs } from "@react-navigation/stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";
import { ThemeProvider } from "./app/context/ThemeContext";
import HomeScreen from "./app/screens/Home";
import BookmarksScreen from "./app/screens/Bookmarks";
import { bookmarkScreenInterpolator } from "./app/utils/animations";
import { useAppInitialization } from "./app/hooks/useAppInitialization";
import { useFontsLoading } from "./app/hooks/useFontsLoading";

const Stack = createStackNavigator();
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
