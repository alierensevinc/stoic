import { createContext, useState, useEffect } from "react";
import { MMKV } from "react-native-mmkv";
import { themes } from "utils/themes";
import { getAppIcon, setAppIcon } from "expo-dynamic-app-icon";

const storage = new MMKV();

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = storage.getString("theme");
    return savedTheme === "dark";
  });

  const theme = isDarkMode ? themes.dark : themes.light;

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    storage.set("theme", !isDarkMode ? "dark" : "light");
    setAppIcon(isDarkMode ? "default" : "alternative");
  };

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
