import { useContext, useEffect, useRef, useState } from "react";
import { Text, View, SafeAreaView, Alert } from "react-native";
import ViewShot from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import { ThemeContext } from "context/ThemeContext";

const ShareQuoteScreen = ({ quote, author, onShareComplete }) => {
  const { theme } = useContext(ThemeContext);
  const viewShotRef = useRef();
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
      await new Promise((resolve) => setTimeout(resolve, 100));

      const uri = await viewShotRef.current.capture();

      onShareComplete();

      await Sharing.shareAsync("file://" + uri, {
        mimeType: "image/jpeg",
        dialogTitle: "Share this quote",
        UTI: "public.jpeg",
      });
    } catch (error) {
      console.error("Error sharing quote:", error);
    }
  };

  return (
    <SafeAreaView
      className="flex-1 items-center justify-center p-8"
      style={{ backgroundColor: theme.backgroundColor }}
    >
      <ViewShot ref={viewShotRef} options={{ format: "jpg", quality: 0.9 }}>
        <View
          className="flex-1 items-center justify-center p-8"
          style={{ backgroundColor: theme.backgroundColor }}
          onLayout={(event) => {
            const { width, height } = event.nativeEvent.layout;
            if (width > 0 && height > 0) {
              setViewReady(true);
            }
          }}
        >
          <Text
            className="text-4xl text-left"
            style={{ color: theme.textColor, fontFamily: "Montserrat-Regular" }}
          >
            {quote}
          </Text>
          <Text
            className="text-xl mt-2 self-end"
            style={{ color: theme.textColor, fontFamily: "Montserrat-Italic" }}
          >
            - {author}
          </Text>
        </View>
      </ViewShot>
    </SafeAreaView>
  );
};

export default ShareQuoteScreen;
