import {createStackNavigator, TransitionSpecs} from "@react-navigation/stack";
import HomeScreen from "screens/Home";
import BookmarksScreen from "screens/Bookmarks";
import SettingsScreen from "screens/Settings";
import {bookmarkScreenInterpolator, settingsScreenInterpolator,} from "utils/animations";

const Stack = createStackNavigator();

const AppNavigator = () => (
    <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{
                transitionSpec: {
                    open: TransitionSpecs.TransitionIOSSpec,
                    close: TransitionSpecs.TransitionIOSSpec,
                },
            }}
        />
        <Stack.Screen
            name="Bookmarks"
            component={BookmarksScreen}
            options={{
                transitionSpec: {
                    open: TransitionSpecs.TransitionIOSSpec,
                    close: TransitionSpecs.TransitionIOSSpec,
                },
                cardStyleInterpolator: bookmarkScreenInterpolator,
            }}
        />
        <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
                transitionSpec: {
                    open: TransitionSpecs.TransitionIOSSpec,
                    close: TransitionSpecs.TransitionIOSSpec,
                },
                cardStyleInterpolator: settingsScreenInterpolator,
            }}
        />
    </Stack.Navigator>
);

export default AppNavigator;
