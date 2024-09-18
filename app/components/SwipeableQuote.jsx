import React, { useEffect } from "react";
import { StyleSheet, Text, Dimensions } from "react-native";
import { PanGestureHandler } from "react-native-gesture-handler";
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
  Easing,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const FADE_IN_DURATION = 600;
const FADE_OUT_DURATION = 300;
const SPRING_CONFIG = {
  damping: 20,
  stiffness: 90,
};

const SwipeableQuote = React.memo(({ theme, quote, onSwipe }) => {
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = 0;
    translateX.value = 0;
    opacity.value = withTiming(1, {
      duration: FADE_IN_DURATION,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [quote]);

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, context) => {
      context.startX = translateX.value;
    },
    onActive: (event, context) => {
      translateX.value = context.startX + event.translationX;
      opacity.value = 1 - Math.abs(translateX.value) / (SCREEN_WIDTH / 2);
    },
    onEnd: (event) => {
      if (
        Math.abs(event.velocityX) > 400 ||
        Math.abs(translateX.value) > SCREEN_WIDTH / 3
      ) {
        opacity.value = withTiming(
          0,
          {
            duration: FADE_OUT_DURATION,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          },
          () => {
            translateX.value = 0;
            if (event.velocityX > 0 || translateX.value > 0) {
              runOnJS(onSwipe)("previous");
            } else {
              runOnJS(onSwipe)("next");
            }
          }
        );
      } else {
        translateX.value = withSpring(0, SPRING_CONFIG);
        opacity.value = withTiming(1, {
          duration: FADE_IN_DURATION,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1), // Easing.ease
        });
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View style={[styles.container, animatedStyle]}>
        <Text style={[styles.quote, { color: theme.textColor }]}>
          {quote.q}
        </Text>
        <Text style={[styles.author, { color: theme.textColor }]}>
          - {quote.a}
        </Text>
      </Animated.View>
    </PanGestureHandler>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: SCREEN_WIDTH,
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
});

export default SwipeableQuote;
