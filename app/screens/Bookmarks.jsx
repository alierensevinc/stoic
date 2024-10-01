import React, { useContext, useState } from "react";
import { View, StyleSheet, Alert, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { ThemeContext } from "context/ThemeContext";
import { useFavoriteStore } from "store/favoriteStore";
import { useAdStore } from "store/adStore";
import InlineAd from "components/InlineAd";
import ShareQuoteScreen from "components/ShareQuote";
import BackButton from "components/BackButton";
import EmptyState from "components/EmptyState";
import QuoteList from "components/QuoteList";
import Container from "components/Container";
import { useInterstitialAd } from "hooks/useInterstitialAd";

const BookmarksScreen = () => {
  const navigation = useNavigation();
  const { theme } = useContext(ThemeContext);
  const { favorites, removeFavorite } = useFavoriteStore();
  const { actionCount, incrementActionCount, resetActionCount } = useAdStore();
  const [shareState, setShareState] = useState({
    showShareQuote: false,
    quoteToShare: null,
  });
  const { isAdLoaded, showAd } = useInterstitialAd();
  const insets = useSafeAreaInsets();

  const handleAction = (callback) => {
    incrementActionCount();
    if ((actionCount + 1) % 5 === 0 && isAdLoaded) {
      showAd();
      resetActionCount();
    }
    callback();
  };

  const shareQuote = (item) => {
    handleAction(() => {
      setShareState({ showShareQuote: true, quoteToShare: item });
    });
  };

  const confirmDelete = (item) => {
    Alert.alert(
      "Delete Quote",
      "Are you sure you want to remove this quote from favorites?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            handleAction(() => {
              removeFavorite(item);
            });
          },
        },
      ]
    );
  };

  const handleShareComplete = () => {
    setShareState({ showShareQuote: false, quoteToShare: null });
  };

  return (
    <Container>
      <BackButton
        onPress={() => navigation.goBack()}
        color={theme.buttonColor}
      />
      <Text
        style={[
          styles.title,
          { color: theme.textColor, fontFamily: "Montserrat-Medium" },
        ]}
      >
        Bookmarks
      </Text>
      {favorites.length > 0 ? (
        <QuoteList
          data={favorites}
          theme={theme}
          onShare={shareQuote}
          onDelete={confirmDelete}
        />
      ) : (
        <View style={styles.emptyStateContainer}>
          <EmptyState text="No favorite quotes yet" color={theme.textColor} />
        </View>
      )}
      <InlineAd style={styles.inlineAd} />
      {shareState.showShareQuote && shareState.quoteToShare && (
        <View style={styles.hidden}>
          <ShareQuoteScreen
            quote={shareState.quoteToShare.q}
            author={shareState.quoteToShare.a}
            onShareComplete={handleShareComplete}
          />
        </View>
      )}
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
  },
  inlineAd: {
    alignSelf: "center",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  hidden: {
    position: "absolute",
    top: -1000,
    left: -1000,
    width: "100%",
    height: "100%",
    opacity: 0,
  },
});

export default BookmarksScreen;
