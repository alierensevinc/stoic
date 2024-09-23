import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  AdEventType,
  InterstitialAd,
  TestIds,
} from "react-native-google-mobile-ads";
import Ionicons from "@expo/vector-icons/Ionicons";
import { SwipeListView } from "react-native-swipe-list-view";
import { ThemeContext } from "../context/ThemeContext";
import { useFavoriteStore } from "../store/favoriteStore";
import { useAdStore } from "../store/adStore";
import QuoteItem from "../components/QuoteItem";
import QuoteItemActions from "../components/QuoteItemActions";
import InlineAd from "../components/InlineAd";

import { IOS_ADMOB_INTERSTITIAL } from "@env";
const adUnitId = __DEV__ ? TestIds.INTERSTITIAL : IOS_ADMOB_INTERSTITIAL;

const interstitial = InterstitialAd.createForAdRequest(adUnitId, {
  keywords: ["food", "cooking", "fruit"],
  requestNonPersonalizedAdsOnly: true,
});

const FavoritesScreen = () => {
  const navigation = useNavigation();
  const { theme } = useContext(ThemeContext);
  const { favorites, removeFavorite } = useFavoriteStore();
  const { actionCount, incrementActionCount, resetActionCount } = useAdStore();
  const [isAdLoaded, setIsAdLoaded] = useState(false);

  useEffect(() => {
    const unsubscribeLoaded = interstitial.addAdEventListener(
      AdEventType.LOADED,
      () => {
        setIsAdLoaded(true);
      }
    );

    const unsubscribeClosed = interstitial.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        setIsAdLoaded(false);
        interstitial.load();
      }
    );

    interstitial.load();

    return () => {
      unsubscribeLoaded();
      unsubscribeClosed();
    };
  }, []);

  const handleAction = (callback) => {
    incrementActionCount();
    if ((actionCount + 1) % 5 === 0 && isAdLoaded) {
      interstitial.show();
      resetActionCount();
    }
    callback();
  };

  const shareQuote = (item) => {
    if (isAdLoaded) {
      interstitial.show();
      navigation.navigate("ShareQuote", {
        quote: item.q,
        author: item.a,
      });
    }
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

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.backgroundColor }]}
    >
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Ionicons name="arrow-back" size={24} color={theme.buttonColor} />
      </TouchableOpacity>
      <Text style={[styles.title, { color: theme.textColor }]}>
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
        <Text style={[styles.emptyText, { color: theme.textColor }]}>
          No favorite quotes yet. Add some from the home screen!
        </Text>
      )}
      <InlineAd />
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
  backButton: {
    position: "absolute",
    top: 60,
    left: 20,
    zIndex: 1,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
});

export default FavoritesScreen;
