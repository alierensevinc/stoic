import React, { useContext, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import ViewShot from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import { ThemeContext } from "../context/ThemeContext";

const ShareQuoteScreen = ({ route }) => {
  const { theme } = useContext(ThemeContext);
  const { quote, author } = route.params;
  const viewShotRef = useRef();
  const [isCapturing, setIsCapturing] = useState(false);
  const navigation = useNavigation();

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

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.backgroundColor }]}
    >
      <ViewShot ref={viewShotRef} options={{ format: "jpg", quality: 0.9 }}>
        <View
          style={[styles.container, { backgroundColor: theme.backgroundColor }]}
        >
          <Text style={[styles.quote, { color: theme.textColor }]}>
            {quote}
          </Text>
          <Text style={[styles.author, { color: theme.textColor }]}>
            - {author}
          </Text>
        </View>
      </ViewShot>
      <TouchableOpacity
        onPress={shareQuote}
        style={[styles.shareButton, isCapturing && styles.hidden]}
      >
        <Ionicons name={"share-outline"} size={24} color={theme.buttonColor} />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={[styles.backButton, isCapturing && styles.hidden]}
      >
        <Ionicons name="arrow-back" size={24} color={theme.buttonColor} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  quote: {
    fontSize: 24,
    textAlign: "center",
    marginBottom: 10,
  },
  author: {
    fontSize: 18,
    textAlign: "right",
    fontStyle: "italic",
  },
  shareButton: {
    position: "absolute",
    bottom: 36,
    right: 72,
  },
  backButton: {
    position: "absolute",
    bottom: 36,
    right: 36,
  },
  hidden: {
    opacity: 0,
  },
});

export default ShareQuoteScreen;
