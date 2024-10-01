import { useState } from "react";
import { View } from "react-native";
import {
  BannerAd,
  BannerAdSize,
  TestIds,
} from "react-native-google-mobile-ads";
import { IOS_ADMOB_BANNER } from "@env";

const InlineAd = () => {
  const [isAdLoaded, setIsAdLoaded] = useState(false);
  const adUnitId = __DEV__ ? TestIds.BANNER : IOS_ADMOB_BANNER;

  return (
    <View style={{ height: isAdLoaded ? "auto" : 0 }}>
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdLoaded={() => {
          setIsAdLoaded(true);
        }}
      />
    </View>
  );
};

export default InlineAd;
