import { SwipeListView } from "react-native-swipe-list-view";
import QuoteListItem from "./QuoteListItem";
import QuoteListItemActions from "./QuoteListItemActions";

const QuoteList = ({ data, theme, onShare, onDelete }) => (
  <SwipeListView
    data={data}
    renderItem={({ item }) => <QuoteListItem item={item} theme={theme} />}
    renderHiddenItem={({ item }) => (
      <QuoteListItemActions
        theme={theme}
        onShare={() => onShare(item)}
        onDelete={() => onDelete(item)}
      />
    )}
    rightOpenValue={-160}
    disableRightSwipe
    keyExtractor={(item) => item.text}
    contentContainerStyle={{ paddingBottom: 20 }}
  />
);

export default QuoteList;
