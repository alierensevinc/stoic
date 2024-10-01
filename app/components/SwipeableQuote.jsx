import { useEffect } from "react";
import { Text, Dimensions } from "react-native";
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
import { View } from "nativewind";

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
      <Animated.View
        className="flex-1 justify-center items-center w-full p-6"
        style={animatedStyle}
      >
        <Text
          className="text-2xl text-center mb-2"
          style={{ color: theme.textColor, fontFamily: "Montserrat-Regular" }}
        >
          {quote.q}
        </Text>
        <Text
          className="text-lg text-right italic"
          style={{ color: theme.textColor, fontFamily: "Montserrat-Italic" }}
        >
          - {quote.a}
        </Text>
      </Animated.View>
    </PanGestureHandler>
  );
});

export default SwipeableQuote;
