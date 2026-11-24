import {useContext, useEffect, useState} from "react";
import {Alert, AppState, Linking, Platform, Share} from "react-native";
import {useNavigation} from "@react-navigation/native";
import * as Notifications from "expo-notifications";
import * as MailComposer from "expo-mail-composer";
import * as Application from "expo-application";
import * as WebBrowser from "expo-web-browser";
import * as Haptics from "expo-haptics";
import {AdsConsent} from "react-native-google-mobile-ads";
import {ThemeContext} from "context/ThemeContext";
import {useBookmarksStore} from "store/bookmarksStore";
import {ALL_AUTHORS, useQuoteStore} from "store/quoteStore";
import {useAdStore} from "store/adStore";
import {
    getRitualHours,
    NOTIFICATIONS_ENABLED_KEY,
    scheduleDailyRitualNotifications,
    setRitualHour,
} from "utils/notificationScheduler";
import {
    APP_STORE_REVIEW_URL,
    APP_STORE_URL,
    CONTACT_EMAIL,
    LINKEDIN_URL,
    PRIVACY_POLICY_URL,
} from "utils/constants";
import {storage} from "utils/storage";
import {logAnalyticsEvent} from "utils/telemetry";
import {logger} from "utils/logger";

const checkNotificationPermission = async (setNotificationsEnabled) => {
    const {status} = await Notifications.getPermissionsAsync();
    if (status !== "granted") {
        setNotificationsEnabled(false);
        storage.set(NOTIFICATIONS_ENABLED_KEY, false);
    }
};

const handleToggleNotifications = async (value, setNotificationsEnabled) => {
    if (value) {
        const {status} = await Notifications.requestPermissionsAsync();
        if (status !== "granted") {
            Alert.alert(
                "Permissions Required",
                "To enable notifications, please go to your device settings and grant notification permissions for this app.",
                [
                    {text: "Cancel", style: "cancel"},
                    {text: "Open Settings", onPress: () => Linking.openSettings()},
                ]
            );
            return;
        }
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        storage.set(NOTIFICATIONS_ENABLED_KEY, true);
        setNotificationsEnabled(true);

        await scheduleDailyRitualNotifications();
        logAnalyticsEvent("notification_toggle", {enabled: 1});
    } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        storage.set(NOTIFICATIONS_ENABLED_KEY, false);
        setNotificationsEnabled(false);

        await Notifications.cancelAllScheduledNotificationsAsync();
        logAnalyticsEvent("notification_toggle", {enabled: 0});
    }
};

const handleSendEmail = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    const isAvailable = await MailComposer.isAvailableAsync();
    const version = Application.nativeApplicationVersion || "3.0.0";

    if (!isAvailable) {
        await Linking.openURL(
            `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
                "Hello from Stoic App"
            )}&body=${encodeURIComponent(`Version: ${version}`)}`
        );
        return;
    }

    await MailComposer.composeAsync({
        recipients: [CONTACT_EMAIL],
        subject: "Hello from Stoic App",
        body: `Version: ${version}`,
    });
};

const handleOpenLinkedin = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    await Linking.openURL(LINKEDIN_URL);
};

const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    await Share.share({
        message: `Stoic - Daily Quotes : ${APP_STORE_URL}`,
    });
};

const handleRate = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    await Linking.openURL(APP_STORE_REVIEW_URL);
};

const handleVisitPrivacyPolicy = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    await WebBrowser.openBrowserAsync(PRIVACY_POLICY_URL);
};

const handleShowPrivacyOptions = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    try {
        await AdsConsent.showPrivacyOptionsForm();
    } catch (e) {
        logger.warn("showPrivacyOptionsForm failed:", e);
    }
};

export const useSettings = () => {
    const {
        theme,
        matchAppIconToTheme,
        toggleMatchAppIconToTheme,
    } = useContext(ThemeContext);
    const navigation = useNavigation();
    const clearBookmarks = useBookmarksStore(
        (state) => state.removeAllBookmarks
    );
    const privacyOptionsRequired = useAdStore(
        (state) => state.privacyOptionsRequired
    );

    const removeAllBookmarks = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        Alert.alert(
            "Delete All Bookmarks",
            "Are you sure you want to delete all your bookmarks? This action cannot be undone.",
            [
                {text: "Cancel", style: "cancel"},
                {
                    text: "Delete",
                    onPress: () => {
                        clearBookmarks();
                        Haptics.notificationAsync(
                            Haptics.NotificationFeedbackType.Success
                        );
                    },
                    style: "destructive",
                },
            ]
        );
    };

    const [notificationsEnabled, setNotificationsEnabled] = useState(
        storage.getBoolean(NOTIFICATIONS_ENABLED_KEY) ?? false
    );

    useEffect(() => {
        checkNotificationPermission(setNotificationsEnabled);

        const appStateListener = AppState.addEventListener(
            "change",
            (nextAppState) => {
                if (nextAppState === "active") {
                    checkNotificationPermission(setNotificationsEnabled);
                }
            }
        );

        return () => {
            appStateListener.remove();
        };
    }, []);

    const [ritualHours, setRitualHoursState] = useState(getRitualHours());
    const [morningPickerVisible, setMorningPickerVisible] = useState(false);
    const [eveningPickerVisible, setEveningPickerVisible] = useState(false);

    const handleSelectRitualHour = async (ritual, hour) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setRitualHour(ritual, hour);
        setRitualHoursState((prev) => ({...prev, [ritual]: hour}));
        setMorningPickerVisible(false);
        setEveningPickerVisible(false);
        if (notificationsEnabled) {
            await scheduleDailyRitualNotifications();
        }
    };

    const preferredAuthors = useQuoteStore((state) => state.preferredAuthors);
    const setAuthorFilter = useQuoteStore((state) => state.setAuthorFilter);
    const [authorFilterVisible, setAuthorFilterVisible] = useState(false);

    const handleToggleAuthor = (author) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (author === null) {
            setAuthorFilter([]);
            return;
        }
        const next = preferredAuthors.includes(author)
            ? preferredAuthors.filter((a) => a !== author)
            : [...preferredAuthors, author];
        setAuthorFilter(next);
    };

    return {
        theme,
        navigation,
        removeAllBookmarks,
        notificationsEnabled,
        handleToggleNotifications: (value) =>
            handleToggleNotifications(value, setNotificationsEnabled),
        handleSendEmail,
        handleOpenLinkedin,
        handleShare,
        handleRate,
        handleVisitPrivacyPolicy,
        privacyOptionsRequired,
        handleShowPrivacyOptions,
        matchAppIconToTheme,
        toggleMatchAppIconToTheme,
        isIos: Platform.OS === "ios",
        ritualHours,
        morningPickerVisible,
        eveningPickerVisible,
        openMorningPicker: () => setMorningPickerVisible(true),
        closeMorningPicker: () => setMorningPickerVisible(false),
        openEveningPicker: () => setEveningPickerVisible(true),
        closeEveningPicker: () => setEveningPickerVisible(false),
        handleSelectRitualHour,
        authors: ALL_AUTHORS,
        preferredAuthors,
        authorFilterVisible,
        openAuthorFilter: () => setAuthorFilterVisible(true),
        closeAuthorFilter: () => setAuthorFilterVisible(false),
        handleToggleAuthor,
    };
};
