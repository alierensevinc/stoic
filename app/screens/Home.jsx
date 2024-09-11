import React, { useEffect, useContext, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Platform,
} from "react-native";
import { MMKV } from "react-native-mmkv";
import { StatusBar } from "expo-status-bar";
import axios from "axios";
import moment from "moment";
import { create } from "zustand";
import { ThemeContext } from "../context/ThemeContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import { PanGestureHandler } from "react-native-gesture-handler";
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";
import ViewShot from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import { useNavigation } from "@react-navigation/native";
import { useFavoriteStore } from "../store/favoriteStore";
import {
  AdEventType,
  InterstitialAd,
  TestIds,
} from "react-native-google-mobile-ads";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import ThemeToggle from "../components/ThemeToggle";

// Zustand store for quotes
const useQuoteStore = create((set) => ({
  quotes: [],
  setQuotes: (newQuotes) => set({ quotes: newQuotes }),
}));

const iosAdmobBanner = "ca-app-pub-4954831375392388~6035696472";
const androidAdmobBanner = "ca-app-pub-4954831375392388~6035696472";
const productionID =
  Device.osName === "Android" ? androidAdmobBanner : iosAdmobBanner;
const adUnitId = __DEV__ ? TestIds.INTERSTITIAL : productionID;
// Make sure to always use a test ID when not in production

const interstitial = InterstitialAd.createForAdRequest(adUnitId, {
  keywords: ["food", "cooking", "fruit"], // Update based on the most relevant keywords for your app/users, these are just random examples
  requestNonPersonalizedAdsOnly: true, // Update based on the initial tracking settings from initialization earlier
});

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!");
      return;
    }
    // Learn more about projectId:
    // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid

    if (Constants.easConfig?.projectId) {
      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId: Constants.easConfig.projectId, // you can hard code project id if you dont want to use expo Constants
        })
      ).data;
      console.log(token);
    }
  } else {
    alert("Must use physical device for Push Notifications");
  }

  return token;
}

const HomeScreen = () => {
  const { theme } = useContext(ThemeContext);
  const { quotes, setQuotes } = useQuoteStore();
  const { favorites, addFavorite, removeFavorite } = useFavoriteStore();
  const storage = new MMKV();
  const translateX = useSharedValue(0);
  const textOpacity = useSharedValue(1);
  const nextQuoteOpacity = useSharedValue(0);
  const screenWidth = Dimensions.get("window").width;
  const viewShotRef = useRef();
  const [isCapturing, setIsCapturing] = useState(false);
  const navigation = useNavigation();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    registerForPushNotificationsAsync();
    // Event listener for when the ad is loaded
    const unsubscribeLoaded = interstitial.addAdEventListener(
      AdEventType.LOADED,
      () => {
        setLoaded(true);
      }
    );

    // Event listener for when the ad is closed
    const unsubscribeClosed = interstitial.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        setLoaded(false);

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

  useEffect(() => {
    const quotesString = storage.getString("quotes");
    const favoritesString = storage.getString("favorites");

    if (quotesString) {
      const quotesObject = JSON.parse(quotesString);

      if (quotesObject.date !== moment().format("YYYY-MM-DD HH")) {
        getQuotes();
      } else {
        setQuotes(quotesObject.quotes);
      }
    } else {
      getQuotes();
    }

    schedulePushNotification();
  }, []);

  async function schedulePushNotification() {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "You've got notification! 🔔",
        body: "Here is the notification body",
        data: { data: "goes here" },
      },
      trigger: { hours: 1 },
    });
  }

  const getQuotes = async () => {
    try {
      const response = await axios.get("https://zenquotes.io/api/quotes/");
      const quotes = response.data;
      const quotesObject = {
        date: moment().format("YYYY-MM-DD HH"),
        quotes,
      };
      storage.set("quotes", JSON.stringify(quotesObject));
      setQuotes(quotes);
    } catch (error) {
      console.error("Error fetching quotes:", error);
    }
  };

  const toggleFavoriteQuote = () => {
    const currentQuote = quotes[0];
    if (favorites.some((fav) => fav.q === currentQuote.q)) {
      removeFavorite(currentQuote);
    } else {
      addFavorite(currentQuote);
      interstitial.show();
    }
  };

  const shareQuote = async () => {
    if (!(await Sharing.isAvailableAsync())) {
      alert("Sharing isn't available on your platform");
      return;
    }

    try {
      setIsCapturing(true);
      // Butonların gizlenmesi için kısa bir gecikme ekleyelim
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
    interstitial.show();
  };

  const changeQuote = (direction) => {
    if (quotes.length > 1) {
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
      textOpacity.value = withTiming(1, { duration: 400 }); // Increased from 300 to 500
      nextQuoteOpacity.value = withTiming(0, { duration: 600 }); // Increased from 300 to 500
    }
  };

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, context) => {
      context.startX = translateX.value;
    },
    onActive: (event, context) => {
      translateX.value = context.startX + event.translationX;
      const progress = Math.abs(translateX.value) / screenWidth;
      textOpacity.value = interpolate(
        progress,
        [0, 0.5],
        [1, 0],
        Extrapolate.CLAMP
      );
      nextQuoteOpacity.value = interpolate(
        progress,
        [0.5, 1],
        [0, 1],
        Extrapolate.CLAMP
      );
    },
    onEnd: (event) => {
      if (
        Math.abs(event.velocityX) > 400 ||
        Math.abs(translateX.value) > screenWidth / 5
      ) {
        if (event.velocityX > 0 || translateX.value > 0) {
          translateX.value = withSpring(
            screenWidth,
            {
              duration: 500, // Increased from 200 to 500
              velocity: event.velocityX,
            },
            () => {
              runOnJS(changeQuote)("previous");
              translateX.value = 0;
            }
          );
        } else {
          translateX.value = withSpring(
            -screenWidth,
            {
              duration: 500, // Increased from 200 to 500
              velocity: event.velocityX,
            },
            () => {
              runOnJS(changeQuote)("next");
              translateX.value = 0;
            }
          );
        }
      } else {
        translateX.value = withSpring(0, { duration: 300 }); // Increased from 150 to 300
        textOpacity.value = withTiming(1, { duration: 300 }); // Increased from 150 to 300
        nextQuoteOpacity.value = withTiming(0, { duration: 300 }); // Increased from 150 to 300
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const currentTextStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  const nextTextStyle = useAnimatedStyle(() => ({
    opacity: nextQuoteOpacity.value,
    position: "absolute",
    width: "100%",
    left: translateX.value > 0 ? -screenWidth : screenWidth,
  }));

  const goToFavorites = () => {
    navigation.navigate("Favorites");
    interstitial.show();
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.backgroundColor }]}
    >
      <ViewShot ref={viewShotRef} options={{ format: "jpg", quality: 0.9 }}>
        <PanGestureHandler
          onGestureEvent={gestureHandler}
          style={[styles.container, { backgroundColor: theme.backgroundColor }]}
        >
          <Animated.View
            style={[
              styles.container,
              { backgroundColor: theme.backgroundColor },
              animatedStyle,
            ]}
          >
            <Animated.View style={currentTextStyle}>
              <Text style={[styles.quote, { color: theme.textColor }]}>
                {quotes.length > 0 ? quotes[0].q : "Loading..."}
              </Text>
              <Text style={[styles.author, { color: theme.textColor }]}>
                {quotes.length > 0 ? "- " + quotes[0].a : "Loading..."}
              </Text>
            </Animated.View>
            <Animated.View style={nextTextStyle}>
              <Text style={[styles.quote, { color: theme.textColor }]}>
                {quotes.length > 1 ? quotes[1].q : "Loading..."}
              </Text>
              <Text style={[styles.author, { color: theme.textColor }]}>
                {quotes.length > 1 ? "- " + quotes[1].a : "Loading..."}
              </Text>
            </Animated.View>
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
              ? "heart"
              : "heart-outline"
          }
          size={24}
          color={theme.buttonColor}
        />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={goToFavorites}
        style={[styles.favoritesButton, isCapturing && styles.hidden]}
      >
        <Ionicons name="bookmark-outline" size={24} color={theme.buttonColor} />
      </TouchableOpacity>
      <View style={styles.themeToggleContainer}>
        <ThemeToggle />
      </View>
      <StatusBar
        style={theme.statusBarStyle}
        backgroundColor={theme.statusBarBackgroundColor}
      />
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
