import React from "react";
import { Text, View } from "react-native";
import * as Application from "expo-application";

const AppInfo = ({ theme }) => {
  return (
    <View className="bottom-4 self-center">
      <Text
        style={{
          color: theme.textColor,
          fontFamily: "Montserrat-Italic",
        }}
      >
        {Application.applicationName} {Application.nativeApplicationVersion}
      </Text>
    </View>
  );
};

export default AppInfo;
