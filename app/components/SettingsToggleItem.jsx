import {Switch, Text, View} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

const SettingsToggleItem = ({
    title,
    icon,
    color,
    toggleValue,
    onToggleChange,
}) => {
    return (
        <View className="mt-5 px-6 w-full flex-row items-center justify-between">
            <View className="flex-row items-center flex-1 mr-3">
                <View className="w-7 justify-center items-center">
                    <Ionicons name={icon} size={24} color={color} />
                </View>
                <Text
                    className="ml-3 flex-1"
                    style={{
                        color,
                        fontSize: 17,
                        fontFamily: "Montserrat-Regular",
                    }}
                >
                    {title}
                </Text>
            </View>
            <Switch
                value={toggleValue}
                onValueChange={onToggleChange}
                accessibilityLabel={title}
            />
        </View>
    );
};

export default SettingsToggleItem;
