import { useContext, useState, useEffect } from "react";
import { ThemeContext } from "context/ThemeContext";
import { useNavigation } from "@react-navigation/native";
import { useBookmarksStore } from "store/bookmarksStore";
import { AppState, Alert, Linking } from "react-native";
import * as Notifications from "expo-notifications";
import { MMKV } from "react-native-mmkv";
import * as MailComposer from "expo-mail-composer";
import * as Application from "expo-application";
import { Share } from "react-native";

const storage = new MMKV();
const NOTIFICATIONS_ENABLED_KEY = "notificationsEnabled";

export const useSettings = () => {
  const { theme } = useContext(ThemeContext);
  const navigation = useNavigation();
  const removeAllBookmarks = useBookmarksStore(
    (state) => state.removeAllBookmarks
  );

  const [notificationsEnabled, setNotificationsEnabled] = useState(
    storage.getBoolean(NOTIFICATIONS_ENABLED_KEY) ?? false
  );

  useEffect(() => {
    const checkNotificationPermission = async () => {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== "granted") {
        setNotificationsEnabled(false);
        storage.set(NOTIFICATIONS_ENABLED_KEY, false);
      }
    };

    checkNotificationPermission();

    // Add AppState listener
    const appStateListener = AppState.addEventListener(
      "change",
      (nextAppState) => {
        if (nextAppState === "active") {
          checkNotificationPermission();
        }
      }
    );

    // Cleanup listener on unmount
    return () => {
      appStateListener.remove();
    };
  }, []);

  const handleToggleNotifications = async (value) => {
    if (value) {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Give Permissions",
          "To enable notifications, please go to your device settings and grant the notification permissions for this app.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Open Settings", onPress: () => Linking.openSettings() },
          ]
        );
        return;
      }
      storage.set(NOTIFICATIONS_ENABLED_KEY, true);
      setNotificationsEnabled(true);
    } else {
      storage.set(NOTIFICATIONS_ENABLED_KEY, false);
      setNotificationsEnabled(false);
    }
  };

  const handleSendEmail = async () => {
    const isAvailable = await MailComposer.isAvailableAsync();
    if (!isAvailable) {
      Alert.alert("Mail Composer is not available on this device");
      return;
    }

    const options = {
      recipients: ["sevinc.aeren@gmail.com"],
      subject: "Hello from Stoic App",
      body: Application.nativeApplicationVersion,
    };

    try {
      await MailComposer.composeAsync(options);
      Alert.alert("Email sent successfully");
    } catch (error) {
      Alert.alert("Failed to send email", error.message);
    }
  };

  const handleOpenLinkedin = () => {
    Linking.openURL("https://www.linkedin.com/in/alierensevinc/");
  };

  return {
    theme,
    navigation,
    removeAllBookmarks,
    notificationsEnabled,
    handleToggleNotifications,
    handleSendEmail,
    handleOpenLinkedin,
  };
};
