import {useContext} from "react";
import {View} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {ThemeContext} from "context/ThemeContext";

const Container = ({children, style}) => {
    const insets = useSafeAreaInsets();
    const {theme} = useContext(ThemeContext);

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