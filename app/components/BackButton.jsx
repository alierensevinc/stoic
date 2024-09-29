import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

const BackButton = ({ onPress, color }) => (
  <TouchableOpacity onPress={onPress} style={styles.backButton}>
    <Ionicons name="arrow-back" size={24} color={color} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  backButton: {
    position: "absolute",
    top: 60,
    left: 20,
    zIndex: 1,
  },
});

export default BackButton;
