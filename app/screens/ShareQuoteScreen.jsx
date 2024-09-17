import React, { useContext, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
} from "react-native";
import { ThemeContext } from "../context/ThemeContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import ViewShot from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import { useNavigation } from "@react-navigation/native";

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
    padding: 16,
  },
  quote: {
    fontSize: 36,
    textAlign: "flex-start",
  },
  author: {
    fontSize: 20,
    marginTop: 8,
    alignSelf: "flex-end",
  },
  shareButton: {
    position: "absolute",
    bottom: 20,
    right: 60,
  },
  backButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
  },
  hidden: {
    opacity: 0,
  },
});

export default ShareQuoteScreen;
