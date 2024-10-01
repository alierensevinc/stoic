import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import ActionButton from "./ActionButton";

const ActionButtons = ({
  theme,
  shareQuote,
  addToBookmarks,
  navigateToBookmarks,
  isBookmarked,
}) => {
  return (
    <View style={styles.container}>
      <ActionButton
        onPress={navigateToBookmarks}
        theme={theme}
        iconName="bookmarks"
      />
      <View style={styles.rightButtonsContainer}>
        <ActionButton
          onPress={shareQuote}
          theme={theme}
          style={styles.button}
          iconName="share-outline"
        />
        <ActionButton
          onPress={addToBookmarks}
          theme={theme}
          iconName={isBookmarked ? "bookmark" : "bookmark-outline"}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 32,
    left: 32,
    right: 32,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rightButtonsContainer: {
    flexDirection: "row",
  },
  button: {
    marginRight: 24,
  },
});

export default ActionButtons;
