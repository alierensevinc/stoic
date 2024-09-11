import React, { useContext } from "react";
import { View, Switch, StyleSheet } from "react-native";
import { ThemeContext } from "../context/ThemeContext";
import Ionicons from "@expo/vector-icons/Ionicons";

const ThemeToggle = () => {
  const { theme, isDarkMode, toggleTheme } = useContext(ThemeContext);

  return (
    <View style={styles.container}>
      <Ionicons
        name="sunny"
        size={24}
        color={isDarkMode ? theme.textColor : "#f1c40f"}
        style={styles.icon}
      />
      <Switch
        trackColor={{ false: "#767577", true: "#81b0ff" }}
        thumbColor={isDarkMode ? "#f5dd4b" : "#f4f3f4"}
        ios_backgroundColor="#3e3e3e"
        onValueChange={toggleTheme}
        value={isDarkMode}
      />
      <Ionicons
        name="moon"
        size={24}
        color={isDarkMode ? "#f1c40f" : theme.textColor}
        style={styles.icon}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    padding: 5,
  },
  icon: {
    marginHorizontal: 5,
  },
});

export default ThemeToggle;
