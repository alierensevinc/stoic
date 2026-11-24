import {useState} from "react";
import {Modal, Pressable, Text, TextInput, View} from "react-native";

const NoteModal = ({visible, initialNote, theme, onSave, onClose}) => {
    const [draft, setDraft] = useState(initialNote);
    const [lastSeed, setLastSeed] = useState({visible, initialNote});

    if (
        visible !== lastSeed.visible ||
        initialNote !== lastSeed.initialNote
    ) {
        setLastSeed({visible, initialNote});
        if (visible) {
            setDraft(initialNote);
        }
    }

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <Pressable
                className="flex-1 justify-center items-center px-8"
                style={{backgroundColor: "rgba(0,0,0,0.5)"}}
                onPress={onClose}
            >
                <Pressable
                    className="rounded-2xl p-4 w-full"
                    style={{backgroundColor: theme.backgroundColor}}
                    onPress={() => {}}
                >
                    <Text
                        className="text-lg mb-3 text-center"
                        style={{
                            color: theme.textColor,
                            fontFamily: "Montserrat-Medium",
                        }}
                    >
                        Your reflection
                    </Text>
                    <TextInput
                        multiline
                        value={draft}
                        onChangeText={setDraft}
                        placeholder="What does this quote mean to you today?"
                        placeholderTextColor={theme.placeholderColor}
                        className="rounded-xl p-3 min-h-[120px]"
                        style={{
                            color: theme.textColor,
                            borderWidth: 1,
                            borderColor: theme.backgroundTintColor,
                            fontFamily: "Montserrat-Regular",
                            textAlignVertical: "top",
                        }}
                    />
                    <View className="flex-row justify-end mt-4">
                        <Pressable
                            onPress={onClose}
                            accessibilityRole="button"
                            accessibilityLabel="Cancel reflection"
                            className="px-4 py-2 mr-2"
                        >
                            <Text
                                style={{
                                    color: theme.buttonColor,
                                    fontFamily: "Montserrat-Regular",
                                }}
                            >
                                Cancel
                            </Text>
                        </Pressable>
                        <Pressable
                            onPress={() => onSave(draft)}
                            accessibilityRole="button"
                            accessibilityLabel="Save reflection"
                            className="px-4 py-2 rounded-full"
                            style={{backgroundColor: theme.buttonColor}}
                        >
                            <Text
                                style={{
                                    color: theme.backgroundColor,
                                    fontFamily: "Montserrat-Medium",
                                }}
                            >
                                Save
                            </Text>
                        </Pressable>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
};

export default NoteModal;
