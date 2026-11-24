import {ScrollView, Text, View} from "react-native";
import {useSettings} from "hooks/useSettings";
import Container from "components/Container";
import BackButton from "components/BackButton";
import InlineAd from "components/InlineAd";
import SettingsItem from "components/SettingsItem";
import SettingsToggleItem from "components/SettingsToggleItem";
import AppInfo from "components/AppInfo";
import Divider from "components/Divider";
import TimePickerModal from "components/TimePickerModal";
import AuthorFilterModal from "components/AuthorFilterModal";

const SettingsScreen = () => {
    const {
        theme,
        navigation,
        removeAllBookmarks,
        notificationsEnabled,
        handleToggleNotifications,
        handleSendEmail,
        handleOpenLinkedin,
        handleShare,
        handleRate,
        handleVisitPrivacyPolicy,
        privacyOptionsRequired,
        handleShowPrivacyOptions,
        matchAppIconToTheme,
        toggleMatchAppIconToTheme,
        isIos,
        ritualHours,
        morningPickerVisible,
        eveningPickerVisible,
        openMorningPicker,
        closeMorningPicker,
        openEveningPicker,
        closeEveningPicker,
        handleSelectRitualHour,
        authors,
        preferredAuthors,
        authorFilterVisible,
        openAuthorFilter,
        closeAuthorFilter,
        handleToggleAuthor,
    } = useSettings();

    const formatHour = (hour) => `${String(hour).padStart(2, "0")}:00`;

    return (
        <Container>
            <View className="flex-row justify-start items-center w-full pl-4 pt-4">
                <BackButton
                    onPress={() => navigation.goBack()}
                    color={theme.buttonColor}
                />
                <Text
                    className="text-3xl font-bold text-center ml-2"
                    style={{color: theme.textColor, fontFamily: "Montserrat-Medium"}}
                >
                    Settings
                </Text>
            </View>
            <ScrollView
                className="flex-1 w-full"
                contentContainerStyle={{paddingBottom: 24}}
                showsVerticalScrollIndicator={false}
            >
                <SettingsToggleItem
                    icon="time-outline"
                    title="Notifications"
                    toggleValue={notificationsEnabled}
                    onToggleChange={handleToggleNotifications}
                    color={theme.textColor}
                />
                {notificationsEnabled && (
                    <>
                        <SettingsItem
                            icon="sunny-outline"
                            title={`Morning ritual: ${formatHour(ritualHours.morning)}`}
                            onPress={openMorningPicker}
                            color={theme.buttonColor}
                        />
                        <SettingsItem
                            icon="moon-outline"
                            title={`Evening ritual: ${formatHour(ritualHours.evening)}`}
                            onPress={openEveningPicker}
                            color={theme.buttonColor}
                        />
                    </>
                )}
                {isIos && (
                    <SettingsToggleItem
                        icon="color-palette-outline"
                        title="Match app icon to theme"
                        toggleValue={matchAppIconToTheme}
                        onToggleChange={toggleMatchAppIconToTheme}
                        color={theme.textColor}
                    />
                )}
                <Divider color={theme.textColor} />
                <SettingsItem
                    icon="person-outline"
                    title={
                        preferredAuthors.length === 0
                            ? "Philosophers: All"
                            : `Philosophers: ${preferredAuthors.join(", ")}`
                    }
                    onPress={openAuthorFilter}
                    color={theme.buttonColor}
                />
                <SettingsItem
                    icon="journal-outline"
                    title="My Reflections (Notes)"
                    onPress={() => navigation.navigate("Notes")}
                    color={theme.buttonColor}
                />
                <Divider color={theme.textColor} />
                <SettingsItem
                    icon="mail-outline"
                    title="Send me an email"
                    onPress={handleSendEmail}
                    color={theme.buttonColor}
                />
                <SettingsItem
                    icon="logo-linkedin"
                    title="Reach me on LinkedIn"
                    onPress={handleOpenLinkedin}
                    color={theme.buttonColor}
                />
                <SettingsItem
                    icon="shield-checkmark-outline"
                    title="Privacy Policy"
                    onPress={handleVisitPrivacyPolicy}
                    color={theme.buttonColor}
                />
                {privacyOptionsRequired && (
                    <SettingsItem
                        icon="options-outline"
                        title="Ad Privacy Choices"
                        onPress={handleShowPrivacyOptions}
                        color={theme.buttonColor}
                    />
                )}
                {isIos && (
                    <>
                        <Divider color={theme.textColor} />
                        <SettingsItem
                            icon="share-social-outline"
                            title="Share Stoic - Daily Quotes"
                            onPress={handleShare}
                            color={theme.buttonColor}
                        />
                        <SettingsItem
                            icon="star-outline"
                            title="Rate Stoic - Daily Quotes"
                            onPress={handleRate}
                            color={theme.buttonColor}
                        />
                    </>
                )}
                <Divider color={theme.textColor} />
                <SettingsItem
                    icon="trash-outline"
                    title="Delete All Bookmarks"
                    onPress={removeAllBookmarks}
                    color={theme.buttonColor}
                />
            </ScrollView>
            <AppInfo theme={theme} />
            <InlineAd className="absolute bottom-0 left-0 right-0 self-center" />
            <TimePickerModal
                visible={morningPickerVisible}
                title="Morning ritual time"
                selectedHour={ritualHours.morning}
                theme={theme}
                onSelect={(hour) => handleSelectRitualHour("morning", hour)}
                onClose={closeMorningPicker}
            />
            <TimePickerModal
                visible={eveningPickerVisible}
                title="Evening ritual time"
                selectedHour={ritualHours.evening}
                theme={theme}
                onSelect={(hour) => handleSelectRitualHour("evening", hour)}
                onClose={closeEveningPicker}
            />
            <AuthorFilterModal
                visible={authorFilterVisible}
                authors={authors}
                selectedAuthors={preferredAuthors}
                theme={theme}
                onToggle={handleToggleAuthor}
                onClose={closeAuthorFilter}
            />
        </Container>
    );
};

export default SettingsScreen;
