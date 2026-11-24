import {useContext, useEffect} from "react";
import {Dimensions, Image, TouchableOpacity, View} from "react-native";
import Toast, {BaseToast} from "react-native-toast-message";
import Clipboard from "@react-native-clipboard/clipboard";
import {CameraRoll} from "@react-native-camera-roll/camera-roll";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";
import {ThemeContext} from "context/ThemeContext";
import Container from "components/Container";
import {logAnalyticsEvent} from "utils/telemetry";
import {logger} from "utils/logger";

const ShareModal = ({route, navigation}) => {
    const {uri, quote} = route.params;
    const {theme} = useContext(ThemeContext);

    const screenWidth = Dimensions.get("window").width;
    const screenHeight = Dimensions.get("window").height;

    useEffect(() => {
        return () => {
            if (uri && uri.startsWith("file://")) {
                FileSystem.deleteAsync(uri, {idempotent: true}).catch(() => {});
            }
        };
    }, [uri]);

    const toastConfig = {
        success: (props) => (
            <BaseToast
                {...props}
                style={{
                    borderLeftColor: theme.backgroundTintColor,
                    backgroundColor: theme.textColor,
                }}
                contentContainerStyle={{paddingHorizontal: 15}}
                text1Style={{
                    fontSize: 15,
                    fontWeight: "400",
                    color: theme.backgroundColor,
                }}
            />
        ),
        error: (props) => (
            <BaseToast
                {...props}
                style={{
                    borderLeftColor: "#ef4444",
                    backgroundColor: theme.textColor,
                }}
                contentContainerStyle={{paddingHorizontal: 15}}
                text1Style={{
                    fontSize: 15,
                    fontWeight: "400",
                    color: theme.backgroundColor,
                }}
            />
        ),
    };

    const onSaveToGallery = async () => {
        try {
            await CameraRoll.saveAsset(uri, {type: "photo"});
            logAnalyticsEvent("share_save_gallery", {
                quote_id: quote?.id || "unknown",
            });
            Toast.show({
                type: "success",
                text1: "Quote saved to the gallery",
                position: "bottom",
            });
        } catch (error) {
            logger.warn("CameraRoll save failed:", error);
            Toast.show({
                type: "error",
                text1: "Could not save image. Please check Photos permission.",
                position: "bottom",
            });
        }
    };

    const onShare = async () => {
        try {
            await Sharing.shareAsync(uri, {
                mimeType: "image/jpeg",
                dialogTitle: "Share this quote",
                UTI: "public.jpeg",
            });
            logAnalyticsEvent("share_quote_image", {
                quote_id: quote?.id || "unknown",
            });
        } catch (error) {
            logger.warn("Sharing failed:", error);
        }
    };

    const onCopy = () => {
        Clipboard.setString(`${quote.text} - ${quote.author}`);
        logAnalyticsEvent("share_copy_text", {
            quote_id: quote?.id || "unknown",
        });
        Toast.show({
            type: "success",
            text1: "Quote copied to the clipboard",
            position: "bottom",
        });
    };

    return (
        <Container
            className="flex-1 justify-center items-center bg-white p-5"
            style={{backgroundColor: theme.backgroundColor}}
        >
            <TouchableOpacity
                onPress={() => navigation.goBack()}
                accessibilityRole="button"
                accessibilityLabel="Close share sheet"
                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                className="absolute top-5 right-5 z-10"
            >
                <Ionicons name="close" size={24} color={theme.buttonColor} />
            </TouchableOpacity>
            <Image
                source={{uri}}
                resizeMode="contain"
                className="mb-5"
                style={{height: screenHeight / 2, width: screenWidth}}
            />
            <View className="flex-row justify-around w-4/5 mb-5">
                <TouchableOpacity
                    onPress={onSaveToGallery}
                    accessibilityRole="button"
                    accessibilityLabel="Save quote image to gallery"
                    hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                    className="mx-2"
                >
                    <Ionicons name="save-outline" size={24} color={theme.buttonColor} />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={onShare}
                    accessibilityRole="button"
                    accessibilityLabel="Share quote image"
                    hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                    className="mx-2"
                >
                    <Ionicons name="share-outline" size={24} color={theme.buttonColor} />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={onCopy}
                    accessibilityRole="button"
                    accessibilityLabel="Copy quote text"
                    hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                    className="mx-2"
                >
                    <Ionicons name="copy-outline" size={24} color={theme.buttonColor} />
                </TouchableOpacity>
            </View>
            <Toast config={toastConfig} />
        </Container>
    );
};

export default ShareModal;
