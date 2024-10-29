import {TouchableOpacity, View} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

const QuoteListItemActions = ({theme, onShare, onDelete}) => {
    return (
        <View
            className="flex-1 flex-row items-center justify-end p-4 mb-4 rounded-lg"
            style={{backgroundColor: theme.backgroundColor}}
        >
            <TouchableOpacity
                className="absolute top-0 bottom-0 right-20 w-20 flex items-center justify-center"
                onPress={onShare}
            >
                <Ionicons name="share-outline" size={24} color={theme.textColor}/>
            </TouchableOpacity>
            <TouchableOpacity
                className="absolute top-0 bottom-0 right-0 w-20 flex items-center justify-center"
                onPress={onDelete}
            >
                <Ionicons name="trash-outline" size={24} color={theme.textColor}/>
            </TouchableOpacity>
        </View>
    );
};

export default QuoteListItemActions;
