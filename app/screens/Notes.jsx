import {useContext, useMemo, useState} from "react";
import {
    Alert,
    FlatList,
    Pressable,
    Share,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import {useNavigation} from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import {ThemeContext} from "context/ThemeContext";
import {useNotesStore} from "store/notesStore";
import {QUOTES_BY_ID, QUOTES_BY_TEXT, useQuoteStore} from "store/quoteStore";
import Container from "components/Container";
import BackButton from "components/BackButton";
import EmptyState from "components/EmptyState";
import InlineAd from "components/InlineAd";
import NoteModal from "components/NoteModal";

const NotesScreen = () => {
    const navigation = useNavigation();
    const {theme} = useContext(ThemeContext);
    const notesMap = useNotesStore((s) => s.notes);
    const saveNote = useNotesStore((s) => s.saveNote);
    const deleteNote = useNotesStore((s) => s.deleteNote);
    const focusQuote = useQuoteStore((s) => s.focusQuote);

    const [searchQuery, setSearchQuery] = useState("");
    const [editingItem, setEditingItem] = useState(null);

    const notesList = useMemo(() => {
        const items = Object.entries(notesMap || {}).map(([key, entry]) => {
            const matchedQuote =
                (entry?.quoteId && QUOTES_BY_ID[entry.quoteId]) ||
                QUOTES_BY_ID[key] ||
                (entry?.quoteText && QUOTES_BY_TEXT[entry.quoteText]) ||
                QUOTES_BY_TEXT[key];

            return {
                key,
                quoteId: matchedQuote?.id || entry?.quoteId || key,
                quoteText:
                    matchedQuote?.text || entry?.quoteText || key,
                quoteAuthor:
                    matchedQuote?.author || entry?.quoteAuthor || "Stoic",
                note: entry?.note || "",
                updatedAt: entry?.updatedAt || 0,
            };
        });

        items.sort((a, b) => b.updatedAt - a.updatedAt);

        const q = searchQuery.trim().toLowerCase();
        if (!q) {
            return items;
        }
        return items.filter(
            (item) =>
                item.note.toLowerCase().includes(q) ||
                item.quoteText.toLowerCase().includes(q) ||
                item.quoteAuthor.toLowerCase().includes(q)
        );
    }, [notesMap, searchQuery]);

    const handleOpenInHome = (item) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        focusQuote({
            id: item.quoteId,
            text: item.quoteText,
            author: item.quoteAuthor,
        });
        navigation.navigate("Home");
    };

    const handleDeleteNote = (item) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        Alert.alert(
            "Delete Reflection",
            "Are you sure you want to delete this reflection?",
            [
                {text: "Cancel", style: "cancel"},
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => {
                        deleteNote(item.key);
                    },
                },
            ]
        );
    };

    const handleExportAll = async () => {
        if (notesList.length === 0) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
        const formatted = notesList
            .map((item) => {
                const dateStr = item.updatedAt
                    ? new Date(item.updatedAt).toLocaleDateString()
                    : "";
                return `"${item.quoteText}" — ${item.quoteAuthor}\nReflection (${dateStr}): ${item.note}`;
            })
            .join("\n\n---\n\n");

        await Share.share({
            message: formatted,
        });
    };

    return (
        <Container>
            <View className="flex-row justify-between items-center w-full px-4 pt-4">
                <View className="flex-row items-center">
                    <BackButton
                        onPress={() => navigation.goBack()}
                        color={theme.buttonColor}
                    />
                    <Text
                        className="text-3xl font-bold text-center ml-2"
                        style={{
                            color: theme.textColor,
                            fontFamily: "Montserrat-Medium",
                        }}
                    >
                        Reflections
                    </Text>
                </View>
                {notesList.length > 0 && (
                    <TouchableOpacity
                        onPress={handleExportAll}
                        accessibilityRole="button"
                        accessibilityLabel="Export all reflections"
                        hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                    >
                        <Ionicons
                            name="share-outline"
                            size={24}
                            color={theme.buttonColor}
                        />
                    </TouchableOpacity>
                )}
            </View>

            <View className="w-full px-4 mt-4 mb-2">
                <TextInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search reflections or quotes..."
                    placeholderTextColor={theme.placeholderColor}
                    className="rounded-xl px-4 py-2.5"
                    style={{
                        color: theme.textColor,
                        borderWidth: 1,
                        borderColor: theme.backgroundTintColor,
                        fontFamily: "Montserrat-Regular",
                    }}
                />
            </View>

            {notesList.length > 0 ? (
                <FlatList
                    data={notesList}
                    className="w-full px-4"
                    keyExtractor={(item) => item.key}
                    contentContainerStyle={{paddingBottom: 60}}
                    renderItem={({item}) => (
                        <Pressable
                            onPress={() => handleOpenInHome(item)}
                            className="p-4 rounded-xl mb-3 border"
                            style={{
                                backgroundColor: theme.backgroundColor,
                                borderColor: theme.backgroundTintColor,
                            }}
                        >
                            <Text
                                className="text-sm mb-1"
                                numberOfLines={2}
                                style={{
                                    color: theme.textColor,
                                    opacity: 0.75,
                                    fontFamily: "Montserrat-Italic",
                                }}
                            >
                                &ldquo;{item.quoteText}&rdquo; — {item.quoteAuthor}
                            </Text>
                            <Text
                                className="text-base mt-1"
                                style={{
                                    color: theme.textColor,
                                    fontFamily: "Montserrat-Regular",
                                }}
                            >
                                {item.note}
                            </Text>
                            <View className="flex-row justify-between items-center mt-3">
                                <Text
                                    className="text-xs"
                                    style={{
                                        color: theme.placeholderColor,
                                        fontFamily: "Montserrat-Light",
                                    }}
                                >
                                    {item.updatedAt
                                        ? new Date(
                                              item.updatedAt
                                          ).toLocaleDateString()
                                        : ""}
                                </Text>
                                <View className="flex-row items-center">
                                    <TouchableOpacity
                                        onPress={() => setEditingItem(item)}
                                        accessibilityRole="button"
                                        accessibilityLabel="Edit reflection"
                                        className="mr-4"
                                        hitSlop={{
                                            top: 8,
                                            bottom: 8,
                                            left: 8,
                                            right: 8,
                                        }}
                                    >
                                        <Ionicons
                                            name="create-outline"
                                            size={20}
                                            color={theme.buttonColor}
                                        />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => handleDeleteNote(item)}
                                        accessibilityRole="button"
                                        accessibilityLabel="Delete reflection"
                                        hitSlop={{
                                            top: 8,
                                            bottom: 8,
                                            left: 8,
                                            right: 8,
                                        }}
                                    >
                                        <Ionicons
                                            name="trash-outline"
                                            size={20}
                                            color={theme.buttonColor}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </Pressable>
                    )}
                />
            ) : (
                <View className="flex-1 justify-center">
                    <EmptyState
                        text={
                            searchQuery.trim()
                                ? "No matching reflections"
                                : "No reflections yet. Tap the pen icon on any quote to write one."
                        }
                        color={theme.textColor}
                    />
                </View>
            )}

            <InlineAd className="absolute bottom-0 left-0 right-0 self-center" />

            <NoteModal
                visible={Boolean(editingItem)}
                initialNote={editingItem?.note || ""}
                theme={theme}
                onSave={(updatedNote) => {
                    if (editingItem) {
                        saveNote(
                            {
                                id: editingItem.quoteId,
                                text: editingItem.quoteText,
                                author: editingItem.quoteAuthor,
                            },
                            updatedNote
                        );
                    }
                    setEditingItem(null);
                }}
                onClose={() => setEditingItem(null)}
            />
        </Container>
    );
};

export default NotesScreen;
