import {createContext, useState} from "react";
import {MMKV} from "react-native-mmkv";
import {setAppIcon} from "expo-dynamic-app-icon";
import {themes} from "utils/themes";
import {Platform} from "react-native";
import * as Haptics from "expo-haptics";

const storage = new MMKV();

export const ThemeContext = createContext();

export const ThemeProvider = ({children}) => {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const savedTheme = storage.getString("theme");
        return savedTheme === "dark";
    });

    const theme = isDarkMode ? themes.dark : themes.light;

    const toggleTheme = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setIsDarkMode(!isDarkMode);
        storage.set("theme", !isDarkMode ? "dark" : "light");
        if (Platform.OS === "ios") {
            setAppIcon(isDarkMode ? "main" : "alternative");
        }
    };

    return (
        <ThemeContext.Provider value={{theme, isDarkMode, toggleTheme}}>
            {children}
        </ThemeContext.Provider>
    );
};
