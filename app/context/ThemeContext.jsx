// context/ThemeContext.js

import React, { createContext, useEffect, useState } from "react";
import { themes } from "../utils/themes";
import { MMKV } from "react-native-mmkv";

export const ThemeContext = createContext({
  theme: themes.dark,
  switchTheme: (theme) => {},
});

const storage = new MMKV();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(themes.dark); // Default theme

  useEffect(() => {
    try {
      const selectedTheme = storage.getString("theme");
      if (selectedTheme) {
        setTheme(themes[selectedTheme]);
      }
    } catch (error) {
      console.error("Failed to load theme from storage", error);
    }
  }, []);

  const switchTheme = (themeName) => {
    setTheme(themes[themeName]);
    storage.set("theme", themeName);
  };

  return (
    <ThemeContext.Provider value={{ theme, switchTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
