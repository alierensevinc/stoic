import React from "react";
import { TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

const ActionButton = ({ onPress, theme, style, iconName }) => {
  return (
    <TouchableOpacity onPress={onPress} style={[style]}>
      <Ionicons name={iconName} size={24} color={theme.buttonColor} />
    </TouchableOpacity>
  );
};

export default ActionButton;
