import React, { useEffect } from "react";
import { StyleSheet, Text, Dimensions, View } from "react-native";
import { PanGestureHandler } from "react-native-gesture-handler";
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const SwipeableQuote = ({ theme, quote, onSwipe }) => {
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    // Yeni alıntı geldiğinde sadece fade in animasyonu
    opacity.value = 0;
    translateX.value = 0;
    opacity.value = withTiming(1, { duration: 500 });
  }, [quote]);

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, context) => {
      context.startX = translateX.value;
    },
    onActive: (event, context) => {
      translateX.value = context.startX + event.translationX;
      // Kaydırma sırasında opaklığı azalt
      opacity.value = 1 - Math.abs(translateX.value) / (SCREEN_WIDTH / 2);
    },
    onEnd: (event) => {
      if (
        Math.abs(event.velocityX) > 400 ||
        Math.abs(translateX.value) > SCREEN_WIDTH / 3
      ) {
        // Kaydırma yeterince hızlı veya uzunsa, alıntıyı değiştir
        opacity.value = withTiming(0, { duration: 200 }, () => {
          translateX.value = withSpring(0);
          if (event.velocityX > 0 || translateX.value > 0) {
            runOnJS(onSwipe)("previous");
          } else {
            runOnJS(onSwipe)("next");
          }
        });
      } else {
        // Kaydırma yeterli değilse, orijinal konuma geri dön
        translateX.value = withSpring(0);
        opacity.value = withTiming(1, { duration: 200 });
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
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: SCREEN_WIDTH,
    padding: 20,
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
