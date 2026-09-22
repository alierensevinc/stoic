import {Modal, Pressable, ScrollView, Text, View} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

const AuthorFilterModal = ({visible, authors, selectedAuthors, theme, onToggle, onClose}) => {
    const isAllSelected = selectedAuthors.length === 0;

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <Pressable
                className="flex-1 justify-center items-center px-8"
                style={{backgroundColor: "rgba(0,0,0,0.5)"}}
                onPress={onClose}
            >
                <Pressable
                    className="rounded-2xl p-4 w-full max-h-[70%]"
                    style={{backgroundColor: theme.backgroundColor}}
                    onPress={() => {}}
                >
                    <Text
                        className="text-lg mb-3 text-center"
                        style={{color: theme.textColor, fontFamily: "Montserrat-Medium"}}
                    >
                        Philosophers
                    </Text>
                    <ScrollView>
                        <Pressable
                            onPress={() => onToggle(null)}
                            className="flex-row items-center justify-between px-3 py-3 border-b"
                            style={{borderColor: theme.backgroundTintColor}}
                        >
                            <Text
                                style={{color: theme.textColor, fontFamily: "Montserrat-Regular"}}
                            >
                                All
                            </Text>
                            {isAllSelected && (
                                <Ionicons name="checkmark" size={20} color={theme.buttonColor} />
                            )}
                        </Pressable>
                        {authors.map((author) => {
                            const isSelected = selectedAuthors.includes(author);
                            return (
                                <Pressable
                                    key={author}
                                    onPress={() => onToggle(author)}
                                    className="flex-row items-center justify-between px-3 py-3 border-b"
                                    style={{borderColor: theme.backgroundTintColor}}
                                >
                                    <Text
                                        style={{
                                            color: theme.textColor,
                                            fontFamily: "Montserrat-Regular",
                                        }}
                                    >
                                        {author}
                                    </Text>
                                    {isSelected && (
                                        <Ionicons
                                            name="checkmark"
                                            size={20}
                                            color={theme.buttonColor}
                                        />
                                    )}
                                </Pressable>
                            );
                        })}
                    </ScrollView>
                </Pressable>
            </Pressable>
        </Modal>
    );
};

export default AuthorFilterModal;
