import {createContext, useCallback, useEffect, useMemo, useState} from "react";
import {Appearance, Platform, useColorScheme} from "react-native";
import {
    setAlternateAppIcon,
    supportsAlternateIcons,
} from "expo-alternate-app-icons";
import * as Haptics from "expo-haptics";
import {themes} from "utils/themes";
import {storage} from "utils/storage";
import {logger} from "utils/logger";

const THEME_PREF_KEY = "theme";
const MATCH_ICON_KEY = "matchIconToTheme";

export const ThemeContext = createContext();

export const ThemeProvider = ({children}) => {
    const systemColorScheme = useColorScheme();
    const [themeMode, setThemeModeState] = useState(() => {
        return storage.getString(THEME_PREF_KEY) || "system";
    });
    const [matchAppIconToTheme, setMatchAppIconToThemeState] = useState(() => {
        return storage.getBoolean(MATCH_ICON_KEY) ?? false;
    });

    const isDarkMode =
        themeMode === "system"
            ? systemColorScheme === "dark"
            : themeMode === "dark";

    const theme = isDarkMode ? themes.dark : themes.light;

    useEffect(() => {
        try {
            if (typeof Appearance.setColorScheme === "function") {
                Appearance.setColorScheme(
                    themeMode === "system" ? null : isDarkMode ? "dark" : "light"
                );
            }
        } catch (e) {
            logger.warn("Appearance.setColorScheme failed:", e);
        }
    }, [themeMode, isDarkMode]);

    const applyAppIconIfEnabled = useCallback(
        async (dark, shouldMatch) => {
            if (Platform.OS !== "ios" || !supportsAlternateIcons || !shouldMatch) {
                return;
            }
            try {
                await setAlternateAppIcon(dark ? "Alternative" : null);
            } catch (e) {
                logger.warn("setAlternateAppIcon failed:", e);
            }
        },
        []
    );

    const toggleTheme = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        const nextDark = !isDarkMode;
        const nextMode = nextDark ? "dark" : "light";
        setThemeModeState(nextMode);
        storage.set(THEME_PREF_KEY, nextMode);
        applyAppIconIfEnabled(nextDark, matchAppIconToTheme);
    }, [isDarkMode, matchAppIconToTheme, applyAppIconIfEnabled]);

    const setThemeMode = useCallback(
        (mode) => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setThemeModeState(mode);
            storage.set(THEME_PREF_KEY, mode);
            const nextDark =
                mode === "system"
                    ? systemColorScheme === "dark"
                    : mode === "dark";
            applyAppIconIfEnabled(nextDark, matchAppIconToTheme);
        },
        [systemColorScheme, matchAppIconToTheme, applyAppIconIfEnabled]
    );

    const toggleMatchAppIconToTheme = useCallback(
        async (value) => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setMatchAppIconToThemeState(value);
            storage.set(MATCH_ICON_KEY, Boolean(value));
            if (value) {
                await applyAppIconIfEnabled(isDarkMode, true);
            } else if (Platform.OS === "ios" && supportsAlternateIcons) {
                try {
                    await setAlternateAppIcon(null);
                } catch (e) {
                    logger.warn("Reset app icon failed:", e);
                }
            }
        },
        [isDarkMode, applyAppIconIfEnabled]
    );

    const contextValue = useMemo(
        () => ({
            theme,
            isDarkMode,
            themeMode,
            toggleTheme,
            setThemeMode,
            matchAppIconToTheme,
            toggleMatchAppIconToTheme,
        }),
        [
            theme,
            isDarkMode,
            themeMode,
            toggleTheme,
            setThemeMode,
            matchAppIconToTheme,
            toggleMatchAppIconToTheme,
        ]
    );

    return (
        <ThemeContext.Provider value={contextValue}>
            {children}
        </ThemeContext.Provider>
    );
};
