import {Modal, Pressable, ScrollView, Text, View} from "react-native";

const HOURS = Array.from({length: 24}, (_, i) => i);

const TimePickerModal = ({visible, title, selectedHour, theme, onSelect, onClose}) => (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
        <Pressable
            className="flex-1 justify-center items-center px-8"
            style={{backgroundColor: "rgba(0,0,0,0.5)"}}
            onPress={onClose}
        >
            <Pressable
                className="rounded-2xl p-4 w-full max-h-[70%]"
                style={{backgroundColor: theme.backgroundColor}}
                onPress={() => {}}
            >
                <Text
                    className="text-lg mb-3 text-center"
                    style={{color: theme.textColor, fontFamily: "Montserrat-Medium"}}
                >
                    {title}
                </Text>
                <ScrollView>
                    <View className="flex-row flex-wrap justify-center">
                        {HOURS.map((hour) => {
                            const isSelected = hour === selectedHour;
                            return (
                                <Pressable
                                    key={hour}
                                    onPress={() => onSelect(hour)}
                                    className="m-1 px-3 py-2 rounded-full"
                                    style={{
                                        backgroundColor: isSelected
                                            ? theme.buttonColor
                                            : "transparent",
                                        borderWidth: 1,
                                        borderColor: theme.buttonColor,
                                    }}
                                >
                                    <Text
                                        style={{
                                            color: isSelected
                                                ? theme.backgroundColor
                                                : theme.buttonColor,
                                            fontFamily: "Montserrat-Regular",
                                        }}
                                    >
                                        {String(hour).padStart(2, "0")}:00
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </ScrollView>
            </Pressable>
        </Pressable>
    </Modal>
);

export default TimePickerModal;
