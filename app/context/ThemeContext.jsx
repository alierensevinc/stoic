import { createContext, useState } from "react";
import { MMKV } from "react-native-mmkv";
import { themes } from "utils/themes";

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
  };

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
