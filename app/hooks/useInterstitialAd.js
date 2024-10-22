import { useEffect, useState } from "react";
import {
  AdEventType,
  InterstitialAd,
  TestIds,
} from "react-native-google-mobile-ads";
import { IOS_ADMOB_INTERSTITIAL } from "@env";
import * as TrackingTransparency from "expo-tracking-transparency";

const adUnitId = __DEV__ ? TestIds.INTERSTITIAL : IOS_ADMOB_INTERSTITIAL;

export const useInterstitialAd = () => {
  const [isAdLoaded, setIsAdLoaded] = useState(false);
  const [requestNonPersonalizedAdsOnly, setRequestNonPersonalizedAdsOnly] =
    useState(false);

  useEffect(() => {
    const requestTrackingPermission = async () => {
      const { status } =
        await TrackingTransparency.requestTrackingPermissionsAsync();
      if (status === "granted") {
        setRequestNonPersonalizedAdsOnly(false);
      } else {
        setRequestNonPersonalizedAdsOnly(true);
      }
    };

    requestTrackingPermission();

    const interstitial = InterstitialAd.createForAdRequest(adUnitId, {
      keywords: ["stoic", "stoicism", "motivation", "inspiration"],
      requestNonPersonalizedAdsOnly,
    });

    const unsubscribeLoaded = interstitial.addAdEventListener(
      AdEventType.LOADED,
      () => {
        setIsAdLoaded(true);
      }
    );

    const unsubscribeClosed = interstitial.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        setIsAdLoaded(false);
        interstitial.load();
      }
    );

    interstitial.load();

    return () => {
      unsubscribeLoaded();
      unsubscribeClosed();
    };
  }, [requestNonPersonalizedAdsOnly]);

  const showAd = () => {
    if (isAdLoaded) {
      interstitial.show();
    }
  };

  return { isAdLoaded, showAd };
};
