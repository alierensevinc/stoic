import {FlatList, View} from "react-native";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import QuoteListItem from "./QuoteListItem";
import QuoteListItemActions from "./QuoteListItemActions";

const QuoteList = ({data, theme, onShare, onDelete}) => (
    <FlatList
        data={data}
        className="w-full"
        keyExtractor={(item, index) => item.id || item.text || String(index)}
        contentContainerStyle={{paddingBottom: 20}}
        renderItem={({item}) => (
            <ReanimatedSwipeable
                friction={2}
                rightThreshold={40}
                overshootRight={false}
                renderRightActions={() => (
                    <View style={{width: 160}}>
                        <QuoteListItemActions
                            theme={theme}
                            onShare={() => onShare(item)}
                            onDelete={() => onDelete(item)}
                        />
                    </View>
                )}
            >
                <QuoteListItem item={item} theme={theme} />
            </ReanimatedSwipeable>
        )}
    />
);

export default QuoteList;
