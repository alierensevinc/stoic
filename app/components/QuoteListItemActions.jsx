import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

const QuoteListItemActions = ({ theme, onShare, onDelete }) => {
  return (
    <View style={[styles.rowBack, { backgroundColor: theme.backgroundColor }]}>
      <TouchableOpacity
        style={[styles.backRightBtn, styles.backRightBtnShare]}
        onPress={onShare}
      >
        <Ionicons name="share-outline" size={24} color={theme.textColor} />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.backRightBtn, styles.backRightBtnDelete]}
        onPress={onDelete}
      >
        <Ionicons name="trash-outline" size={24} color={theme.textColor} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  rowBack: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 16,
    marginBottom: 16,
    borderRadius: 10,
  },
  backRightBtn: {
    alignItems: "center",
    bottom: 0,
    justifyContent: "center",
    position: "absolute",
    top: 0,
    width: 80,
  },
  backRightBtnShare: {
    right: 80,
  },
  backRightBtnDelete: {
    right: 0,
  },
});

export default QuoteListItemActions;
