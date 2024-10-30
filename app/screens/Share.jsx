import {useContext} from 'react';
import {Dimensions, Image, TouchableOpacity, View} from 'react-native';
import Share from 'react-native-share';
import Toast, {BaseToast} from 'react-native-toast-message';
import Clipboard from '@react-native-clipboard/clipboard';
import {CameraRoll} from "@react-native-camera-roll/camera-roll";
import Ionicons from "@expo/vector-icons/Ionicons";
import {ThemeContext} from "context/ThemeContext";
import Container from "components/Container";

const ShareModal = ({route, navigation}) => {
    const {uri, quote} = route.params;
    const {theme} = useContext(ThemeContext);

    const screenWidth = Dimensions.get('window').width;
    const screenHeight = Dimensions.get('window').height;

    const toastConfig = {
        success: (props) => (
            <BaseToast
                {...props}
                style={{borderLeftColor: theme.backgroundTintColor, backgroundColor: theme.textColor}}
                contentContainerStyle={{paddingHorizontal: 15}}
                text1Style={{
                    fontSize: 15,
                    fontWeight: '400',
                    color: theme.backgroundColor
                }}
            />
        )
    }

    const onSaveToGallery = async () => {
        await CameraRoll.save(uri, {type: 'photo'});
        Toast.show({
            type: "success",
            text1: 'Quote saved to the gallery',
            position: 'bottom'
        });
    };

    const onShare = async () => {
        await ShareModal.open({
            url: uri,
            title: "Share this quote",
        });
    };

    const onCopy = () => {
        console.log(quote);
        Clipboard.setString(`${quote.text} - ${quote.author}`);
        Toast.show({
            type: "success",
            text1: 'Quote copied to the clipboard',
            position: 'bottom'
        });
    }

    return (
        <Container className="flex-1 justify-center items-center bg-white p-5"
                   style={{backgroundColor: theme.backgroundColor}}>
            <TouchableOpacity onPress={() => navigation.goBack()} className="absolute top-5 right-5">
                <Ionicons name="close" size={24} color={theme.buttonColor}/>
            </TouchableOpacity>
            <Image source={{uri}} className="mb-5" style={{height: screenHeight / 2, width: screenWidth}}/>
            <View className="flex-row justify-around w-4/5 mb-5">
                <TouchableOpacity onPress={onSaveToGallery} className="mx-2">
                    <Ionicons name="save-outline" size={24} color={theme.buttonColor}/>
                </TouchableOpacity>
                <TouchableOpacity onPress={onShare} className="mx-2">
                    <Ionicons name="share-outline" size={24} color={theme.buttonColor}/>
                </TouchableOpacity>
                <TouchableOpacity onPress={onCopy} className="mx-2">
                    <Ionicons name="copy-outline" size={24} color={theme.buttonColor}/>
                </TouchableOpacity>
            </View>
            <Toast config={toastConfig}/>
        </Container>
    );
};

export default ShareModal;