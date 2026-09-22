import {useEffect, useMemo, useRef, useState} from "react";
import {SafeAreaView, Text, View} from "react-native";
import ViewShot from "react-native-view-shot";
import {Gesture, GestureDetector} from "react-native-gesture-handler";
import Animated from "react-native-reanimated";

const QuoteViewShot = ({
                           viewShotRef,
                           theme,
                           quote,
                           captureOnReady = false,
                           panGesture,
                           animatedStyle,
                       }) => {
    const [viewReady, setViewReady] = useState(false);
    const internalRef = useRef();
    // Screens that only render a static share preview (e.g. Bookmarks) don't
    // pass a pan gesture; fall back to a no-op one so GestureDetector always
    // receives a valid Gesture.
    const noopGesture = useMemo(() => Gesture.Pan(), []);

    useEffect(() => {
        if (viewReady && captureOnReady && viewShotRef?.current) {
            viewShotRef.current.capture();
        }
    }, [viewReady, captureOnReady, viewShotRef]);

    return (
        <SafeAreaView
            className="flex-1 items-center justify-center p-8 w-full h-full"
            style={{backgroundColor: theme.backgroundColor}}
        >
            <GestureDetector gesture={panGesture || noopGesture}>
                <Animated.View style={animatedStyle}>
                    <ViewShot
                        ref={viewShotRef || internalRef}
                        options={{format: "jpg", quality: 0.9}}
                    >
                        <View
                            className="flex-1 items-center justify-center p-8"
                            style={{backgroundColor: theme.backgroundColor}}
                            onLayout={(event) => {
                                const {width, height} = event.nativeEvent.layout;
                                if (width > 0 && height > 0) {
                                    setViewReady(true);
                                }
                            }}
                        >
                            <Text
                                className="text-2xl text-left"
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
            </GestureDetector>
        </SafeAreaView>
    );
};

export default QuoteViewShot;
