import {Text, View} from "react-native";
import * as Application from "expo-application";

const AppInfo = ({theme}) => {
    return (
        <View className="bottom-8 w-full" style={[
            {
                backgroundColor: theme.backgroundColor,
            },
        ]}>
            <Text
                style={{
                    color: theme.textColor,
                    fontFamily: "Montserrat-Italic",
                }}
                className="self-center text-center"
            >
                {Application.applicationName} {Application.nativeApplicationVersion}
            </Text>
            <Text
                style={{
                    color: theme.textColor,
                    fontFamily: "Montserrat-Light",
                }}
                className="self-center text-center"
            >
                Developed by Ali Eren Sevinç
            </Text>
        </View>
    );
};

export default AppInfo;
