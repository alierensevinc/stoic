import {useEffect, useRef, useState} from "react";
import {AdEventType, InterstitialAd, TestIds,} from "react-native-google-mobile-ads";
import {IOS_ADMOB_INTERSTITIAL} from "@env";
import * as TrackingTransparency from "expo-tracking-transparency";

const adUnitId = __DEV__ ? TestIds.INTERSTITIAL : IOS_ADMOB_INTERSTITIAL;

export const useInterstitialAd = () => {
    const [isAdLoaded, setIsAdLoaded] = useState(false);
    const [requestNonPersonalizedAdsOnly, setRequestNonPersonalizedAdsOnly] =
        useState(false);
    const interstitial = useRef(null);

    useEffect(() => {
        const requestTrackingPermission = async () => {
            const {status} =
                await TrackingTransparency.requestTrackingPermissionsAsync();
            if (status === "granted") {
                setRequestNonPersonalizedAdsOnly(false);
            } else {
                setRequestNonPersonalizedAdsOnly(true);
            }
        };

        requestTrackingPermission();

        interstitial.current = InterstitialAd.createForAdRequest(adUnitId, {
            keywords: ["stoic", "stoicism", "motivation", "inspiration"],
            requestNonPersonalizedAdsOnly,
        });

        const unsubscribeLoaded = interstitial.current.addAdEventListener(
            AdEventType.LOADED,
            () => {
                setIsAdLoaded(true);
            }
        );

        const unsubscribeClosed = interstitial.current.addAdEventListener(
            AdEventType.CLOSED,
            () => {
                setIsAdLoaded(false);
                interstitial.current.load();
            }
        );

        interstitial.current.load();

        return () => {
            unsubscribeLoaded();
            unsubscribeClosed();
        };
    }, [requestNonPersonalizedAdsOnly]);

    const showAd = () => {
        if (isAdLoaded && interstitial.current) {
            interstitial.current.show();
        }
    };

    return {isAdLoaded, showAd};
};