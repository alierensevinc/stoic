import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

const QuoteItemActions = ({ theme, onShare, onDelete }) => {
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
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
  },
  backRightBtn: {
    alignItems: "center",
    bottom: 0,
    justifyContent: "center",
    position: "absolute",
    top: 0,
    width: 75,
  },
  backRightBtnShare: {
    right: 75,
  },
  backRightBtnDelete: {
    right: 0,
  },
});

export default QuoteItemActions;
