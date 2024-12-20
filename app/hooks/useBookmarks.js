import { useContext, useRef, useState } from "react";
import { Alert, Platform } from "react-native";
import * as Sharing from "expo-sharing";
import { useBookmarksStore } from "store/bookmarksStore";
import { useAdStore } from "store/adStore";
import { useInterstitialAd } from "hooks/useInterstitialAd";
import { ThemeContext } from "context/ThemeContext";
import * as FileSystem from "expo-file-system";
import analytics from '@react-native-firebase/analytics';
import {useNavigation} from "@react-navigation/native";
import * as Haptics from "expo-haptics";

export const useBookmarks = () => {
    const { bookmarks, removeFromBookmarks } = useBookmarksStore();
    const { actionCount, incrementActionCount, resetActionCount } = useAdStore();
    const { isAdLoaded, showAd } = useInterstitialAd();
    const { theme } = useContext(ThemeContext);
    const [shareState, setShareState] = useState({
        showShareQuote: false,
        quoteToShare: null,
    });
    const viewShotRef = useRef();
    const navigation = useNavigation();


    const handleAction = (callback) => {
        incrementActionCount();
        if ((actionCount + 1) % 7 === 0 && isAdLoaded) {
            showAd();
            resetActionCount();
        }
        callback();
    };

    const shareQuote = async (item) => {
        handleAction(async () => {
            if (!(await Sharing.isAvailableAsync())) {
                alert("Sharing isn't available on your platform");
                return;
            }

            try {
                setShareState({ showShareQuote: true, quoteToShare: item });
                await new Promise((resolve) => setTimeout(resolve, 100));

                const uri = await viewShotRef.current.capture();
                const extractedPath = FileSystem.cacheDirectory + "Quote by " + item.author + ".jpeg";
                await FileSystem.copyAsync({
                    from: uri,
                    to: extractedPath,
                });
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                if(Platform.OS === 'android') {
                    navigation.navigate("Share", { uri: uri, quote: item });
                } else {
                    navigation.navigate("Share", { uri: "file://" + extractedPath, quote: item });
                }

                await analytics().logEvent('share_quote', { author: item.author });
            } catch (error) {
                console.error("Error sharing quote:", error);
            }
        });
    };

    const confirmDelete = (item) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        Alert.alert(
            "Delete Quote",
            "Are you sure you want to remove this quote from bookmarks?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => {
                        handleAction(() => {
                            removeFromBookmarks(item);
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            analytics().logEvent('remove_bookmark', { quote: item.text });
                        });
                    },
                },
            ]
        );
    };

    return {
        bookmarks,
        theme,
        shareState,
        viewShotRef,
        shareQuote,
        confirmDelete,
    };
};