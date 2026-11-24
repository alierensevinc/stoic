import {Pressable} from "react-native";
import {StatusBar} from "expo-status-bar";
import Animated from "react-native-reanimated";
import {useHome} from "hooks/useHome";
import ThemeToggle from "components/ThemeToggle";
import ActionButtons from "components/ActionButtons";
import QuoteViewShot from "components/QuoteViewShot";
import Container from "components/Container";
import SettingsButton from "components/SettingsButton";
import StreakBadge from "components/StreakBadge";
import NoteModal from "components/NoteModal";

const HomeScreen = () => {
    const {
        theme,
        isDarkMode,
        currentQuote,
        viewShotRef,
        panGesture,
        animatedStyle,
        fadeStyle,
        shareQuote,
        navigateToBookmarks,
        navigateToNotes,
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

    return (
        <Container>
            <StatusBar
                style={isDarkMode ? "light" : "dark"}
                backgroundColor={theme.statusBarBackgroundColor}
            />
            {currentQuote && (
                <Pressable
                    onPress={handleNextQuoteClick}
                    accessibilityRole="button"
                    accessibilityLabel="Tap or swipe for next Stoic quote"
                >
                    <Animated.View style={fadeStyle}>
                        <QuoteViewShot
                            viewShotRef={viewShotRef}
                            panGesture={panGesture}
                            animatedStyle={animatedStyle}
                            theme={theme}
                            quote={currentQuote}
                            captureOnReady={false}
                        />
                    </Animated.View>
                </Pressable>
            )}
            <ActionButtons
                theme={theme}
                shareQuote={shareQuote}
                navigateToBookmarks={navigateToBookmarks}
                navigateToNotes={navigateToNotes}
                addToBookmarks={toggleBookmark}
                isBookmarked={isBookmarked}
                openNoteModal={openNoteModal}
                hasNote={hasNote}
            />
            <ThemeToggle />
            <SettingsButton theme={theme} />
            <StreakBadge theme={theme} />
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
