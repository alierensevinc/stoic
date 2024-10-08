import React from "react";
import { TouchableOpacity, StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";

const SettingsButton = ({ theme }) => {
  const navigation = useNavigation();

  const navigateToSettings = () => {
    navigation.navigate("Settings");
  };

  return (
    <View className="absolute flex-row items-center rounded-2xl p-1 top-16 left-8 z-10">
      <TouchableOpacity onPress={navigateToSettings}>
        <Icon name="settings-outline" size={24} color={theme.iconColor} />
      </TouchableOpacity>
    </View>
  );
};

export default SettingsButton;
