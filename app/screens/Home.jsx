import React, { useEffect, useContext, useRef, useState } from "react";
import { StyleSheet, View, Dimensions } from "react-native";
import { MMKV } from "react-native-mmkv";
import { StatusBar } from "expo-status-bar";
import { ThemeContext } from "context/ThemeContext";
import {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import * as Sharing from "expo-sharing";
import { useNavigation } from "@react-navigation/native";
import { useBookmarksStore } from "store/bookmarksStore";
import { useAdStore } from "store/adStore";
import {
  AdEventType,
  InterstitialAd,
  TestIds,
} from "react-native-google-mobile-ads";
import * as Notifications from "expo-notifications";
import ThemeToggle from "components/ThemeToggle";
import ActionButtons from "components/ActionButtons";
import QuoteViewShot from "components/QuoteViewShot";
import Container from "components/Container";
import { IOS_ADMOB_INTERSTITIAL } from "@env";
import { useQuoteStore } from "store/quoteStore";
import NetInfo from "@react-native-community/netinfo";
import {
  schedulePushNotification,
  registerForPushNotificationsAsync,
} from "helpers/NotificationHelper";

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
  const { bookmarks, addToBookmarks, removeFromBookmarks } =
    useBookmarksStore();
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

  const toggleBookmark = () => {
    handleAction(() => {
      const currentQuote = quotes[0];
      if (bookmarks.some((bookmark) => bookmark.q === currentQuote.q)) {
        removeFromBookmarks(currentQuote);
      } else {
        addToBookmarks(currentQuote);
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

  const isBookmarked = bookmarks.some(
    (bookmark) => bookmark.q === quotes[0]?.q
  );

  return (
    <Container style={styles.container}>
      <StatusBar
        style={theme.statusBarStyle}
        backgroundColor={theme.statusBarBackgroundColor}
      />
      <QuoteViewShot
        viewShotRef={viewShotRef}
        gestureHandler={gestureHandler}
        animatedStyle={animatedStyle}
        theme={theme}
        quotes={quotes}
      />
      <ActionButtons
        theme={theme}
        isCapturing={isCapturing}
        shareQuote={shareQuote}
        addToBookmarks={toggleBookmark}
        navigateToBookmarks={navigateToBookmarks}
        isBookmarked={isBookmarked}
      />
      <View style={styles.themeToggleContainer}>
        <ThemeToggle />
      </View>
    </Container>
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
  hidden: {
    opacity: 0,
  },
  themeToggleContainer: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 1,
  },
});

export default HomeScreen;
