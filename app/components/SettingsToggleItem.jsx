import React from "react";
import { View, Button, Switch, Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

const SettingsToggleItem = ({
  title,
  icon,
  color,
  toggleValue,
  onToggleChange,
}) => {
  return (
    <View className="mt-5 px-6 w-full flex-row items-center justify-between">
      <View className="flex-row items-center">
        <Ionicons name={icon} size={24} color={color} />
        <Text className="text-lg ml-4" style={{ color }}>
          {title}
        </Text>
      </View>
      <Switch value={toggleValue} onValueChange={onToggleChange} />
    </View>
  );
};

export default SettingsToggleItem;
