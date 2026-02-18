import { Dimensions, Platform, ScrollView, Text, View } from "react-native";
import { useSettings } from "hooks/useSettings";
import Container from "components/Container";
import BackButton from "components/BackButton";
import InlineAd from "components/InlineAd";
import SettingsItem from "components/SettingsItem";
import SettingsToggleItem from "components/SettingsToggleItem";
import AppInfo from "components/AppInfo";
import Divider from "components/Divider";

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
        handleVisitPrivacyPolicy
    } = useSettings();

    const screenHeight = Dimensions.get("window").height;

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
                    Settings
                </Text>
            </View>
            {screenHeight < 812 ? (
                <ScrollView className="flex-1 w-100">
                    <SettingsToggleItem
                        icon="time-outline"
                        title="Notifications"
                        isToggle={true}
                        toggleValue={notificationsEnabled}
                        onToggleChange={handleToggleNotifications}
                        color={theme.textColor}
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
                    {Platform.OS === 'ios' && (
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
            ) : (
                <View className="flex-1 w-100">
                    <SettingsToggleItem
                        icon="time-outline"
                        title="Notifications"
                        isToggle={true}
                        toggleValue={notificationsEnabled}
                        onToggleChange={handleToggleNotifications}
                        color={theme.textColor}
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
                    {Platform.OS === 'ios' && (
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
                </View>
            )}
            <AppInfo theme={theme} />
            <InlineAd className="absolute bottom-0 left-0 right-0 self-center" />
        </Container>
    );
};

export default SettingsScreen;