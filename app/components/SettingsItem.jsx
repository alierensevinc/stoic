import React from "react";
import {Button, Platform, Text, TouchableOpacity, View} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import Fontisto from "@expo/vector-icons/Fontisto";

const SettingsItem = ({title, icon, onPress, type = "", color}) => {
    return (
        <View className="mt-5 px-6 w-full flex-row items-center">
            <View className="justify-center items-center">
                {type === "fontisto" ? (
                    <Fontisto name={icon} size={20} color={color}/>
                ) : (
                    <Ionicons name={icon} size={24} color={color}/>
                )}
            </View>
            <View className={`ml-2 ${type === "fontisto" ? "pt-1" : ""} flex-1`}>
                <View className="border-b border-gray-300 items-start">
                    {Platform.OS === 'android' ? (
                        <TouchableOpacity onPress={onPress}>
                            <Text style={{color: color, fontSize: 18}}>{title}</Text>
                        </TouchableOpacity>
                    ) : (
                        <Button
                            title={title}
                            onPress={onPress}
                            color={color}
                            className="text-lg"
                        />
                    )}
                </View>
            </View>
        </View>
    );
};

export default SettingsItem;