import {useEffect, useState} from "react";
import mobileAds from "react-native-google-mobile-ads";

export const useAppInitialization = () => {
    const [appIsReady, setAppIsReady] = useState(false);

    useEffect(() => {
        async function prepare() {
            try {
                await mobileAds().initialize();
                setAppIsReady(true);
            } catch (e) {
                console.warn(e);
            }
        }

        prepare();
    }, []);

    return appIsReady;
};
