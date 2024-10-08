import React, { useState, useEffect } from "react";
import { Text, View, Alert, Linking, AppState } from "react-native";
import { useSettings } from "hooks/useSettings";
import Container from "components/Container";
import BackButton from "components/BackButton";
import InlineAd from "components/InlineAd";
import SettingsItem from "components/SettingsItem";
import SettingsToggleItem from "components/SettingsToggleItem";
import * as Notifications from "expo-notifications";

const SettingsScreen = () => {
  const { theme, navigation, removeAllBookmarks } = useSettings();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    // Check the current notification permission status
    const checkNotificationPermission = async () => {
      const { status } = await Notifications.getPermissionsAsync();
      setNotificationsEnabled(status === "granted");
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

  const handleDeleteAllBookmarks = () => {
    removeAllBookmarks();
  };

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
        setNotificationsEnabled(false);
        return;
      }
    } else {
      Alert.alert(
        "Revoke Permissions",
        "To disable notifications, please go to your device settings and revoke the notification permissions for this app.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Open Settings", onPress: () => Linking.openSettings() },
        ]
      );
    }
    setNotificationsEnabled(value);
  };

  return (
    <Container>
      <BackButton
        onPress={() => navigation.goBack()}
        color={theme.buttonColor}
      />
      <View className="flex-1 justify-start w-100">
        <Text
          className="text-2xl font-bold mb-5 text-center"
          style={{ color: theme.textColor, fontFamily: "Montserrat-Medium" }}
        >
          Settings
        </Text>
        <SettingsItem
          title="Delete All Bookmarks"
          onPress={handleDeleteAllBookmarks}
          color={theme.buttonColor}
        />
        <SettingsToggleItem
          title="Enable Notifications"
          isToggle={true}
          toggleValue={notificationsEnabled}
          onToggleChange={handleToggleNotifications}
          color={theme.textColor}
        />
      </View>
      <InlineAd className="absolute bottom-0 left-0 right-0 self-center" />
    </Container>
  );
};

export default SettingsScreen;
