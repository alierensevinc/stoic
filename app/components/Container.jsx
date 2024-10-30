import { useEffect, useContext } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemeContext } from "context/ThemeContext";
import perf from '@react-native-firebase/perf';

const Container = ({ children, style }) => {
    const insets = useSafeAreaInsets();
    const { theme } = useContext(ThemeContext);

    useEffect(() => {
        const trace = perf().newTrace('screen_rendering');
        trace.start();

        return () => {
            trace.stop();
        };
    }, []);

    return (
        <View
            className="flex-1 items-center justify-center p-4"
            style={[
                {
                    backgroundColor: theme.backgroundColor,
                    paddingTop: insets.top,
                    paddingBottom: 0,
                    paddingLeft: insets.left,
                    paddingRight: insets.right,
                },
                style,
            ]}
        >
            {children}
        </View>
    );
};

export default Container;