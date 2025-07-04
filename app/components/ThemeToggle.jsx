import {useContext} from "react";
import {Platform, Switch, View} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import {ThemeContext} from "context/ThemeContext";

const ThemeToggle = () => {
    const {theme, isDarkMode, toggleTheme} = useContext(ThemeContext);

    return (
        <View
            className={`absolute flex-row items-center rounded-2xl p-1 ${Platform.OS === 'android' ? 'top-4' : 'top-16'} right-8 z-10`}>
            <View className="mr-1.5">
                <Ionicons
                    name="sunny"
                    size={24}
                    color={isDarkMode ? theme.textColor : "#f1c40f"}
                />
            </View>
            <Switch
                trackColor={{false: "#767577", true: "#81b0ff"}}
                thumbColor={isDarkMode ? "#f5dd4b" : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={toggleTheme}
                value={isDarkMode}
                rc
            />
            <View className="ml-1.5">
                <Ionicons
                    name="moon"
                    size={24}
                    color={isDarkMode ? "#f1c40f" : theme.textColor}
                />
            </View>
        </View>
    );
};

export default ThemeToggle;
