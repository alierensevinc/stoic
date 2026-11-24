import {StyleSheet, View} from "react-native";

const Divider = ({color}) => {
    return (
        <View
            className="my-2 mx-8"
            style={{
                height: StyleSheet.hairlineWidth,
                backgroundColor: color,
                opacity: 0.25,
            }}
        />
    );
};

export default Divider;
