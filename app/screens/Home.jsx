import { StatusBar, Pressable } from "react-native";
import { useHome } from "hooks/useHome";
import ThemeToggle from "components/ThemeToggle";
import ActionButtons from "components/ActionButtons";
import QuoteViewShot from "components/QuoteViewShot";
import Container from "components/Container";
import SettingsButton from "components/SettingsButton";

const HomeScreen = () => {
  const {
    theme,
    quotes,
    viewShotRef,
    gestureHandler,
    animatedStyle,
    shareQuote,
    navigateToBookmarks,
    toggleBookmark,
    handleNextQuoteClick,
    isBookmarked,
  } = useHome();

  return (
    <Container>
      <StatusBar
        style={theme.statusBarStyle}
        backgroundColor={theme.statusBarBackgroundColor}
      />
      {quotes.length > 0 && (
        <Pressable onPress={handleNextQuoteClick}>
          <QuoteViewShot
            viewShotRef={viewShotRef}
            gestureHandler={gestureHandler}
            animatedStyle={animatedStyle}
            theme={theme}
            quote={quotes[0]}
            captureOnReady={false}
          />
        </Pressable>
      )}
      <ActionButtons
        theme={theme}
        shareQuote={() => shareQuote(quotes[0].author)}
        navigateToBookmarks={navigateToBookmarks}
        addToBookmarks={toggleBookmark}
        isBookmarked={isBookmarked}
      />
      <ThemeToggle />
      <SettingsButton theme={theme} />
    </Container>
  );
};

export default HomeScreen;
