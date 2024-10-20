import { useState, useRef, useContext } from "react";
import { Alert } from "react-native";
import * as Sharing from "expo-sharing";
import { useBookmarksStore } from "store/bookmarksStore";
import { useAdStore } from "store/adStore";
import { useInterstitialAd } from "hooks/useInterstitialAd";
import { ThemeContext } from "context/ThemeContext";
import * as FileSystem from "expo-file-system";

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

  const handleAction = (callback) => {
    incrementActionCount();
    if ((actionCount + 1) % 5 === 0 && isAdLoaded) {
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
        const extractedPath =
          FileSystem.cacheDirectory + "Quote by " + item.author + ".jpeg";
        await FileSystem.copyAsync({
          from: uri,
          to: extractedPath,
        });
        await Sharing.shareAsync("file://" + extractedPath, {
          mimeType: "image/jpeg",
          dialogTitle: "Share this quote",
          UTI: "public.jpeg",
        });
        setShareState({ showShareQuote: false, quoteToShare: null });
      } catch (error) {
        console.error("Error sharing quote:", error);
      }
    });
  };

  const confirmDelete = (item) => {
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
