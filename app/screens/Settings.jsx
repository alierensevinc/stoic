import React from "react";
import { Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSettings } from "hooks/useSettings";
import Container from "components/Container";
import BackButton from "components/BackButton";

const SettingsScreen = () => {
  const { theme, navigation } = useSettings();

  return (
    <Container>
      <BackButton
        onPress={() => navigation.goBack()}
        color={theme.buttonColor}
      />
      <Text
        className="text-2xl font-bold mb-5 text-center"
        style={{ color: theme.textColor, fontFamily: "Montserrat-Medium" }}
      >
        Settings
      </Text>
    </Container>
  );
};

export default SettingsScreen;
