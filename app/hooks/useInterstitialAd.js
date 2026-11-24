import {useCallback, useEffect} from "react";
import {Platform} from "react-native";
import {AdEventType, InterstitialAd, TestIds} from "react-native-google-mobile-ads";
import {useAdStore} from "store/adStore";
import {logger} from "utils/logger";

const adUnitId = __DEV__
    ? TestIds.INTERSTITIAL
    : Platform.OS === "ios"
      ? process.env.EXPO_PUBLIC_IOS_ADMOB_INTERSTITIAL || TestIds.INTERSTITIAL
      : process.env.EXPO_PUBLIC_ANDROID_ADMOB_INTERSTITIAL || TestIds.INTERSTITIAL;

let sharedInterstitial = null;
let sharedIsLoaded = false;
let sharedIsLoading = false;
let lastNonPersonalizedSetting = null;

const ensureSharedInterstitial = (requestNonPersonalizedAdsOnly) => {
    if (
        sharedInterstitial &&
        lastNonPersonalizedSetting === requestNonPersonalizedAdsOnly
    ) {
        if (!sharedIsLoaded && !sharedIsLoading) {
            sharedIsLoading = true;
            sharedInterstitial.load();
        }
        return;
    }

    lastNonPersonalizedSetting = requestNonPersonalizedAdsOnly;
    sharedIsLoaded = false;
    sharedIsLoading = true;

    sharedInterstitial = InterstitialAd.createForAdRequest(adUnitId, {
        keywords: ["stoic", "stoicism", "motivation", "inspiration"],
        requestNonPersonalizedAdsOnly,
    });

    sharedInterstitial.addAdEventListener(AdEventType.LOADED, () => {
        sharedIsLoaded = true;
        sharedIsLoading = false;
    });

    sharedInterstitial.addAdEventListener(AdEventType.CLOSED, () => {
        sharedIsLoaded = false;
        sharedIsLoading = true;
        sharedInterstitial?.load();
    });

    sharedInterstitial.addAdEventListener(AdEventType.ERROR, (err) => {
        logger.warn("InterstitialAd failed to load:", err);
        sharedIsLoaded = false;
        sharedIsLoading = false;
    });

    sharedInterstitial.load();
};

export const useInterstitialAd = () => {
    const adsInitialized = useAdStore((s) => s.adsInitialized);
    const canRequestAds = useAdStore((s) => s.canRequestAds);
    const requestNonPersonalizedAdsOnly = useAdStore(
        (s) => s.requestNonPersonalizedAdsOnly
    );
    const recordActionAndShouldShowInterstitial = useAdStore(
        (s) => s.recordActionAndShouldShowInterstitial
    );
    const markInterstitialShown = useAdStore((s) => s.markInterstitialShown);

    useEffect(() => {
        if (!adsInitialized || !canRequestAds) {
            return;
        }
        ensureSharedInterstitial(requestNonPersonalizedAdsOnly);
    }, [adsInitialized, canRequestAds, requestNonPersonalizedAdsOnly]);

    const showAd = useCallback(() => {
        if (sharedIsLoaded && sharedInterstitial) {
            sharedInterstitial.show();
            markInterstitialShown();
            return true;
        }
        return false;
    }, [markInterstitialShown]);

    const handleAction = useCallback(
        (callback) => {
            const shouldShow = recordActionAndShouldShowInterstitial();
            if (shouldShow && sharedIsLoaded && sharedInterstitial) {
                sharedInterstitial.show();
                markInterstitialShown();
            }
            if (typeof callback === "function") {
                callback();
            }
        },
        [recordActionAndShouldShowInterstitial, markInterstitialShown]
    );

    return {
        isAdLoaded: sharedIsLoaded,
        showAd,
        handleAction,
    };
};
