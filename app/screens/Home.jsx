import { StatusBar, Pressable } from "react-native";
import { useHome } from "hooks/useHome";
import ThemeToggle from "components/ThemeToggle";
import ActionButtons from "components/ActionButtons";
import QuoteViewShot from "components/QuoteViewShot";
import Container from "components/Container";
import SettingsButton from "components/SettingsButton";
import Animated from "react-native-reanimated";

const HomeScreen = () => {
    const {
        theme,
        quotes,
        viewShotRef,
        gestureHandler,
        animatedStyle,
        fadeStyle,
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
                    <Animated.View style={fadeStyle}>
                        <QuoteViewShot
                            viewShotRef={viewShotRef}
                            gestureHandler={gestureHandler}
                            animatedStyle={animatedStyle}
                            theme={theme}
                            quote={quotes[0]}
                            captureOnReady={false}
                        />
                    </Animated.View>
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