import React from "react";
import { StyleSheet, Text } from "react-native";
import { PanGestureHandler } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import ViewShot from "react-native-view-shot";

const QuoteViewShot = ({
  viewShotRef,
  gestureHandler,
  animatedStyle,
  theme,
  quotes,
}) => {
  return (
    <ViewShot ref={viewShotRef} options={{ format: "jpg", quality: 0.9 }}>
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View
          style={[
            styles.container,
            { backgroundColor: theme.backgroundColor },
            animatedStyle,
          ]}
        >
          <Text
            style={[
              styles.quote,
              { color: theme.textColor, fontFamily: "Montserrat-Regular" },
            ]}
          >
            {quotes.length > 0 ? quotes[0].q : "Loading..."}
          </Text>
          <Text
            style={[
              styles.author,
              { color: theme.textColor, fontFamily: "Montserrat-Italic" },
            ]}
          >
            {quotes.length > 0 ? "- " + quotes[0].a : ""}
          </Text>
        </Animated.View>
      </PanGestureHandler>
    </ViewShot>
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
});

export default QuoteViewShot;
