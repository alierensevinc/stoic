import { Text } from "react-native";
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
          className="flex-1 items-center justify-center p-4"
          style={[{ backgroundColor: theme.backgroundColor }, animatedStyle]}
        >
          <Text
            className="text-4xl text-left"
            style={{ color: theme.textColor, fontFamily: "Montserrat-Regular" }}
          >
            {quotes.length > 0 ? quotes[0].q : "Loading..."}
          </Text>
          <Text
            className="text-xl mt-2 self-end"
            style={{ color: theme.textColor, fontFamily: "Montserrat-Italic" }}
          >
            {quotes.length > 0 ? "- " + quotes[0].a : ""}
          </Text>
        </Animated.View>
      </PanGestureHandler>
    </ViewShot>
  );
};

export default QuoteViewShot;
