import React from "react";
import { Text, StyleSheet } from "react-native";

const EmptyState = ({ text, color }) => (
  <Text style={[styles.emptyText, { color }]}>{text}</Text>
);

const styles = StyleSheet.create({
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
});

export default EmptyState;
