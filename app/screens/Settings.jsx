import React from "react";
import { Text, View } from "react-native";
import { useSettings } from "hooks/useSettings";
import Container from "components/Container";
import BackButton from "components/BackButton";
import InlineAd from "components/InlineAd";
import SettingsItem from "components/SettingsItem";
import SettingsToggleItem from "components/SettingsToggleItem";
import AppInfo from "components/AppInfo";
import Divider from "components/Divider";

const SettingsScreen = () => {
  const {
    theme,
    navigation,
    removeAllBookmarks,
    notificationsEnabled,
    handleToggleNotifications,
    handleSendEmail,
    handleOpenLinkedin,
  } = useSettings();

  const handleDeleteAllBookmarks = () => {
    removeAllBookmarks();
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
        <SettingsToggleItem
          icon="time-outline"
          title="Notifications"
          isToggle={true}
          toggleValue={notificationsEnabled}
          onToggleChange={handleToggleNotifications}
          color={theme.textColor}
        />
        <Divider color={theme.textColor} />
        <SettingsItem
          icon="mail-outline"
          title="Send me an email"
          onPress={handleSendEmail}
          color={theme.buttonColor}
        />
        <SettingsItem
          icon="logo-linkedin"
          title="Reach me on LinkedIn"
          onPress={handleOpenLinkedin}
          color={theme.buttonColor}
        />
        <Divider color={theme.textColor} />
        <SettingsItem
          icon="trash-outline"
          title="Delete All Bookmarks"
          onPress={handleDeleteAllBookmarks}
          color={theme.buttonColor}
        />
      </View>
      <AppInfo theme={theme} />
      <InlineAd className="absolute bottom-0 left-0 right-0 self-center" />
    </Container>
  );
};

export default SettingsScreen;
