import React, { useEffect, useContext, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";
import { MMKV } from "react-native-mmkv";
import { StatusBar } from "expo-status-bar";
import { ThemeContext } from "../context/ThemeContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import { PanGestureHandler } from "react-native-gesture-handler";
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import ViewShot from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import { useNavigation } from "@react-navigation/native";
import { useFavoriteStore } from "../store/favoriteStore";
import { useAdStore } from "../store/adStore";
import {
  AdEventType,
  InterstitialAd,
  TestIds,
} from "react-native-google-mobile-ads";
import * as Notifications from "expo-notifications";
import ThemeToggle from "../components/ThemeToggle";
import { IOS_ADMOB_INTERSTITIAL } from "@env";
import { useQuoteStore } from "../store/quoteStore";
import NetInfo from "@react-native-community/netinfo";
import {
  schedulePushNotification,
  registerForPushNotificationsAsync,
} from "../helpers/NotificationHelper";

const adUnitId = __DEV__ ? TestIds.INTERSTITIAL : IOS_ADMOB_INTERSTITIAL;
const interstitial = InterstitialAd.createForAdRequest(adUnitId, {
  keywords: ["food", "cooking", "fruit"],
  requestNonPersonalizedAdsOnly: true,
});

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const HomeScreen = () => {
  const { theme } = useContext(ThemeContext);
  const { quotes, setQuotes, fetchQuotes, loadQuotesFromArchive } =
    useQuoteStore();
  const { favorites, addFavorite, removeFavorite } = useFavoriteStore();
  const { actionCount, incrementActionCount, resetActionCount } = useAdStore();
  const storage = new MMKV();
  const textOpacity = useSharedValue(1);
  const screenWidth = Dimensions.get("window").width;
  const viewShotRef = useRef();
  const [isCapturing, setIsCapturing] = useState(false);
  const navigation = useNavigation();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    registerForPushNotificationsAsync();
    const unsubscribeLoaded = interstitial.addAdEventListener(
      AdEventType.LOADED,
      () => {
        setLoaded(true);
      }
    );

    const unsubscribeClosed = interstitial.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        setLoaded(false);
        interstitial.load();
      }
    );

    interstitial.load();

    return () => {
      unsubscribeLoaded();
      unsubscribeClosed();
    };
  }, []);

  useEffect(() => {
    NetInfo.fetch().then((state) => {
      if (state.isConnected) {
        fetchQuotes();
      } else {
        loadQuotesFromArchive();
      }
    });

    schedulePushNotification();
  }, []);

  const handleAction = (callback) => {
    incrementActionCount();
    if ((actionCount + 1) % 5 === 0 && loaded) {
      interstitial.show();
      resetActionCount();
    }
    callback();
  };

  const toggleFavoriteQuote = () => {
    // TODO : Delete This
    Notifications.scheduleNotificationAsync({
      content: {
        title: "Look at that notification",
        body: "I'm so proud of myself!",
      },
      trigger: null,
    });
    handleAction(() => {
      const currentQuote = quotes[0];
      if (favorites.some((fav) => fav.q === currentQuote.q)) {
        removeFavorite(currentQuote);
      } else {
        addFavorite(currentQuote);
      }
    });
  };

  const shareQuote = async () => {
    handleAction(async () => {
      if (!(await Sharing.isAvailableAsync())) {
        alert("Sharing isn't available on your platform");
        return;
      }

      try {
        setIsCapturing(true);
        await new Promise((resolve) => setTimeout(resolve, 100));

        const uri = await viewShotRef.current.capture();
        setIsCapturing(false);
        await Sharing.shareAsync("file://" + uri, {
          mimeType: "image/jpeg",
          dialogTitle: "Share this quote",
          UTI: "public.jpeg",
        });
      } catch (error) {
        setIsCapturing(false);
        console.error("Error sharing quote:", error);
      }
    });
  };

  const changeQuote = (direction) => {
    handleAction(() => {
      if (quotes.length > 1) {
        textOpacity.value = withTiming(0, { duration: 500 }, () => {
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
    textOpacity.value = withTiming(1, { duration: 500 });
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
  }));

  const navigateToBookmarks = () => {
    handleAction(() => {
      navigation.navigate("Bookmarks");
    });
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.backgroundColor }]}
    >
      <StatusBar
        style={theme.statusBarStyle}
        backgroundColor={theme.statusBarBackgroundColor}
      />
      <ViewShot ref={viewShotRef} options={{ format: "jpg", quality: 0.9 }}>
        <PanGestureHandler onGestureEvent={gestureHandler}>
          <Animated.View
            style={[
              styles.container,
              { backgroundColor: theme.backgroundColor },
              animatedStyle,
            ]}
          >
            <Text
              style={[
                styles.quote,
                { color: theme.textColor, fontFamily: "Montserrat-Regular" },
              ]}
            >
              {quotes.length > 0 ? quotes[0].q : "Loading..."}
            </Text>
            <Text
              style={[
                styles.author,
                { color: theme.textColor, fontFamily: "Montserrat-Italic" },
              ]}
            >
              {quotes.length > 0 ? "- " + quotes[0].a : ""}
            </Text>
          </Animated.View>
        </PanGestureHandler>
      </ViewShot>
      <TouchableOpacity
        onPress={shareQuote}
        style={[styles.shareButton, isCapturing && styles.hidden]}
      >
        <Ionicons name={"share-outline"} size={24} color={theme.buttonColor} />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={toggleFavoriteQuote}
        style={[styles.heartButton, isCapturing && styles.hidden]}
      >
        <Ionicons
          name={
            favorites.some((favorite) => favorite.q === quotes[0]?.q)
              ? "bookmark"
              : "bookmark-outline"
          }
          size={24}
          color={theme.buttonColor}
        />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={navigateToBookmarks}
        style={[styles.favoritesButton, isCapturing && styles.hidden]}
      >
        <Ionicons
          name="bookmarks-outline"
          size={24}
          color={theme.buttonColor}
        />
      </TouchableOpacity>
      <View style={styles.themeToggleContainer}>
        <ThemeToggle />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  quote: {
    fontSize: 36,
    textAlign: "flex-start",
  },
  author: {
    fontSize: 20,
    marginTop: 8,
    alignSelf: "flex-end",
  },
  heartButton: {
    marginTop: 24,
  },
  shareButton: {
    marginTop: 24,
  },
  hidden: {
    opacity: 0,
  },
  shareButton: {
    position: "absolute",
    bottom: 20,
    right: 60,
  },
  heartButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
  },
  favoritesButton: {
    position: "absolute",
    bottom: 20,
    left: 20,
  },
  themeToggleContainer: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 1,
  },
});

export default HomeScreen;
