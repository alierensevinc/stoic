import { useContext, useEffect, useState } from "react";
import { ThemeContext } from "context/ThemeContext";
import { useNavigation } from "@react-navigation/native";
import { useBookmarksStore } from "store/bookmarksStore";
import { Alert, AppState, Linking, Share } from "react-native";
import * as Notifications from "expo-notifications";
import { MMKV } from "react-native-mmkv";
import * as MailComposer from "expo-mail-composer";
import * as Application from "expo-application";
import * as WebBrowser from 'expo-web-browser';
import * as Haptics from "expo-haptics";
// MODIFIED: Import the new ritual scheduler
import { scheduleDailyRitualNotifications } from "store/quoteStore";

const storage = new MMKV();
const NOTIFICATIONS_ENABLED_KEY = "notificationsEnabled";

const checkNotificationPermission = async (setNotificationsEnabled) => {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") {
        setNotificationsEnabled(false);
        storage.set(NOTIFICATIONS_ENABLED_KEY, false);
    }
};

const handleToggleNotifications = async (value, setNotificationsEnabled) => {
    if (value) {
        // User turned notifications ON
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== "granted") {
            Alert.alert(
                "Permissions Required",
                "To enable notifications, please go to your device settings and grant notification permissions for this app.",
                [
                    { text: "Cancel", style: "cancel" },
                    { text: "Open Settings", onPress: () => Linking.openSettings() },
                ]
            );
            return;
        }
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        storage.set(NOTIFICATIONS_ENABLED_KEY, true);
        setNotificationsEnabled(true);

        // MODIFIED: Call the ritual scheduler directly.
        // DO NOT call loadQuotes() here.
        await scheduleDailyRitualNotifications();
        console.log("Notifications enabled and rituals scheduled by user.");

    } else {
        // User turned notifications OFF
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        storage.set(NOTIFICATIONS_ENABLED_KEY, false);
        setNotificationsEnabled(false);

        // MODIFIED: Cancel all (both morning and evening) notifications
        await Notifications.cancelAllScheduledNotificationsAsync();
        console.log("Notifications disabled and all scheduled notifications cancelled.");
    }
};

const handleSendEmail = async () => {
    const isAvailable = await MailComposer.isAvailableAsync();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);

    if (!isAvailable) {
        Linking.openURL(
            "mailto:sevinc.aeren@gmail.com?subject=Hello from Stoic App&body=" +
            Application.nativeApplicationVersion
        );
    }

    const options = {
        recipients: ["sevinc.aeren@gmail.com"],
        subject: "Hello from Stoic App",
        body: Application.nativeApplicationVersion,
    };

    await MailComposer.composeAsync(options);
};

const handleOpenLinkedin = async () => {
    Linking.openURL("https://www.linkedin.com/in/alierensevinc/");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
};

const handleShare = async () => {
    await Share.share({
        message: "Stoic - Daily Quotes : https://itunes.apple.com/app/6737173970",
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
};

const handleRate = async () => {
    Linking.openURL(
        "itms-apps://itunes.apple.com/app/viewContentsUserReviews/id6737173970?action=write-review"
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
};

const handleVisitPrivacyPolicy = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    await WebBrowser.openBrowserAsync('https://alierensevinc.github.io/stoic-website/privacy-policy/');
};

export const useSettings = () => {
    const { theme } = useContext(ThemeContext);
    const navigation = useNavigation();
    const clearBookmarks = useBookmarksStore(
        (state) => state.removeAllBookmarks
    );

    const removeAllBookmarks = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        Alert.alert(
            "Delete All Bookmarks",
            "Are you sure you want to delete all your bookmarks? This action cannot be undone.",
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Delete",
                    onPress: () => {
                        clearBookmarks();
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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
        handleVisitPrivacyPolicy
    };
};