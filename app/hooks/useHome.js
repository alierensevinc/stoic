import {useContext, useEffect, useRef, useState} from "react";
import {Alert, Dimensions, Platform} from "react-native";
import {Gesture} from "react-native-gesture-handler";
import {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";
import * as Haptics from "expo-haptics";
import {useNavigation} from "@react-navigation/native";
import {ThemeContext} from "context/ThemeContext";
import {useBookmarksStore} from "store/bookmarksStore";
import {useQuoteStore} from "store/quoteStore";
import {useAnimationStore} from "store/animationStore";
import {useNotesStore} from "store/notesStore";
import {useStreakStore} from "store/streakStore";
import {useInterstitialAd} from "hooks/useInterstitialAd";
import {maybeRequestStoreReview} from "utils/reviewPrompt";
import {logAnalyticsEvent} from "utils/telemetry";
import {logger} from "utils/logger";

export const useHome = () => {
    const {theme, isDarkMode} = useContext(ThemeContext);

    const currentQuote = useQuoteStore((s) => s.currentQuote);
    const orderLength = useQuoteStore((s) => s.order.length);
    const loadQuotes = useQuoteStore((s) => s.loadQuotes);
    const stepQuote = useQuoteStore((s) => s.stepQuote);
    const focusQuote = useQuoteStore((s) => s.focusQuote);
    const notificationQuote = useQuoteStore((s) => s.notificationQuote);
    const clearNotificationQuote = useQuoteStore(
        (s) => s.clearNotificationQuote
    );

    const bookmarks = useBookmarksStore((s) => s.bookmarks);
    const addToBookmarks = useBookmarksStore((s) => s.addToBookmarks);
    const removeFromBookmarks = useBookmarksStore((s) => s.removeFromBookmarks);

    const hasShownAnimation = useAnimationStore((s) => s.hasShownAnimation);
    const setHasShownAnimation = useAnimationStore(
        (s) => s.setHasShownAnimation
    );

    const notes = useNotesStore((s) => s.notes);
    const saveNote = useNotesStore((s) => s.saveNote);
    const currentStreak = useStreakStore((s) => s.currentStreak);

    const [noteModalVisible, setNoteModalVisible] = useState(false);
    const textOpacity = useSharedValue(1);
    const screenWidth = Dimensions.get("window").width;
    const viewShotRef = useRef();
    const navigation = useNavigation();
    const slideOffset = useSharedValue(0);
    const fadeOpacity = useSharedValue(1);
    const {handleAction} = useInterstitialAd();

    useEffect(() => {
        loadQuotes();
    }, [loadQuotes]);

    useEffect(() => {
        if (currentStreak >= 7) {
            maybeRequestStoreReview({streakCount: currentStreak});
        }
    }, [currentStreak]);

    useEffect(() => {
        if (notificationQuote) {
            focusQuote(notificationQuote);
            clearNotificationQuote();
            logAnalyticsEvent("quote_open_from_notification", {
                quote_id: notificationQuote.id || "unknown",
            });
        }
    }, [notificationQuote, focusQuote, clearNotificationQuote]);

    useEffect(() => {
        if (!hasShownAnimation && currentQuote) {
            slideOffset.value = withTiming(
                -screenWidth / 4,
                {duration: 500},
                () => {
                    slideOffset.value = withTiming(
                        screenWidth / 4,
                        {duration: 500},
                        () => {
                            slideOffset.value = withTiming(
                                0,
                                {duration: 500},
                                () => {
                                    fadeOpacity.value = withTiming(
                                        0,
                                        {duration: 500},
                                        () => {
                                            fadeOpacity.value = withTiming(
                                                1,
                                                {duration: 500},
                                                () => {
                                                    runOnJS(
                                                        setHasShownAnimation
                                                    )(true);
                                                }
                                            );
                                        }
                                    );
                                }
                            );
                        }
                    );
                }
            );
        }
    }, [
        hasShownAnimation,
        currentQuote,
        screenWidth,
        slideOffset,
        fadeOpacity,
        setHasShownAnimation,
    ]);

    const isBookmarked = Boolean(
        currentQuote &&
            bookmarks.some((bm) =>
                bm.id && currentQuote.id
                    ? bm.id === currentQuote.id
                    : bm.text === currentQuote.text
            )
    );

    const toggleBookmark = () => {
        if (!currentQuote) return;
        handleAction(() => {
            if (isBookmarked) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                removeFromBookmarks(currentQuote);
                logAnalyticsEvent("bookmark_remove", {
                    quote_id: currentQuote.id,
                });
            } else {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                addToBookmarks(currentQuote);
                logAnalyticsEvent("bookmark_add", {quote_id: currentQuote.id});
                maybeRequestStoreReview({
                    bookmarkCount: bookmarks.length + 1,
                });
            }
        });
    };

    const shareQuote = async () => {
        if (!currentQuote) return;
        handleAction(async () => {
            if (!(await Sharing.isAvailableAsync())) {
                Alert.alert(
                    "Sharing Unavailable",
                    "Sharing isn't available on your device."
                );
                return;
            }

            try {
                const uri = await viewShotRef.current.capture();
                const safeId = currentQuote.id || "quote";
                const extractedPath = `${FileSystem.cacheDirectory}stoic-${safeId}.jpg`;
                await FileSystem.copyAsync({
                    from: uri,
                    to: extractedPath,
                });
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                if (Platform.OS === "android") {
                    navigation.navigate("Share", {
                        uri,
                        quote: currentQuote,
                    });
                } else {
                    const targetUri = extractedPath.startsWith("file://")
                        ? extractedPath
                        : `file://${extractedPath}`;
                    navigation.navigate("Share", {
                        uri: targetUri,
                        quote: currentQuote,
                    });
                }
            } catch (error) {
                logger.error("Error sharing quote:", error);
            }
        });
    };

    const updateQuotes = (direction) => {
        stepQuote(direction);
        textOpacity.value = withTiming(1, {duration: 350});
    };

    const changeQuote = (direction) => {
        handleAction(() => {
            if (orderLength > 1) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                textOpacity.value = withTiming(0, {duration: 300}, () => {
                    runOnJS(updateQuotes)(direction);
                });
            }
        });
    };

    const panGesture = Gesture.Pan().onEnd((event) => {
        if (
            Math.abs(event.velocityX) > 400 ||
            Math.abs(event.translationX) > screenWidth / 5
        ) {
            if (event.translationX > 0) {
                runOnJS(changeQuote)("previous");
            } else {
                runOnJS(changeQuote)("next");
            }
        }
    });

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: textOpacity.value,
        transform: [{translateX: slideOffset.value}],
    }));

    const fadeStyle = useAnimatedStyle(() => ({
        opacity: fadeOpacity.value,
    }));

    const navigateToBookmarks = () => {
        handleAction(() => {
            navigation.navigate("Bookmarks");
        });
    };

    const navigateToNotes = () => {
        handleAction(() => {
            navigation.navigate("Notes");
        });
    };

    const handleNextQuoteClick = () => {
        changeQuote("next");
    };

    const currentNote = currentQuote
        ? notes[currentQuote.id]?.note ??
          notes[currentQuote.text]?.note ??
          ""
        : "";
    const hasNote = currentNote.length > 0;

    const openNoteModal = () => {
        handleAction(() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
            setNoteModalVisible(true);
        });
    };

    const closeNoteModal = () => setNoteModalVisible(false);

    const handleSaveNote = (note) => {
        if (currentQuote) {
            saveNote(currentQuote, note);
            logAnalyticsEvent("note_save", {quote_id: currentQuote.id});
        }
        setNoteModalVisible(false);
    };

    return {
        theme,
        isDarkMode,
        currentQuote,
        viewShotRef,
        panGesture,
        animatedStyle,
        fadeStyle,
        shareQuote,
        navigateToBookmarks,
        navigateToNotes,
        toggleBookmark,
        handleNextQuoteClick,
        isBookmarked,
        noteModalVisible,
        currentNote,
        hasNote,
        openNoteModal,
        closeNoteModal,
        handleSaveNote,
    };
};
