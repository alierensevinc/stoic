import {Platform, TouchableOpacity} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

const BackButton = ({onPress, color}) => (
    <TouchableOpacity onPress={onPress} >
        <Ionicons name="arrow-back" size={24} color={color}/>
    </TouchableOpacity>
);

export default BackButton;
