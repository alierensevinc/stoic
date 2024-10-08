import React from "react";
import { View, Button, Switch, Text } from "react-native";

const SettingsToggleItem = ({
  title,
  onPress,
  color,
  isToggle,
  toggleValue,
  onToggleChange,
}) => {
  return (
    <View className="mt-5 px-6 w-full flex-row items-center justify-between ">
      <Text className="text-lg" style={{ color }}>
        {title}
      </Text>
      <Switch value={toggleValue} onValueChange={onToggleChange} />
    </View>
  );
};

export default SettingsToggleItem;
