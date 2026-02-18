import {useEffect, useRef, useState} from "react";
import {AdEventType, AppOpenAd, TestIds,} from "react-native-google-mobile-ads";
import {AppState, Platform} from "react-native";
import {ANDROID_ADMOB_OPEN, IOS_ADMOB_OPEN} from "@env";
import * as TrackingTransparency from "expo-tracking-transparency";

// 1. Doğru Ad Unit ID'lerini seç
const adUnitId = __DEV__
    ? TestIds.APP_OPEN
    : Platform.OS === 'ios'
        ? IOS_ADMOB_OPEN
        : ANDROID_ADMOB_OPEN;

export const useOpenAd = () => {
    // Reklamın yüklenip yüklenmediğini takip et
    const [isAdLoaded, setIsAdLoaded] = useState(false);
    // Takip izni durumunu tut
    const [requestNonPersonalizedAdsOnly, setRequestNonPersonalizedAdsOnly] =
        useState(true); // Güvenli varsayılan
    // Reklam örneğini (instance) tut
    const appOpenAd = useRef(null);
    // Uygulamanın mevcut durumunu (active, background) tut
    const appState = useRef(AppState.currentState);

    // 1. Adım: Uygulama açıldığında bir kez takip izni iste
    useEffect(() => {
        const requestTrackingPermission = async () => {
            const {status} =
                await TrackingTransparency.requestTrackingPermissionsAsync();
            // İzin verilmezse, kişiselleştirilmemiş reklam iste
            setRequestNonPersonalizedAdsOnly(status !== "granted");
        };

        requestTrackingPermission();
    }, []);

    // 2. Adım: İzin durumu değiştikçe veya ilk açılışta reklamı yükle
    useEffect(() => {
        // Zaten yüklü bir reklam varsa, dokunma
        if (isAdLoaded) {
            return;
        }

        // Yeni bir AppOpenAd örneği oluştur
        appOpenAd.current = AppOpenAd.createForAdRequest(adUnitId, {
            keywords: ["stoic", "stoicism", "motivation", "inspiration"],
            requestNonPersonalizedAdsOnly,
        });

        // Reklam yüklendiğinde
        const unsubscribeLoaded = appOpenAd.current.addAdEventListener(
            AdEventType.LOADED,
            () => {
                console.log("AppOpenAd loaded.");
                setIsAdLoaded(true);
            }
        );

        // Reklam kapatıldığında (kullanıcı tarafından)
        const unsubscribeClosed = appOpenAd.current.addAdEventListener(
            AdEventType.CLOSED,
            () => {
                console.log("AppOpenAd closed, reloading...");
                setIsAdLoaded(false);
                // Bir sonraki uygulama açılışı için hemen yenisini yükle
                appOpenAd.current.load();
            }
        );

        // Reklam yüklenirken hata olursa
        const unsubscribeError = appOpenAd.current.addAdEventListener(
            AdEventType.ERROR,
            (error) => {
                console.warn("AppOpenAd failed to load:", error);
                setIsAdLoaded(false);
            }
        );

        // Reklamı yüklemeye başla
        appOpenAd.current.load();

        // Hook kaldırıldığında (unmount) dinleyicileri temizle
        return () => {
            unsubscribeLoaded();
            unsubscribeClosed();
            unsubscribeError();
        };
        // Bu effect, takip izni durumu değiştiğinde yeniden çalışır
    }, [isAdLoaded, requestNonPersonalizedAdsOnly]);

    // 3. Adım: Uygulama durumunu dinle ve reklamı göster
    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextAppState) => {

            // Eğer uygulama 'background' veya 'inactive' durumundan 'active' duruma geçiyorsa...
            if (
                appState.current.match(/inactive|background/) &&
                nextAppState === 'active' &&
                isAdLoaded && // ...ve reklam yüklendiyse
                appOpenAd.current
            ) {
                console.log("App came to foreground, showing AppOpenAd.");
                appOpenAd.current.show(); // Reklamı göster
            }

            // Mevcut durumu güncelle
            appState.current = nextAppState;
        });

        // Hook kaldırıldığında dinleyiciyi temizle
        return () => {
            subscription.remove();
        };
    }, [isAdLoaded]); // 'isAdLoaded' değiştiğinde bu dinleyiciyi yeniden kur
};