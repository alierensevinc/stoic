import { useState, useEffect } from "react";
import { View } from "react-native";
import {
  BannerAd,
  BannerAdSize,
  TestIds,
} from "react-native-google-mobile-ads";
import { IOS_ADMOB_BANNER } from "@env";
import * as TrackingTransparency from "expo-tracking-transparency";

const InlineAd = () => {
  const [isAdLoaded, setIsAdLoaded] = useState(false);
  const [requestNonPersonalizedAdsOnly, setRequestNonPersonalizedAdsOnly] =
    useState(false);
  const adUnitId = __DEV__ ? TestIds.BANNER : IOS_ADMOB_BANNER;

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
  }, []);

  return (
    <View style={{ height: isAdLoaded ? "auto" : 0 }}>
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly,
        }}
        onAdLoaded={() => {
          setIsAdLoaded(true);
        }}
      />
    </View>
  );
};

export default InlineAd;