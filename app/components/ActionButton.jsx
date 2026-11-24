import {TouchableOpacity} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

const ActionButton = ({onPress, theme, style, iconName, accessibilityLabel}) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            style={[style]}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel || iconName}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
        >
            <Ionicons name={iconName} size={24} color={theme.buttonColor} />
        </TouchableOpacity>
    );
};

export default ActionButton;
