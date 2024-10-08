import React from "react";
import { View, Button } from "react-native";

const SettingsItem = ({ title, onPress, color }) => {
  return (
    <View className="mt-5 px-4 w-full">
      <Button title={title} onPress={onPress} color={color} />
    </View>
  );
};

export default SettingsItem;
