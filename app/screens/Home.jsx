import React, { useEffect, useContext } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
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
  runOnJS,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";

// Zustand store for quotes
const useQuoteStore = create((set) => ({
  quotes: [],
  setQuotes: (newQuotes) => set({ quotes: newQuotes }),
}));

// Zustand store for favorites
const useFavoriteStore = create((set) => ({
  favorites: [],
  setFavorites: (newFavorites) => set({ favorites: newFavorites }),
}));

const HomeScreen = () => {
  const { theme } = useContext(ThemeContext);
  const { quotes, setQuotes } = useQuoteStore();
  const { favorites, setFavorites } = useFavoriteStore();
  const storage = new MMKV();
  const translateX = useSharedValue(0);  // Add this line

  const screenWidth = Dimensions.get("window").width;

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

    if (favoritesString) {
      setFavorites(JSON.parse(favoritesString));
    }
  }, []);

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
    const quoteToToggle = quotes[0];

    if (favorites.some((favorite) => favorite.q === quoteToToggle.q)) {
      const updatedFavorites = favorites.filter(
        (favorite) => favorite.q !== quoteToToggle.q
      );
      setFavorites(updatedFavorites);
      storage.set("favorites", JSON.stringify(updatedFavorites));
    } else {
      const updatedFavorites = [...favorites, quoteToToggle];
      setFavorites(updatedFavorites);
      storage.set("favorites", JSON.stringify(updatedFavorites));
    }
  };

  const changeQuote = (direction) => {
    if (quotes.length > 1) {
      if (direction === 'next') {
        const nextQuotes = [...quotes.slice(1), quotes[0]];
        setQuotes(nextQuotes);
      } else if (direction === 'previous') {
        const previousQuotes = [quotes[quotes.length - 1], ...quotes.slice(0, -1)];
        setQuotes(previousQuotes);
      }
    }
  };

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, context) => {
      context.startX = translateX.value;
    },
    onActive: (event, context) => {
      translateX.value = context.startX + event.translationX;
    },
    onEnd: (event) => {
      if (Math.abs(event.velocityX) > 500 || Math.abs(translateX.value) > screenWidth / 3) {
        if (event.velocityX > 0 || translateX.value > 0) {
          translateX.value = withSpring(screenWidth, {}, () => {
            runOnJS(changeQuote)('previous');
            translateX.value = 0;
          });
        } else {
          translateX.value = withSpring(-screenWidth, {}, () => {
            runOnJS(changeQuote)('next');
            translateX.value = 0;
          });
        }
      } else {
        translateX.value = withSpring(0);
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      Math.abs(translateX.value),
      [0, screenWidth / 2],
      [1, 0],
      Extrapolate.CLAMP
    );
    return {
      transform: [{ translateX: translateX.value }],
      opacity,
    };
  });

  return (
    <View
      style={[styles.container, { backgroundColor: theme.backgroundColor }]}
    >
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
          <Text style={[styles.quote, { color: theme.textColor }]}>
            {quotes.length > 0 ? quotes[0].q : "Loading..."}
          </Text>
          <Text style={[styles.author, { color: theme.textColor }]}>
            {quotes.length > 0 ? "- " + quotes[0].a : "Loading..."}
          </Text>
          <TouchableOpacity onPress={toggleFavoriteQuote}>
            <Ionicons
              style={styles.heartButton}
              name={
                favorites.some((favorite) => favorite.q === quotes[0]?.q)
                  ? "heart"
                  : "heart-outline"
              }
              size={24}
              color={theme.buttonColor}
            />
          </TouchableOpacity>
          <StatusBar style="auto" />
        </Animated.View>
      </PanGestureHandler>
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
    textAlign: "center",
  },
  author: {
    fontSize: 20,
    alignSelf: "flex-end",
  },
  heartButton: {
    marginTop: 24,
  },
});

export default HomeScreen;
