import React from "react";
import { View, Text, StyleSheet } from "react-native";

const QuoteListItem = ({ item, theme }) => {
  return (
    <View
      style={[
        styles.quoteContainer,
        { backgroundColor: theme.backgroundColor },
      ]}
    >
      <Text
        style={[
          styles.quoteText,
          { color: theme.textColor, fontFamily: "Montserrat-Regular" },
        ]}
      >
        {item.q}
      </Text>
      <Text
        style={[
          styles.authorText,
          { color: theme.textColor, fontFamily: "Montserrat-Italic" },
        ]}
      >
        - {item.a}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  quoteContainer: {
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
  },
  quoteText: {
    fontSize: 18,
    marginBottom: 10,
  },
  authorText: {
    fontSize: 14,
    textAlign: "right",
  },
});

export default QuoteListItem;
