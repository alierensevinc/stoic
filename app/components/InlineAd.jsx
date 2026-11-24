import {useState} from "react";
import {Platform, View} from "react-native";
import {BannerAd, BannerAdSize, TestIds} from "react-native-google-mobile-ads";
import {useAdStore} from "store/adStore";

const adUnitId = __DEV__
    ? TestIds.BANNER
    : Platform.OS === "ios"
      ? process.env.EXPO_PUBLIC_IOS_ADMOB_BANNER || TestIds.BANNER
      : process.env.EXPO_PUBLIC_ANDROID_ADMOB_BANNER || TestIds.BANNER;

const InlineAd = ({style, className}) => {
    const [isAdLoaded, setIsAdLoaded] = useState(false);
    const adsInitialized = useAdStore((s) => s.adsInitialized);
    const canRequestAds = useAdStore((s) => s.canRequestAds);
    const requestNonPersonalizedAdsOnly = useAdStore(
        (s) => s.requestNonPersonalizedAdsOnly
    );

    if (!adsInitialized || !canRequestAds) {
        return null;
    }

    return (
        <View className={className} style={[{height: isAdLoaded ? "auto" : 0}, style]}>
            <BannerAd
                unitId={adUnitId}
                size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
                requestOptions={{
                    requestNonPersonalizedAdsOnly,
                }}
                onAdLoaded={() => {
                    setIsAdLoaded(true);
                }}
                onAdFailedToLoad={() => {
                    setIsAdLoaded(false);
                }}
            />
        </View>
    );
};

export default InlineAd;
