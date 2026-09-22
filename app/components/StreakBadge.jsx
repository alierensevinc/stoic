import {Platform, Text, View} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import {useStreakStore} from "store/streakStore";

const StreakBadge = ({theme}) => {
    const currentStreak = useStreakStore((state) => state.currentStreak);

    if (currentStreak < 2) {
        return null;
    }

    return (
        <View
            pointerEvents="none"
            className={`absolute flex-row justify-center ${
                Platform.OS === "android" ? "top-4" : "top-16"
            } left-0 right-0 z-10`}
        >
            <View className="flex-row items-center rounded-2xl px-3 py-1">
                <Ionicons name="flame" size={20} color={theme.buttonColor} />
                <Text
                    className="ml-1 text-base"
                    style={{color: theme.buttonColor, fontFamily: "Montserrat-Medium"}}
                >
                    {currentStreak}
                </Text>
            </View>
        </View>
    );
};

export default StreakBadge;
