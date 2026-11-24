import {Platform, TouchableOpacity, View} from "react-native";
import {useNavigation} from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";

const SettingsButton = ({theme}) => {
    const navigation = useNavigation();

    const navigateToSettings = () => {
        navigation.navigate("Settings");
    };

    return (
        <View
            className={`absolute flex-row items-center rounded-2xl p-1 ${
                Platform.OS === "android" ? "top-4" : "top-16"
            } left-8 z-10`}
        >
            <TouchableOpacity
                onPress={navigateToSettings}
                accessibilityRole="button"
                accessibilityLabel="Open settings"
                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
            >
                <Ionicons name="settings-outline" size={24} color={theme.buttonColor} />
            </TouchableOpacity>
        </View>
    );
};

export default SettingsButton;
