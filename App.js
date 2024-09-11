import React, { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import mobileAds from "react-native-google-mobile-ads";
import * as SplashScreen from "expo-splash-screen";

import { ThemeProvider } from "./app/context/ThemeContext";
import HomeScreen from "./app/screens/Home";
import FavoritesScreen from "./app/screens/Favorites";

const Stack = createStackNavigator();

export default function App() {
  SplashScreen.preventAutoHideAsync();

  useEffect(() => {
    mobileAds()
      .initialize()
      .then((adapterStatuses) => {
        SplashScreen.hideAsync();
      });
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Favorites" component={FavoritesScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
