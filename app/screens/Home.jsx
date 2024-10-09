import React from "react";
import { StatusBar } from "expo-status-bar";
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
    isBookmarked,
  } = useHome();

  return (
    <Container>
      <StatusBar
        style={theme.statusBarStyle}
        backgroundColor={theme.statusBarBackgroundColor}
      />
      {quotes.length > 0 && (
        <QuoteViewShot
          viewShotRef={viewShotRef}
          gestureHandler={gestureHandler} // Pass gesture handler
          animatedStyle={animatedStyle} // Pass animated style
          theme={theme}
          quote={quotes[0]} // Pass only the current quote
          captureOnReady={false} // Ensure it doesn't capture automatically
        />
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
