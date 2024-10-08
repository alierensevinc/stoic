import React from "react";
import { Text, View, Button } from "react-native";
import { useSettings } from "hooks/useSettings";
import Container from "components/Container";
import BackButton from "components/BackButton";
import InlineAd from "components/InlineAd";

const SettingsScreen = () => {
  const { theme, navigation, removeAllBookmarks } = useSettings();

  const handleDeleteAllBookmarks = () => {
    removeAllBookmarks();
  };

  return (
    <Container>
      <BackButton
        onPress={() => navigation.goBack()}
        color={theme.buttonColor}
      />
      <View style={{ flex: 1, justifyContent: "flex-start", width: "100%" }}>
        <Text
          className="text-2xl font-bold mb-5 text-center"
          style={{ color: theme.textColor, fontFamily: "Montserrat-Medium" }}
        >
          Settings
        </Text>
        <View className="mt-5">
          <Button
            title="Delete All Bookmarks"
            onPress={handleDeleteAllBookmarks}
            color={theme.buttonColor}
          />
        </View>
      </View>
      <InlineAd className="absolute bottom-0 left-0 right-0 self-center" />
    </Container>
  );
};

export default SettingsScreen;
