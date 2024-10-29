import {View} from "react-native";
import ActionButton from "./ActionButton";

const ActionButtons = ({
                           theme,
                           shareQuote,
                           navigateToBookmarks,
                           addToBookmarks,
                           isBookmarked,
                       }) => {
    return (
        <View className="absolute bottom-12 left-8 right-8  p-1 flex-row justify-between items-center">
            <ActionButton
                onPress={navigateToBookmarks}
                theme={theme}
                iconName="bookmarks"
            />
            <View className="flex-row">
                <ActionButton
                    onPress={shareQuote}
                    theme={theme}
                    className="mr-6"
                    iconName="share-outline"
                />
                <ActionButton
                    onPress={addToBookmarks}
                    theme={theme}
                    iconName={isBookmarked ? "bookmark" : "bookmark-outline"}
                />
            </View>
        </View>
    );
};

export default ActionButtons;
