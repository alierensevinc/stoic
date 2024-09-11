import React, { useRef, useEffect, useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import ViewShot from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import { ThemeContext } from "../context/ThemeContext";
import Ionicons from "@expo/vector-icons/Ionicons";

const ShareQuoteScreen = ({ route, navigation }) => {
  const { quote, author } = route.params;
  const { theme } = useContext(ThemeContext);
  const viewShotRef = useRef();

  useEffect(() => {
    setTimeout(() => {
      captureAndShare();
    }, 1000);
  }, []);

  const captureAndShare = async () => {
    try {
      const uri = await viewShotRef.current.capture();
      await Sharing.shareAsync("file://" + uri, {
        mimeType: "image/jpeg",
        dialogTitle: "Share this quote",
        UTI: "public.jpeg",
      });
      navigation.goBack();
    } catch (error) {
      console.error("Error sharing quote:", error);
      navigation.goBack();
    }
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.backgroundColor }]}
    >
      <ViewShot ref={viewShotRef} options={{ format: "jpg", quality: 0.9 }}>
        <View style={styles.quoteContainer}>
          <Text style={[styles.quote, { color: theme.textColor }]}>
            {quote}
          </Text>
          <Text style={[styles.author, { color: theme.textColor }]}>
            - {author}
          </Text>
        </View>
      </ViewShot>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="close" size={24} color={theme.textColor} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  quoteContainer: {
    alignItems: "center",
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  quote: {
    fontSize: 24,
    textAlign: "center",
    marginBottom: 20,
  },
  author: {
    fontSize: 18,
    fontStyle: "italic",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
  },
});

export default ShareQuoteScreen;
