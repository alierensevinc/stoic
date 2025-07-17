import {useContext, useEffect, useRef} from "react";
import {Dimensions, Platform} from "react-native";
import {ThemeContext} from "context/ThemeContext";
import {
    runOnJS,
    useAnimatedGestureHandler,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";
import * as Sharing from "expo-sharing";
import {useNavigation} from "@react-navigation/native";
import {useBookmarksStore} from "store/bookmarksStore";
import {useAdStore} from "store/adStore";
import {useQuoteStore} from "store/quoteStore";
import {useAnimationStore} from "store/animationStore";
import * as FileSystem from "expo-file-system";
import {useInterstitialAd} from "hooks/useInterstitialAd";
import * as Haptics from "expo-haptics";

export const useHome = () => {
    const {theme, isDarkMode} = useContext(ThemeContext);
    const {quotes, setQuotes, loadQuotes} = useQuoteStore();
    const {bookmarks, addToBookmarks, removeFromBookmarks} = useBookmarksStore();
    const {actionCount, incrementActionCount, resetActionCount} = useAdStore();
    const {hasShownAnimation, setHasShownAnimation} = useAnimationStore();
    const textOpacity = useSharedValue(1);
    const screenWidth = Dimensions.get("window").width;
    const viewShotRef = useRef();
    const navigation = useNavigation();
    const slideOffset = useSharedValue(0);
    const fadeOpacity = useSharedValue(1);
    const {isAdLoaded, showAd} = useInterstitialAd();

    useEffect(() => {
        loadQuotes(); // Asenkron değil, senkron fonksiyon
    }, []);

    useEffect(() => {
        if (!hasShownAnimation && quotes.length > 0) {
            slideOffset.value = withTiming(
                -screenWidth / 4,
                {duration: 500},
                () => {
                    slideOffset.value = withTiming(screenWidth / 4, {duration: 500}, () => {
                        slideOffset.value = withTiming(0, {duration: 500}, () => {
                            fadeOpacity.value = withTiming(0, {duration: 500}, () => {
                                fadeOpacity.value = withTiming(1, {duration: 500}, () => {
                                    runOnJS(setHasShownAnimation)(true);
                                });
                            });
                        });
                    });
                }
            );
        }
    }, [hasShownAnimation, quotes]);

    const handleAction = (callback) => {
        incrementActionCount();
        if ((actionCount + 1) % 7 === 0 && isAdLoaded) {
            showAd();
            resetActionCount();
        }
        callback();
    };

    const toggleBookmark = () => {
        handleAction(() => {
            const currentQuote = quotes[0];
            if (bookmarks.some((bookmark) => bookmark.text === currentQuote.text)) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                removeFromBookmarks(currentQuote);
            } else {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                addToBookmarks(currentQuote);
            }
        });
    };

    const shareQuote = async (author) => {
        handleAction(async () => {
            if (!(await Sharing.isAvailableAsync())) {
                alert("Sharing isn't available on your platform");
                return;
            }

            try {
                await new Promise((resolve) => setTimeout(resolve, 100));

                const uri = await viewShotRef.current.capture();
                const extractedPath = FileSystem.cacheDirectory + "Quote by " + author + ".jpeg";
                await FileSystem.copyAsync({
                    from: uri,
                    to: extractedPath,
                });
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                if (Platform.OS === 'android') {
                    navigation.navigate("Share", {uri: uri, quote: quotes[0]});
                } else {
                    navigation.navigate("Share", {uri: "file://" + extractedPath, quote: quotes[0]});
                }

            } catch (error) {
                console.error("Error sharing quote:", error);
            }
        });
    };

    const changeQuote = (direction) => {
        handleAction(() => {
            if (quotes.length > 1) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                textOpacity.value = withTiming(0, {duration: 500}, () => {
                    runOnJS(updateQuotes)(direction);
                });
            }
        });
    };

    const updateQuotes = (direction) => {
        if (direction === "next") {
            const nextQuotes = [...quotes.slice(1), quotes[0]];
            setQuotes(nextQuotes);
        } else if (direction === "previous") {
            const previousQuotes = [
                quotes[quotes.length - 1],
                ...quotes.slice(0, -1),
            ];
            setQuotes(previousQuotes);
        }
        textOpacity.value = withTiming(1, {duration: 500});
    };

    const gestureHandler = useAnimatedGestureHandler({
        onEnd: (event, context) => {
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
        },
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

    const handleNextQuoteClick = () => {
        changeQuote("next");
    };

    const isBookmarked = bookmarks.some(
        (bookmark) => bookmark.text === quotes[0]?.text
    );

    return {
        theme,
        isDarkMode,
        viewShotRef,
        gestureHandler,
        animatedStyle,
        fadeStyle,
        shareQuote,
        navigateToBookmarks,
        toggleBookmark,
        handleNextQuoteClick,
        isBookmarked,
        quotes,
        setQuotes,
    };
};