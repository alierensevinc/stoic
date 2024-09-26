import React, { useContext, useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View, SafeAreaView, Alert } from "react-native";
import ViewShot from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import { ThemeContext } from "../context/ThemeContext";

const ShareQuoteScreen = ({ quote, author, onShareComplete }) => {
  const { theme } = useContext(ThemeContext);
  const viewShotRef = useRef();
  const [isCapturing, setIsCapturing] = useState(false);
  const [viewReady, setViewReady] = useState(false);

  useEffect(() => {
    if (viewReady) {
      shareQuote();
    }
  }, [viewReady]);

  const shareQuote = async () => {
    if (!(await Sharing.isAvailableAsync())) {
      Alert.alert("Sharing isn't available on your platform");
      return;
    }

    try {
      setIsCapturing(true);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const uri = await viewShotRef.current.capture();

      setIsCapturing(false);
      onShareComplete();

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
          onLayout={(event) => {
            const { width, height } = event.nativeEvent.layout;
            if (width > 0 && height > 0) {
              setViewReady(true);
            }
          }}
        >
          <Text
            style={[
              styles.quote,
              { color: theme.textColor, fontFamily: "Montserrat-Regular" },
            ]}
          >
            {quote}
          </Text>
          <Text
            style={[
              styles.author,
              { color: theme.textColor, fontFamily: "Montserrat-Italic" },
            ]}
          >
            - {author}
          </Text>
        </View>
      </ViewShot>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
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
});

export default ShareQuoteScreen;
