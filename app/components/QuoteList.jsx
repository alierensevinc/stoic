import React from "react";
import { SwipeListView } from "react-native-swipe-list-view";
import QuoteItem from "./QuoteItem";
import QuoteItemActions from "./QuoteItemActions";

const QuoteList = ({ data, theme, onShare, onDelete }) => (
  <SwipeListView
    data={data}
    renderItem={({ item }) => <QuoteItem item={item} theme={theme} />}
    renderHiddenItem={({ item }) => (
      <QuoteItemActions
        theme={theme}
        onShare={() => onShare(item)}
        onDelete={() => onDelete(item)}
      />
    )}
    rightOpenValue={-160}
    disableRightSwipe
    keyExtractor={(item) => item.q}
    contentContainerStyle={{ paddingBottom: 20 }}
  />
);

export default QuoteList;
