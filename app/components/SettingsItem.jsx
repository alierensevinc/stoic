import {Pressable, Text, View} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import Fontisto from "@expo/vector-icons/Fontisto";

const SettingsItem = ({title, icon, onPress, type = "", color}) => {
    return (
        <Pressable
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={title}
            className="mt-5 px-6 w-full flex-row items-center"
        >
            <View className="justify-center items-center w-7">
                {type === "fontisto" ? (
                    <Fontisto name={icon} size={20} color={color} />
                ) : (
                    <Ionicons name={icon} size={24} color={color} />
                )}
            </View>
            <View className="ml-3 flex-1 border-b border-gray-400/30 pb-2 items-start">
                <Text
                    style={{
                        color,
                        fontSize: 17,
                        fontFamily: "Montserrat-Regular",
                    }}
                >
                    {title}
                </Text>
            </View>
        </Pressable>
    );
};

export default SettingsItem;
