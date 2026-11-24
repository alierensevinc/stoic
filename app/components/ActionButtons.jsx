import {Platform, View} from "react-native";
import ActionButton from "./ActionButton";

const ActionButtons = ({
    theme,
    shareQuote,
    navigateToBookmarks,
    navigateToNotes,
    addToBookmarks,
    isBookmarked,
    openNoteModal,
    hasNote,
}) => {
    return (
        <View
            className={`absolute ${
                Platform.OS === "android" ? "bottom-4" : "bottom-12"
            } left-8 right-8 p-1 flex-row justify-between items-center`}
        >
            <View className="flex-row items-center">
                <ActionButton
                    onPress={navigateToBookmarks}
                    theme={theme}
                    style={{marginRight: 20}}
                    iconName="bookmarks"
                    accessibilityLabel="Open bookmarks"
                />
                {navigateToNotes && (
                    <ActionButton
                        onPress={navigateToNotes}
                        theme={theme}
                        iconName="journal-outline"
                        accessibilityLabel="Open reflections journal"
                    />
                )}
            </View>
            <View className="flex-row items-center">
                <ActionButton
                    onPress={shareQuote}
                    theme={theme}
                    style={{marginRight: 24}}
                    iconName="share-outline"
                    accessibilityLabel="Share current quote"
                />
                <ActionButton
                    onPress={openNoteModal}
                    theme={theme}
                    style={{marginRight: 24}}
                    iconName={hasNote ? "create" : "create-outline"}
                    accessibilityLabel={
                        hasNote ? "Edit reflection note" : "Add reflection note"
                    }
                />
                <ActionButton
                    onPress={addToBookmarks}
                    theme={theme}
                    iconName={isBookmarked ? "bookmark" : "bookmark-outline"}
                    accessibilityLabel={
                        isBookmarked
                            ? "Remove quote from bookmarks"
                            : "Bookmark current quote"
                    }
                />
            </View>
        </View>
    );
};

export default ActionButtons;
