import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Share from 'react-native-share';
import * as Sharing from 'expo-sharing';
import Toast from 'react-native-toast-message';
import Clipboard from '@react-native-clipboard/clipboard';
import { CameraRoll } from "@react-native-camera-roll/camera-roll";

const ShareModal = ({ route, navigation }) => {
    const { uri, quote } = route.params;

    const saveToGallery = async () => {
        try {
            await CameraRoll.save(uri, { type: 'photo' });
            Toast.show({
                type: 'success',
                text1: 'Saved to gallery',
                position: 'bottom'
            });
        } catch (error) {
            console.error("Error saving to gallery:", error);
            Toast.show({
                type: 'error',
                text1: 'Failed to save to gallery',
                position: 'bottom'
            });
        }
    };

    const share = async () => {
        try {
            await Share.open({
                url: uri,
                title: "Share this quote",
            });
            navigation.goBack();
        } catch (error) {
            console.error("Error sharing quote:", error);
        }
    };

    const copyText = () => {
        Clipboard.setString(quote.text);
        Toast.show({
            type: 'success',
            text1: 'Quote copied to the Clipboard',
            position: 'bottom'
        });
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Share Options</Text>
            <TouchableOpacity onPress={saveToGallery} style={styles.option}>
                <Text>Save to Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={share} style={styles.option}>
                <Text>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={copyText} style={styles.option}>
                <Text>Copy Text</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.cancel}>
                <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Toast />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    option: {
        marginVertical: 10,
    },
    cancel: {
        marginTop: 20,
    },
    cancelText: {
        color: 'red',
    },
});

export default ShareModal;