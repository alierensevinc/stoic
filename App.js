import {useEffect, useRef} from "react";
import {Linking} from "react-native";
import {NavigationContainer} from "@react-navigation/native";
import {GestureHandlerRootView} from "react-native-gesture-handler";
import {SafeAreaProvider} from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";
import {ThemeProvider} from "context/ThemeContext";
import AppNavigator from "navigation/AppNavigator";
import ErrorBoundary from "components/ErrorBoundary";
import {useAppInitialization} from "hooks/useAppInitialization";
import {useFontsLoading} from "hooks/useFontsLoading";
import {useOpenAd} from "hooks/useOpenAd";
import {useQuoteStore} from "store/quoteStore";
import {initializeNotifications} from "utils/notificationScheduler";
import {logAnalyticsScreen} from "utils/telemetry";

SplashScreen.preventAutoHideAsync().catch(() => {});

const handleDeepLinkUrl = (url) => {
    if (!url || typeof url !== "string") return;
    // Supports stoic://quote/<quoteId> or stoic://qotd
    const quoteMatch = url.match(/stoic:\/\/quote\/([^/?#]+)/i);
    if (quoteMatch && quoteMatch[1]) {
        useQuoteStore.getState().focusQuote(decodeURIComponent(quoteMatch[1]));
    }
};

export default function App() {
    const appIsReady = useAppInitialization();
    const {fontsLoaded, fontsError} = useFontsLoading();
    const navigationRef = useRef(null);
    const routeNameRef = useRef(null);

    useOpenAd();

    useEffect(() => {
        const hideSplash = async () => {
            if (appIsReady && (fontsLoaded || fontsError)) {
                await SplashScreen.hideAsync().catch(() => {});
                await initializeNotifications();
            }
        };

        hideSplash();
    }, [appIsReady, fontsLoaded, fontsError]);

    useEffect(() => {
        Linking.getInitialURL()
            .then((initialUrl) => {
                if (initialUrl) {
                    handleDeepLinkUrl(initialUrl);
                }
            })
            .catch(() => {});

        const sub = Linking.addEventListener("url", ({url}) => {
            handleDeepLinkUrl(url);
        });

        return () => sub.remove();
    }, []);

    if (!appIsReady || (!fontsLoaded && !fontsError)) {
        return null;
    }

    return (
        <GestureHandlerRootView style={{flex: 1}}>
            <SafeAreaProvider>
                <ErrorBoundary>
                    <ThemeProvider>
                        <NavigationContainer
                            ref={navigationRef}
                            onReady={() => {
                                const current =
                                    navigationRef.current?.getCurrentRoute()
                                        ?.name;
                                if (current) {
                                    routeNameRef.current = current;
                                    logAnalyticsScreen(current);
                                }
                            }}
                            onStateChange={() => {
                                const previousRouteName = routeNameRef.current;
                                const currentRouteName =
                                    navigationRef.current?.getCurrentRoute()
                                        ?.name;
                                if (
                                    currentRouteName &&
                                    previousRouteName !== currentRouteName
                                ) {
                                    routeNameRef.current = currentRouteName;
                                    logAnalyticsScreen(currentRouteName);
                                }
                            }}
                        >
                            <AppNavigator />
                        </NavigationContainer>
                    </ThemeProvider>
                </ErrorBoundary>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}
