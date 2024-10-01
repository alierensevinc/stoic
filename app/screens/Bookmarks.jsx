import { useContext, useState, useRef } from "react";
import { View, Alert, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import * as Sharing from "expo-sharing";
import { ThemeContext } from "context/ThemeContext";
import { useBookmarksStore } from "store/bookmarksStore";
import { useAdStore } from "store/adStore";
import InlineAd from "components/InlineAd";
import QuoteViewShot from "components/QuoteViewShot";
import BackButton from "components/BackButton";
import EmptyState from "components/EmptyState";
import QuoteList from "components/QuoteList";
import Container from "components/Container";
import { useInterstitialAd } from "hooks/useInterstitialAd";

const BookmarksScreen = () => {
  const navigation = useNavigation();
  const { theme } = useContext(ThemeContext);
  const { bookmarks, removeFromBookmarks } = useBookmarksStore();
  const { actionCount, incrementActionCount, resetActionCount } = useAdStore();
  const [shareState, setShareState] = useState({
    showShareQuote: false,
    quoteToShare: null,
  });
  const { isAdLoaded, showAd } = useInterstitialAd();
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
        await Sharing.shareAsync("file://" + uri, {
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

  return (
    <Container>
      <BackButton
        onPress={() => navigation.goBack()}
        color={theme.buttonColor}
      />
      <Text
        style={{
          fontSize: 24,
          fontWeight: "bold",
          marginBottom: 20,
          textAlign: "center",
          color: theme.textColor,
          fontFamily: "Montserrat-Medium",
        }}
      >
        Bookmarks
      </Text>
      {bookmarks.length > 0 ? (
        <QuoteList
          data={bookmarks}
          theme={theme}
          onShare={shareQuote}
          onDelete={confirmDelete}
        />
      ) : (
        <View className="flex-1 justify-center">
          <EmptyState text="No bookmarks yet" color={theme.textColor} />
        </View>
      )}
      <InlineAd className="absolute bottom-0 left-0 right-0 self-center" />
      {shareState.showShareQuote && shareState.quoteToShare && (
        <View className="absolute top-[-1000px] left-[-1000px] w-full h-full opacity-0">
          <QuoteViewShot
            viewShotRef={viewShotRef}
            theme={theme}
            quote={shareState.quoteToShare} // Pass a single quote
            captureOnReady={true} // Ensure it captures automatically
          />
        </View>
      )}
    </Container>
  );
};

export default BookmarksScreen;
