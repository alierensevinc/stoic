import {Text, View} from "react-native";

const QuoteListItem = ({item, theme}) => {
    return (
        <View
            className="p-4 rounded-lg mb-4"
            style={{backgroundColor: theme.backgroundColor}}
        >
            <Text
                className="text-lg mb-2"
                style={{color: theme.textColor, fontFamily: "Montserrat-Regular"}}
            >
                {item.text}
            </Text>
            <Text
                className="text-base text-right"
                style={{color: theme.textColor, fontFamily: "Montserrat-Italic"}}
            >
                - {item.author}
            </Text>
        </View>
    );
};

export default QuoteListItem;
