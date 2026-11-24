import {useEffect, useRef} from "react";
import {AppState, Platform} from "react-native";
import {AdEventType, AppOpenAd, TestIds} from "react-native-google-mobile-ads";
import {useAdStore} from "store/adStore";
import {
    AD_APP_OPEN_EXPIRY_MS,
    AD_APP_OPEN_MIN_BACKGROUND_MS,
} from "utils/constants";
import {logger} from "utils/logger";

const adUnitId = __DEV__
    ? TestIds.APP_OPEN
    : Platform.OS === "ios"
      ? process.env.EXPO_PUBLIC_IOS_ADMOB_OPEN || TestIds.APP_OPEN
      : process.env.EXPO_PUBLIC_ANDROID_ADMOB_OPEN || TestIds.APP_OPEN;

export const useOpenAd = () => {
    const adsInitialized = useAdStore((s) => s.adsInitialized);
    const canRequestAds = useAdStore((s) => s.canRequestAds);
    const requestNonPersonalizedAdsOnly = useAdStore(
        (s) => s.requestNonPersonalizedAdsOnly
    );

    const appOpenAd = useRef(null);
    const isAdLoadedRef = useRef(false);
    const loadedAtRef = useRef(0);
    const backgroundedAtRef = useRef(0);
    const shownInSessionRef = useRef(false);
    const appState = useRef(AppState.currentState);

    useEffect(() => {
        if (!adsInitialized || !canRequestAds) {
            return;
        }

        const ad = AppOpenAd.createForAdRequest(adUnitId, {
            keywords: ["stoic", "stoicism", "motivation", "inspiration"],
            requestNonPersonalizedAdsOnly,
        });
        appOpenAd.current = ad;

        const unsubscribeLoaded = ad.addAdEventListener(
            AdEventType.LOADED,
            () => {
                isAdLoadedRef.current = true;
                loadedAtRef.current = Date.now();
            }
        );

        const unsubscribeClosed = ad.addAdEventListener(
            AdEventType.CLOSED,
            () => {
                isAdLoadedRef.current = false;
                loadedAtRef.current = 0;
                ad.load();
            }
        );

        const unsubscribeError = ad.addAdEventListener(
            AdEventType.ERROR,
            (error) => {
                logger.warn("AppOpenAd failed to load:", error);
                isAdLoadedRef.current = false;
            }
        );

        ad.load();

        return () => {
            unsubscribeLoaded();
            unsubscribeClosed();
            unsubscribeError();
        };
    }, [adsInitialized, canRequestAds, requestNonPersonalizedAdsOnly]);

    useEffect(() => {
        const subscription = AppState.addEventListener("change", (nextAppState) => {
            if (nextAppState === "background" || nextAppState === "inactive") {
                if (appState.current === "active") {
                    backgroundedAtRef.current = Date.now();
                }
            } else if (
                appState.current.match(/inactive|background/) &&
                nextAppState === "active"
            ) {
                const now = Date.now();
                const backgroundDuration =
                    backgroundedAtRef.current > 0
                        ? now - backgroundedAtRef.current
                        : 0;
                const isExpired =
                    loadedAtRef.current > 0 &&
                    now - loadedAtRef.current >= AD_APP_OPEN_EXPIRY_MS;

                if (isExpired && appOpenAd.current) {
                    isAdLoadedRef.current = false;
                    appOpenAd.current.load();
                } else if (
                    !shownInSessionRef.current &&
                    backgroundDuration >= AD_APP_OPEN_MIN_BACKGROUND_MS &&
                    isAdLoadedRef.current &&
                    appOpenAd.current
                ) {
                    shownInSessionRef.current = true;
                    appOpenAd.current.show();
                }
            }

            appState.current = nextAppState;
        });

        return () => {
            subscription.remove();
        };
    }, []);
};
