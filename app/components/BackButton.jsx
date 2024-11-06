import {Platform, TouchableOpacity} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

const BackButton = ({onPress, color}) => (
    <TouchableOpacity onPress={onPress} className={`absolute ${Platform.OS === 'android' ? 'top-2' : 'top-16'} left-5 z-10`}>
        <Ionicons name="arrow-back" size={24} color={color}/>
    </TouchableOpacity>
);

export default BackButton;
