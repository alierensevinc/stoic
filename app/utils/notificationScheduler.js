import * as Notifications from "expo-notifications";
import {MMKV} from "react-native-mmkv";
import localQuotes from "../../assets/quotes.json";
import {useQuoteStore} from "store/quoteStore";

const storage = new MMKV();
const NOTIFICATIONS_ENABLED_KEY = "notificationsEnabled";
const QUOTES_KEY = "quotes";
const MORNING_HOUR_KEY = "notificationMorningHour";
const EVENING_HOUR_KEY = "notificationEveningHour";

export const DEFAULT_MORNING_HOUR = 9;
export const DEFAULT_EVENING_HOUR = 19;

// Expo weekday convention: 1 = Sunday ... 7 = Saturday (matches Date#getDay() + 1)
const WEEKDAYS = [1, 2, 3, 4, 5, 6, 7];

/**
 * Reads the user's chosen ritual hours (falls back to the defaults).
 */
export const getRitualHours = () => ({
    morning: storage.contains(MORNING_HOUR_KEY)
        ? storage.getNumber(MORNING_HOUR_KEY)
        : DEFAULT_MORNING_HOUR,
    evening: storage.contains(EVENING_HOUR_KEY)
        ? storage.getNumber(EVENING_HOUR_KEY)
        : DEFAULT_EVENING_HOUR,
});

/**
 * Persists a new ritual hour. Does not reschedule by itself — call
 * `scheduleDailyRitualNotifications` afterwards if notifications are on.
 */
export const setRitualHour = (ritual, hour) => {
    const key = ritual === "morning" ? MORNING_HOUR_KEY : EVENING_HOUR_KEY;
    storage.set(key, hour);
};

const getQuotesPool = () => {
    const storedQuotes = storage.getString(QUOTES_KEY);
    try {
        const parsed = storedQuotes ? JSON.parse(storedQuotes) : [];
        if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
        }
    } catch (e) {
        console.error("Failed to parse stored quotes for scheduling", e);
    }
    return localQuotes.quotes ? [...localQuotes.quotes] : [];
};

// Deterministically spreads quotes across the week so each of the 14
// weekly slots (7 days x morning/evening) gets a distinct quote.
const pickQuote = (quotes, weekday, ritualIndex) => {
    const offset = (weekday - 1) + ritualIndex * WEEKDAYS.length;
    return quotes[offset % quotes.length];
};

/**
 * Schedules one recurring WEEKLY notification per (weekday x ritual) slot.
 * Each trigger repeats natively at the OS level, so rituals keep firing
 * every week without the app ever needing to be reopened or rescheduled.
 * This replaces the previous one-shot Date-based scheduling, which stopped
 * sending notifications entirely after the first morning/evening pair fired.
 */
export const scheduleDailyRitualNotifications = async () => {
    const notificationsEnabled = storage.getBoolean(NOTIFICATIONS_ENABLED_KEY);

    await Notifications.cancelAllScheduledNotificationsAsync();

    if (!notificationsEnabled) {
        console.log("Notifications are disabled. All notifications cancelled.");
        return;
    }

    const quotes = getQuotesPool();
    if (quotes.length < 2) {
        console.error("Not enough quotes to schedule rituals.");
        return;
    }

    const {morning, evening} = getRitualHours();
    const RITUALS = [
        {hour: morning, minute: 0, title: "Morning Intention"},
        {hour: evening, minute: 0, title: "Evening Reflection"},
    ];

    for (const weekday of WEEKDAYS) {
        for (let ritualIndex = 0; ritualIndex < RITUALS.length; ritualIndex++) {
            const ritual = RITUALS[ritualIndex];
            const quote = pickQuote(quotes, weekday, ritualIndex);
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: ritual.title,
                    body: `"${quote.text}" - ${quote.author}`,
                    data: {type: "dailyQuote", quote},
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
                    weekday,
                    hour: ritual.hour,
                    minute: ritual.minute,
                },
            });
        }
    }

    console.log(`Scheduled ${WEEKDAYS.length * RITUALS.length} recurring weekly ritual notifications.`);
};

/**
 * Prepares the notification handler and, if the user already granted
 * permission in a previous session, makes sure rituals are scheduled.
 * Deliberately does NOT call requestPermissionsAsync: the system prompt
 * should only appear when the user opts in via the Settings toggle,
 * not unconditionally on every app launch.
 */
export const initializeNotifications = async () => {
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowBanner: true,
            shouldShowList: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
        }),
    });

    const {status} = await Notifications.getPermissionsAsync();
    const userEnabled = storage.getBoolean(NOTIFICATIONS_ENABLED_KEY);

    if (status === "granted" && userEnabled) {
        const scheduled = await Notifications.getAllScheduledNotificationsAsync();
        if (scheduled.length === 0) {
            console.log("No notifications scheduled. Setting up rituals.");
            await scheduleDailyRitualNotifications();
        } else {
            console.log(`${scheduled.length} ritual notifications already scheduled.`);
        }
    } else if (status !== "granted" && userEnabled) {
        // Permission was revoked outside the app (e.g. iOS Settings); reflect that.
        storage.set(NOTIFICATIONS_ENABLED_KEY, false);
    }
};

/**
 * Notification tap listener: surfaces the tapped quote to the Home screen.
 */
Notifications.addNotificationResponseReceivedListener((response) => {
    const {quote} = response.notification.request.content.data;
    if (quote) {
        useQuoteStore.getState().setNotificationQuote(quote);
    }
});
