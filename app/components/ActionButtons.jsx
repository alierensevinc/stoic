import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

const ActionButtons = ({
  theme,
  isCapturing,
  shareQuote,
  toggleFavoriteQuote,
  goToFavorites,
  isFavorite,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={goToFavorites}
        style={[
          styles.button,
          styles.favoritesButton,
          isCapturing && styles.hidden,
        ]}
      >
        <Ionicons name="bookmark-outline" size={24} color={theme.buttonColor} />
      </TouchableOpacity>
      <View style={styles.rightButtonsContainer}>
        <TouchableOpacity
          onPress={shareQuote}
          style={[styles.button, isCapturing && styles.hidden]}
        >
          <Ionicons name="share-outline" size={24} color={theme.buttonColor} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={toggleFavoriteQuote}
          style={[styles.button, isCapturing && styles.hidden]}
        >
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={24}
            color={theme.buttonColor}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rightButtonsContainer: {
    flexDirection: "row",
  },
  button: {
    marginLeft: 15,
  },
  favoritesButton: {
    marginLeft: 0,
  },
  hidden: {
    opacity: 0,
  },
});

export default ActionButtons;
