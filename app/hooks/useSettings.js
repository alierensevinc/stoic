import {useContext, useEffect, useState} from "react";
import {ThemeContext} from "context/ThemeContext";
import {useNavigation} from "@react-navigation/native";
import {useBookmarksStore} from "store/bookmarksStore";
import {Alert, AppState, Linking, Share} from "react-native";
import * as Notifications from "expo-notifications";
import {MMKV} from "react-native-mmkv";
import * as MailComposer from "expo-mail-composer";
import * as Application from "expo-application";
import analytics from '@react-native-firebase/analytics';

const storage = new MMKV();
const NOTIFICATIONS_ENABLED_KEY = "notificationsEnabled";

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
                "Give Permissions",
                "To enable notifications, please go to your device settings and grant the notification permissions for this app.",
                [
                    {text: "Cancel", style: "cancel"},
                    {text: "Open Settings", onPress: () => Linking.openSettings()},
                ]
            );
            return;
        }
        storage.set(NOTIFICATIONS_ENABLED_KEY, true);
        setNotificationsEnabled(true);
        await analytics().logEvent('notifications_enabled');
    } else {
        storage.set(NOTIFICATIONS_ENABLED_KEY, false);
        setNotificationsEnabled(false);
        await analytics().logEvent('notifications_disabled');
    }
};

const handleSendEmail = async () => {
    const isAvailable = await MailComposer.isAvailableAsync();
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
    await analytics().logEvent('send_email');
};

const handleOpenLinkedin = async () => {
    Linking.openURL("https://www.linkedin.com/in/alierensevinc/");
    await analytics().logEvent('open_linkedin');
};

const handleShare = async () => {
    await Share.share({
        message: "Stoic - Daily Quotes : https://itunes.apple.com/app/6737173970",
    });
    await analytics().logEvent('share_app');
};

const handleRate = async () => {
    Linking.openURL(
        "itms-apps://itunes.apple.com/app/viewContentsUserReviews/id6737173970?action=write-review"
    );
    await analytics().logEvent('rate_app');
};

export const useSettings = () => {
    const {theme} = useContext(ThemeContext);
    const navigation = useNavigation();
    const removeAllBookmarks = useBookmarksStore(
        (state) => state.removeAllBookmarks
    );

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
    };
};