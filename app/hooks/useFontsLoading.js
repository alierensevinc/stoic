import {useFonts} from "expo-font";

export const useFontsLoading = () => {
    const [fontsLoaded, fontsError] = useFonts({
        "Montserrat-Bold": require("../../assets/fonts/montserrat/Montserrat-Bold.ttf"),
        "Montserrat-Italic": require("../../assets/fonts/montserrat/Montserrat-Italic.ttf"),
        "Montserrat-Medium": require("../../assets/fonts/montserrat/Montserrat-Medium.ttf"),
        "Montserrat-Regular": require("../../assets/fonts/montserrat/Montserrat-Regular.ttf"),
    });

    return {fontsLoaded, fontsError};
};
