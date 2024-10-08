import { useEffect, useRef, useState } from "react";
import { Text, View, SafeAreaView } from "react-native";
import ViewShot from "react-native-view-shot";
import { PanGestureHandler } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";

const QuoteViewShot = ({
  viewShotRef,
  theme,
  quote, // Accept a single quote
  captureOnReady = false,
  gestureHandler, // Accept gesture handler
  animatedStyle, // Accept animated style
}) => {
  const [viewReady, setViewReady] = useState(false);
  const internalRef = useRef();

  useEffect(() => {
    if (viewReady && captureOnReady && viewShotRef?.current) {
      // Trigger the capture when the view is ready
      viewShotRef.current.capture();
    }
  }, [viewReady, captureOnReady, viewShotRef]);

  return (
    <SafeAreaView
      className="flex-1 items-center justify-center p-8"
      style={{ backgroundColor: theme.backgroundColor }}
    >
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={animatedStyle}>
          <ViewShot
            ref={viewShotRef || internalRef}
            options={{ format: "jpg", quality: 0.9 }}
          >
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
                style={{
                  color: theme.textColor,
                  fontFamily: "Montserrat-Regular",
                }}
              >
                {quote.text}
              </Text>
              <Text
                className="text-xl mt-2 self-end"
                style={{
                  color: theme.textColor,
                  fontFamily: "Montserrat-Italic",
                }}
              >
                - {quote.author}
              </Text>
            </View>
          </ViewShot>
        </Animated.View>
      </PanGestureHandler>
    </SafeAreaView>
  );
};

export default QuoteViewShot;
