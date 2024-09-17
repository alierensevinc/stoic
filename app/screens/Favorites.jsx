import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ThemeContext } from "../context/ThemeContext";
import { useFavoriteStore } from "../store/favoriteStore";
import Ionicons from "@expo/vector-icons/Ionicons";
import { SwipeListView } from "react-native-swipe-list-view";
import QuoteItem from "../components/QuoteItem";
import QuoteItemActions from "../components/QuoteItemActions";
import InlineAd from "../components/InlineAd";
import {
  AdEventType,
  InterstitialAd,
  TestIds,
} from "react-native-google-mobile-ads";
import * as Device from "expo-device";

const iosAdmobBanner = "ca-app-pub-4954831375392388~6035696472";
const androidAdmobBanner = "ca-app-pub-4954831375392388~6035696472";
const productionID =
  Device.osName === "Android" ? androidAdmobBanner : iosAdmobBanner;
const adUnitId = __DEV__ ? TestIds.INTERSTITIAL : productionID;

const interstitial = InterstitialAd.createForAdRequest(adUnitId, {
  keywords: ["food", "cooking", "fruit"], // Update based on the most relevant keywords for your app/users, these are just random examples
  requestNonPersonalizedAdsOnly: true, // Update based on the initial tracking settings from initialization earlier
});

const FavoritesScreen = () => {
  const navigation = useNavigation();
  const { theme } = useContext(ThemeContext);
  const { favorites, removeFavorite } = useFavoriteStore();
  const [isAdLoaded, setIsAdLoaded] = useState(false);

  useEffect(() => {
    // Event listener for when the ad is loaded
    const unsubscribeLoaded = interstitial.addAdEventListener(
      AdEventType.LOADED,
      () => {
        setIsAdLoaded(true);
      }
    );

    // Event listener for when the ad is closed
    const unsubscribeClosed = interstitial.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        setIsAdLoaded(false);

        // Load a new ad when the current ad is closed
        interstitial.load();
      }
    );

    // Start loading the interstitial ad straight away
    interstitial.load();

    // Unsubscribe from events on unmount
    return () => {
      unsubscribeLoaded();
      unsubscribeClosed();
    };
  }, []);

  const shareQuote = (item) => {
    console.log(isAdLoaded);
    if (isAdLoaded) {
      interstitial.show();
    }
    navigation.navigate("ShareQuote", {
      quote: item.q,
      author: item.a,
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
            removeFavorite(item);
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
          rightOpenValue={-150}
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
