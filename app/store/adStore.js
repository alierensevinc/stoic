import {create} from "zustand";
import {
    AD_INTERSTITIAL_ACTION_INTERVAL,
    AD_INTERSTITIAL_COOLDOWN_MS,
} from "utils/constants";

export const useAdStore = create((set, get) => ({
    actionCount: 0,
    lastInterstitialShownAt: 0,
    adsInitialized: false,
    canRequestAds: false,
    requestNonPersonalizedAdsOnly: true,
    privacyOptionsRequired: false,

    setConsentState: ({
        adsInitialized,
        canRequestAds,
        requestNonPersonalizedAdsOnly,
        privacyOptionsRequired,
    }) =>
        set((state) => ({
            adsInitialized: adsInitialized ?? state.adsInitialized,
            canRequestAds: canRequestAds ?? state.canRequestAds,
            requestNonPersonalizedAdsOnly:
                requestNonPersonalizedAdsOnly ?? state.requestNonPersonalizedAdsOnly,
            privacyOptionsRequired:
                privacyOptionsRequired ?? state.privacyOptionsRequired,
        })),

    /**
     * Records a user interaction and returns true when an interstitial ad
     * should be shown (respecting both action interval and cooldown).
     */
    recordActionAndShouldShowInterstitial: () => {
        const {actionCount, lastInterstitialShownAt, adsInitialized, canRequestAds} =
            get();
        const nextCount = actionCount + 1;
        set({actionCount: nextCount});

        if (!adsInitialized || !canRequestAds) {
            return false;
        }

        const now = Date.now();
        const cooldownElapsed =
            now - lastInterstitialShownAt >= AD_INTERSTITIAL_COOLDOWN_MS;

        return (
            nextCount % AD_INTERSTITIAL_ACTION_INTERVAL === 0 && cooldownElapsed
        );
    },

    markInterstitialShown: () =>
        set({
            actionCount: 0,
            lastInterstitialShownAt: Date.now(),
        }),

    incrementActionCount: () =>
        set((state) => ({actionCount: state.actionCount + 1})),
    resetActionCount: () => set({actionCount: 0}),
}));
