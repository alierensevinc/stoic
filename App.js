import {useEffect} from "react";
import {NavigationContainer} from "@react-navigation/native";
import {GestureHandlerRootView} from "react-native-gesture-handler";
import {SafeAreaProvider} from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";
import * as TrackingTransparency from "expo-tracking-transparency";
import {ThemeProvider} from "context/ThemeContext";
import AppNavigator from "navigation/AppNavigator";
import {useAppInitialization} from "hooks/useAppInitialization";
import {useFontsLoading} from "hooks/useFontsLoading";
import {initializeNotifications} from "utils/notificationScheduler";
import {useOpenAd} from "./app/hooks/useOpenAd"; // Fonksiyonu import et

SplashScreen.preventAutoHideAsync();

export default function App() {
    const appIsReady = useAppInitialization();
    const {fontsLoaded, fontsError} = useFontsLoading();

    useOpenAd();

    useEffect(() => {
        const hideSplashScreen = async () => {
            if (appIsReady && (fontsLoaded || fontsError)) {
                await SplashScreen.hideAsync();
                await initializeNotifications();
                await TrackingTransparency.requestTrackingPermissionsAsync();
            }
        };

        hideSplashScreen();
    }, [appIsReady, fontsLoaded, fontsError]);

    if (!appIsReady || !fontsLoaded) {
        return null;
    }

    return (
        <GestureHandlerRootView style={{flex: 1}}>
            <SafeAreaProvider>
                <ThemeProvider>
                    <NavigationContainer>
                        <AppNavigator/>
                    </NavigationContainer>
                </ThemeProvider>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}