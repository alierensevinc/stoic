import React from "react";
import { View, Button } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import Fontisto from "@expo/vector-icons/Fontisto";

const SettingsItem = ({ title, icon, onPress, type = "", color }) => {
  return (
    <View className="mt-5 px-6 w-full flex-row items-center">
      {type === "fontisto" && <Fontisto name={icon} size={20} color={color} />}
      {type !== "fontisto" && <Ionicons name={icon} size={24} color={color} />}
      <View className={`ml-2 ${type === "fontisto" ? "pt-1" : ""}`}>
        <Button
          title={title}
          onPress={onPress}
          color={color}
          className="text-lg"
        />
      </View>
    </View>
  );
};

export default SettingsItem;
