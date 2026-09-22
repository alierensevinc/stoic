import { useContext, useEffect, useState } from "react";
import { ThemeContext } from "context/ThemeContext";
import { useNavigation } from "@react-navigation/native";
import { useBookmarksStore } from "store/bookmarksStore";
import { ALL_AUTHORS, useQuoteStore } from "store/quoteStore";
import { Alert, AppState, Linking, Share } from "react-native";
import * as Notifications from "expo-notifications";
import { MMKV } from "react-native-mmkv";
import * as MailComposer from "expo-mail-composer";
import * as Application from "expo-application";
import * as WebBrowser from 'expo-web-browser';
import * as Haptics from "expo-haptics";
import {
    getRitualHours,
    scheduleDailyRitualNotifications,
    setRitualHour,
} from "utils/notificationScheduler";

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

        await scheduleDailyRitualNotifications();
        console.log("Notifications enabled and rituals scheduled by user.");

    } else {
        // User turned notifications OFF
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        storage.set(NOTIFICATIONS_ENABLED_KEY, false);
        setNotificationsEnabled(false);

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

    // Ritual (notification) time customization
    const [ritualHours, setRitualHoursState] = useState(getRitualHours());
    const [morningPickerVisible, setMorningPickerVisible] = useState(false);
    const [eveningPickerVisible, setEveningPickerVisible] = useState(false);

    const handleSelectRitualHour = async (ritual, hour) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setRitualHour(ritual, hour);
        setRitualHoursState((prev) => ({ ...prev, [ritual]: hour }));
        setMorningPickerVisible(false);
        setEveningPickerVisible(false);
        if (notificationsEnabled) {
            await scheduleDailyRitualNotifications();
        }
    };

    // Philosopher/category filter
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