import {getAnalytics, logEvent, logScreenView} from "@react-native-firebase/analytics";
import {getCrashlytics, recordError} from "@react-native-firebase/crashlytics";
import {logger} from "utils/logger";

export const logAnalyticsEvent = async (eventName, params = {}) => {
    try {
        await logEvent(getAnalytics(), eventName, params);
    } catch (e) {
        logger.warn(`Analytics logEvent(${eventName}) failed:`, e);
    }
};

export const logAnalyticsScreen = async (screenName) => {
    try {
        await logScreenView(getAnalytics(), {
            screen_name: screenName,
            screen_class: screenName,
        });
    } catch (e) {
        logger.warn(`Analytics logScreenView(${screenName}) failed:`, e);
    }
};

export const recordCrashlyticsError = (error, context = "") => {
    try {
        const err = error instanceof Error ? error : new Error(String(error));
        recordError(getCrashlytics(), err, context || undefined);
    } catch (e) {
        logger.warn("Crashlytics recordError failed:", e);
    }
};
