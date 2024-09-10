import React, { useEffect, useContext, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { MMKV } from "react-native-mmkv";
import { StatusBar } from "expo-status-bar";
import ViewShot from "react-native-view-shot";
import { useNavigation } from "@react-navigation/native";
import { ThemeContext } from "../context/ThemeContext";
import { useQuoteStore } from "../store/quoteStore";
import { useFavoriteStore } from "../store/favoriteStore";
import ThemeToggle from "../components/ThemeToggle";
import ActionButtons from "../components/ActionButtons";
import SwipeableQuote from "../components/SwipeableQuote";

const HomeScreen = () => {
  const { theme, isDarkMode, toggleTheme } = useContext(ThemeContext);
  const { quotes, setQuotes, fetchQuotes } = useQuoteStore();
  const { favorites, addFavorite, removeFavorite } = useFavoriteStore();
  const [isCapturing, setIsCapturing] = useState(false);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const viewShotRef = useRef();
  const navigation = useNavigation();

  useEffect(() => {
    fetchQuotes();
  }, []);

  const handleSwipe = (direction) => {
    if (quotes.length > 1) {
      if (direction === "next") {
        setCurrentQuoteIndex((prevIndex) => (prevIndex + 1) % quotes.length);
      } else if (direction === "previous") {
        setCurrentQuoteIndex(
          (prevIndex) => (prevIndex - 1 + quotes.length) % quotes.length
        );
      }
    }
  };

  const shareQuote = async () => {
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
  };

  const toggleFavoriteQuote = () => {
    const currentQuote = quotes[currentQuoteIndex];
    if (favorites.some((fav) => fav.q === currentQuote.q)) {
      removeFavorite(currentQuote);
    } else {
      addFavorite(currentQuote);
    }
  };

  const goToFavorites = () => {
    navigation.navigate("Favorites");
  };

  const currentQuote = quotes[currentQuoteIndex];

  return (
    <View
      style={[styles.container, { backgroundColor: theme.backgroundColor }]}
    >
      <ViewShot ref={viewShotRef} options={{ format: "jpg", quality: 0.9 }}>
        {currentQuote && (
          <SwipeableQuote
            theme={theme}
            quote={currentQuote}
            onSwipe={handleSwipe}
          />
        )}
      </ViewShot>
      <ActionButtons
        theme={theme}
        isCapturing={isCapturing}
        shareQuote={shareQuote}
        toggleFavoriteQuote={toggleFavoriteQuote}
        goToFavorites={goToFavorites}
        isFavorite={favorites.some((fav) => fav.q === currentQuote?.q)}
      />
      <View style={styles.themeSwitchContainer}>
        <ThemeToggle
          theme={theme}
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
        />
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
  },
  themeSwitchContainer: {
    position: "absolute",
    top: 60,
    right: 20,
  },
});

export default HomeScreen;
