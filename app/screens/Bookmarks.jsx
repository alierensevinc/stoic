import React from "react";
import { View, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useBookmarks } from "hooks/useBookmarks";
import InlineAd from "components/InlineAd";
import QuoteViewShot from "components/QuoteViewShot";
import BackButton from "components/BackButton";
import EmptyState from "components/EmptyState";
import QuoteList from "components/QuoteList";
import Container from "components/Container";

const BookmarksScreen = () => {
  const navigation = useNavigation();
  const {
    bookmarks,
    theme,
    shareState,
    viewShotRef,
    shareQuote,
    confirmDelete,
  } = useBookmarks();

  return (
    <Container>
      <BackButton
        onPress={() => navigation.goBack()}
        color={theme.buttonColor}
      />
      <Text
        style={{
          fontSize: 24,
          fontWeight: "bold",
          marginBottom: 20,
          textAlign: "center",
          color: theme.textColor,
          fontFamily: "Montserrat-Medium",
        }}
      >
        Bookmarks
      </Text>
      {bookmarks.length > 0 ? (
        <QuoteList
          data={bookmarks}
          theme={theme}
          onShare={shareQuote}
          onDelete={confirmDelete}
        />
      ) : (
        <View style={{ flex: 1, justifyContent: "center" }}>
          <EmptyState text="No bookmarks yet" color={theme.textColor} />
        </View>
      )}
      <InlineAd
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          alignSelf: "center",
        }}
      />
      {shareState.showShareQuote && shareState.quoteToShare && (
        <View
          style={{
            position: "absolute",
            top: -1000,
            left: -1000,
            width: "100%",
            height: "100%",
            opacity: 0,
          }}
        >
          <QuoteViewShot
            viewShotRef={viewShotRef}
            theme={theme}
            quote={shareState.quoteToShare}
            captureOnReady={true}
          />
        </View>
      )}
    </Container>
  );
};

export default BookmarksScreen;
