import {Platform, Pressable, StatusBar} from "react-native";
import {useHome} from "hooks/useHome";
import ThemeToggle from "components/ThemeToggle";
import ActionButtons from "components/ActionButtons";
import QuoteViewShot from "components/QuoteViewShot";
import Container from "components/Container";
import SettingsButton from "components/SettingsButton";
import StreakBadge from "components/StreakBadge";
import NoteModal from "components/NoteModal";
import Animated from "react-native-reanimated";

const HomeScreen = () => {
    const {
        theme,
        isDarkMode,
        quotes,
        viewShotRef,
        panGesture,
        animatedStyle,
        fadeStyle,
        shareQuote,
        navigateToBookmarks,
        toggleBookmark,
        handleNextQuoteClick,
        isBookmarked,
        noteModalVisible,
        currentNote,
        hasNote,
        openNoteModal,
        closeNoteModal,
        handleSaveNote,
    } = useHome();

    if (Platform.OS === "android" && !isDarkMode) {
        StatusBar.setBarStyle('dark-content')
    } else if (Platform.OS === "android" && isDarkMode) {
        StatusBar.setBarStyle('light-content')
    }

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
                            panGesture={panGesture}
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
                openNoteModal={openNoteModal}
                hasNote={hasNote}
            />
            <ThemeToggle/>
            <SettingsButton theme={theme}/>
            <StreakBadge theme={theme}/>
            <NoteModal
                visible={noteModalVisible}
                initialNote={currentNote}
                theme={theme}
                onSave={handleSaveNote}
                onClose={closeNoteModal}
            />
        </Container>
    );
};

export default HomeScreen;