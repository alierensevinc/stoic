import React, { useContext, useState } from "react";
import { View, SafeAreaView, StyleSheet, Alert, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SwipeListView } from "react-native-swipe-list-view";
import { ThemeContext } from "../context/ThemeContext";
import { useFavoriteStore } from "../store/favoriteStore";
import { useAdStore } from "../store/adStore";
import QuoteItem from "../components/QuoteItem";
import QuoteItemActions from "../components/QuoteItemActions";
import InlineAd from "../components/InlineAd";
import ShareQuoteScreen from "../components/ShareQuote";
import BackButton from "../components/BackButton";
import EmptyState from "../components/EmptyState";
import { useInterstitialAd } from "../hooks/useInterstitialAd";

const BookmarksScreen = () => {
  const navigation = useNavigation();
  const { theme } = useContext(ThemeContext);
  const { favorites, removeFavorite } = useFavoriteStore();
  const { actionCount, incrementActionCount, resetActionCount } = useAdStore();
  const [showShareQuote, setShowShareQuote] = useState(false);
  const [quoteToShare, setQuoteToShare] = useState(null);
  const { isAdLoaded, showAd } = useInterstitialAd();

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
      setQuoteToShare(item);
      setShowShareQuote(true);
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

  const renderItem = ({ item }) => <QuoteItem item={item} theme={theme} />;

  const renderHiddenItem = ({ item }) => (
    <QuoteItemActions
      theme={theme}
      onShare={() => shareQuote(item)}
      onDelete={() => confirmDelete(item)}
    />
  );

  const handleShareComplete = () => {
    setShowShareQuote(false);
    setQuoteToShare(null);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.backgroundColor }]}
    >
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
        Favorite Quotes
      </Text>

      {favorites.length > 0 ? (
        <SwipeListView
          data={favorites}
          renderItem={renderItem}
          renderHiddenItem={renderHiddenItem}
          rightOpenValue={-160}
          disableRightSwipe
          keyExtractor={(item) => item.q}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyStateContainer}>
          <EmptyState text="No favorite quotes yet" color={theme.textColor} />
        </View>
      )}
      <InlineAd />
      {showShareQuote && quoteToShare && (
        <View style={styles.hidden}>
          <ShareQuoteScreen
            quote={quoteToShare.q}
            author={quoteToShare.a}
            onShareComplete={handleShareComplete}
          />
        </View>
      )}
    </SafeAreaView>
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
  listContainer: {
    paddingBottom: 20,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
  },
  inlineAd: {
    alignSelf: "center",
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
