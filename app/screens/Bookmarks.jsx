import { Text, View } from "react-native";
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
      <View className="flex-row justify-start items-center w-full pl-4 pt-4">
        <BackButton
          onPress={() => navigation.goBack()}
          color={theme.buttonColor}
        />
        <Text
          className="text-3xl font-bold text-center ml-2"
          style={{ color: theme.textColor, fontFamily: "Montserrat-Medium" }}
        >
          Bookmarks
        </Text>
      </View>
      {bookmarks.length > 0 ? (
        <QuoteList
          data={bookmarks}
          theme={theme}
          onShare={shareQuote}
          onDelete={confirmDelete}
        />
      ) : (
        <View className="flex-1 justify-center">
          <EmptyState text="No bookmarks yet" color={theme.textColor} />
        </View>
      )}
      <InlineAd className="absolute bottom-0 left-0 right-0 self-center" />

      {shareState.showShareQuote && shareState.quoteToShare && (
        <View className="absolute top-[-1000px] left-[-1000px] w-full h-full opacity-0">
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
