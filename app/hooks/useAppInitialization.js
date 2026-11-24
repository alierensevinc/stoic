import {useEffect, useState} from "react";
import {AppState, Platform} from "react-native";
import mobileAds, {AdsConsent} from "react-native-google-mobile-ads";
import * as TrackingTransparency from "expo-tracking-transparency";
import {useAdStore} from "store/adStore";
import {logger} from "utils/logger";

let consentFlowStarted = false;

export const runConsentAndAdInitialization = async () => {
    if (consentFlowStarted) {
        return;
    }
    consentFlowStarted = true;

    let canRequestAds = true;
    let privacyOptionsRequired = false;

    try {
        const consentInfo = await AdsConsent.gatherConsent();
        canRequestAds = consentInfo?.canRequestAds ?? true;
        privacyOptionsRequired =
            consentInfo?.privacyOptionsRequirementStatus === "REQUIRED";
    } catch (e) {
        logger.warn("UMP consent gathering skipped or failed:", e);
    }

    let requestNonPersonalizedAdsOnly = true;
    if (Platform.OS === "ios") {
        try {
            const {status} =
                await TrackingTransparency.requestTrackingPermissionsAsync();
            requestNonPersonalizedAdsOnly = status !== "granted";
        } catch (e) {
            logger.warn("ATT permission check failed:", e);
        }
    } else {
        requestNonPersonalizedAdsOnly = false;
    }

    let adsInitialized = false;
    if (canRequestAds) {
        try {
            await mobileAds().initialize();
            adsInitialized = true;
        } catch (e) {
            logger.warn("MobileAds initialization failed:", e);
        }
    }

    useAdStore.getState().setConsentState({
        adsInitialized,
        canRequestAds,
        requestNonPersonalizedAdsOnly,
        privacyOptionsRequired,
    });
};

/**
 * Non-blocking app initialization: returns `true` immediately so the UI
 * renders as soon as fonts settle, and runs UMP + ATT + AdMob initialization
 * asynchronously once the app is in the foreground.
 */
export const useAppInitialization = () => {
    const [appIsReady] = useState(true);

    useEffect(() => {
        if (AppState.currentState === "active") {
            runConsentAndAdInitialization();
            return;
        }

        const sub = AppState.addEventListener("change", (nextState) => {
            if (nextState === "active") {
                runConsentAndAdInitialization();
                sub.remove();
            }
        });

        return () => sub.remove();
    }, []);

    return appIsReady;
};
