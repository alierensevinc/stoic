import {useContext, useRef, useState} from "react";
import {Alert, Platform} from "react-native";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";
import * as Haptics from "expo-haptics";
import {useNavigation} from "@react-navigation/native";
import {useBookmarksStore} from "store/bookmarksStore";
import {useInterstitialAd} from "hooks/useInterstitialAd";
import {ThemeContext} from "context/ThemeContext";
import {logger} from "utils/logger";

export const useBookmarks = () => {
    const bookmarks = useBookmarksStore((s) => s.bookmarks);
    const removeFromBookmarks = useBookmarksStore((s) => s.removeFromBookmarks);
    const {handleAction} = useInterstitialAd();
    const {theme} = useContext(ThemeContext);
    const [shareState, setShareState] = useState({
        showShareQuote: false,
        quoteToShare: null,
    });
    const viewShotRef = useRef();
    const pendingCaptureResolveRef = useRef(null);
    const navigation = useNavigation();

    const onCaptureTargetReady = () => {
        if (pendingCaptureResolveRef.current) {
            const resolve = pendingCaptureResolveRef.current;
            pendingCaptureResolveRef.current = null;
            resolve();
        }
    };

    const shareQuote = async (item) => {
        handleAction(async () => {
            if (!(await Sharing.isAvailableAsync())) {
                Alert.alert("Sharing Unavailable", "Sharing isn't available on your device.");
                return;
            }

            try {
                await new Promise((resolve) => {
                    pendingCaptureResolveRef.current = resolve;
                    setShareState({showShareQuote: true, quoteToShare: item});
                });

                const uri = await viewShotRef.current.capture();
                const safeId = item.id || "quote";
                const extractedPath = `${FileSystem.cacheDirectory}stoic-${safeId}.jpg`;
                await FileSystem.copyAsync({
                    from: uri,
                    to: extractedPath,
                });
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShareState({showShareQuote: false, quoteToShare: null});

                if (Platform.OS === "android") {
                    navigation.navigate("Share", {uri, quote: item});
                } else {
                    const targetUri = extractedPath.startsWith("file://")
                        ? extractedPath
                        : `file://${extractedPath}`;
                    navigation.navigate("Share", {uri: targetUri, quote: item});
                }
            } catch (error) {
                logger.error("Error sharing quote:", error);
                setShareState({showShareQuote: false, quoteToShare: null});
            }
        });
    };

    const confirmDelete = (item) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        Alert.alert(
            "Delete Quote",
            "Are you sure you want to remove this quote from bookmarks?",
            [
                {text: "Cancel", style: "cancel"},
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => {
                        handleAction(() => {
                            removeFromBookmarks(item);
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
        onCaptureTargetReady,
        shareQuote,
        confirmDelete,
    };
};
