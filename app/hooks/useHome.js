import { useEffect, useContext, useRef, useState } from "react";
import { Dimensions } from "react-native";
import { MMKV } from "react-native-mmkv";
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
import { useQuoteStore } from "store/quoteStore";
import NetInfo from "@react-native-community/netinfo";
import { IOS_ADMOB_INTERSTITIAL } from "@env";

const adUnitId = __DEV__ ? TestIds.INTERSTITIAL : IOS_ADMOB_INTERSTITIAL;
const interstitial = InterstitialAd.createForAdRequest(adUnitId, {
  keywords: ["food", "cooking", "fruit"],
  requestNonPersonalizedAdsOnly: true,
});

export const useHome = () => {
  const { theme } = useContext(ThemeContext);
  const {
    quotes,
    setQuotes,
    fetchQuotes,
    loadQuotesFromArchive,
    cameFromNotification,
    setCameFromNotification,
  } = useQuoteStore();
  const { bookmarks, addToBookmarks, removeFromBookmarks } =
    useBookmarksStore();
  const { actionCount, incrementActionCount, resetActionCount } = useAdStore();
  const textOpacity = useSharedValue(1);
  const screenWidth = Dimensions.get("window").width;
  const viewShotRef = useRef();
  const navigation = useNavigation();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
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
    if (!cameFromNotification) {
      NetInfo.fetch().then((state) => {
        if (state.isConnected) {
          fetchQuotes();
        } else {
          loadQuotesFromArchive();
        }
      });
    }

    return () => {
      setCameFromNotification(false);
    };
  }, [cameFromNotification]);

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
        await new Promise((resolve) => setTimeout(resolve, 100));

        const uri = await viewShotRef.current.capture();
        await Sharing.shareAsync("file://" + uri, {
          mimeType: "image/jpeg",
          dialogTitle: "Share this quote",
          UTI: "public.jpeg",
        });
      } catch (error) {
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

  return {
    theme,
    quotes,
    viewShotRef,
    gestureHandler,
    animatedStyle,
    shareQuote,
    navigateToBookmarks,
    toggleBookmark,
    isBookmarked,
  };
};
