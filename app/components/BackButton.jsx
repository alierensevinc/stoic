import {TouchableOpacity} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

const BackButton = ({onPress, color}) => (
    <TouchableOpacity
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
    >
        <Ionicons name="arrow-back" size={24} color={color} />
    </TouchableOpacity>
);

export default BackButton;
