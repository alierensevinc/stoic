import React from "react";
import { View, Switch, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

const ThemeToggle = ({ theme, isDarkMode, toggleTheme }) => {
  return (
    <View style={styles.themeSwitch}>
      <Ionicons name="sunny" size={24} color={theme.buttonColor} />
      <Switch
        trackColor={{ false: "#767577", true: "#81b0ff" }}
        thumbColor={isDarkMode ? "#f4f6fc" : "#151b24"}
        ios_backgroundColor="#3e3e3e"
        onValueChange={toggleTheme}
        value={isDarkMode}
      />
      <Ionicons name="moon" size={24} color={theme.buttonColor} />
    </View>
  );
};

const styles = StyleSheet.create({
  themeSwitch: {
    flexDirection: "row",
    alignItems: "center",
  },
});

export default ThemeToggle;
