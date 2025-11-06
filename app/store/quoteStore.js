import {MMKV} from "react-native-mmkv";
import {create} from "zustand";
import * as Notifications from "expo-notifications";
import localQuotes from '../../assets/quotes.json';

const storage = new MMKV();
const NOTIFICATIONS_ENABLED_KEY = "notificationsEnabled";
const QUOTES_KEY = "quotes";

/**
 * Calculates the next trigger date for a given hour/minute.
 * If the time has already passed for today, it schedules for tomorrow.
 * @param {number} hour - The hour to trigger (0-23)
 * @param {number} minute - The minute to trigger (0-59)
 * @returns {Date} - The calculated next trigger Date object
 */
const getNextTriggerDate = (hour, minute) => {
    const now = new Date();
    const triggerDate = new Date();
    triggerDate.setHours(hour, minute, 0, 0);

    // If the calculated time for today has already passed...
    if (now.getTime() > triggerDate.getTime()) {
        // ...schedule it for tomorrow.
        triggerDate.setDate(triggerDate.getDate() + 1);
    }

    return triggerDate;
};

/**
 * Schedules two daily notifications (Morning & Evening) for the *next*
 * available 09:00 and 19:00. This fixes the "immediate fire" bug.
 */
export const scheduleDailyRitualNotifications = async () => {
    const notificationsEnabled = storage.getBoolean(NOTIFICATIONS_ENABLED_KEY);

    // 1. Always cancel previous notifications to clear stale/invalid ones
    await Notifications.cancelAllScheduledNotificationsAsync();

    if (!notificationsEnabled) {
        console.log("Notifications are disabled. All notifications cancelled.");
        return;
    }

    // 2. Get quotes from storage
    const storedQuotes = storage.getString(QUOTES_KEY);
    let quotes = [];
    try {
        const parsed = storedQuotes ? JSON.parse(storedQuotes) : [];
        if (Array.isArray(parsed) && parsed.length > 0) {
            quotes = parsed;
        }
    } catch (e) {
        console.error("Failed to parse quotes for scheduling", e);
    }

    if (quotes.length < 2) {
        quotes = localQuotes.quotes ? [...localQuotes.quotes] : [];
        if (quotes.length < 2) {
            console.error("Not enough quotes to schedule rituals.");
            return;
        }
    }

    const morningQuote = quotes[0];
    const eveningQuote = quotes[1];

    // 3. Calculate and schedule Morning Notification (09:00)
    const morningTrigger = getNextTriggerDate(9, 0);
    await Notifications.scheduleNotificationAsync({
        content: {
            title: "Morning Intention",
            body: `"${morningQuote.text}" - ${morningQuote.author}`,
            data: {type: "dailyQuote", quote: morningQuote},
        },
        trigger: morningTrigger, // Use the calculated Date object
    });

    // 4. Calculate and schedule Evening Notification (19:00)
    const eveningTrigger = getNextTriggerDate(19, 0);
    await Notifications.scheduleNotificationAsync({
        content: {
            title: "Evening Reflection",
            body: `"${eveningQuote.text}" - ${eveningQuote.author}`,
            data: {type: "dailyQuote", quote: eveningQuote},
        },
        trigger: eveningTrigger, // Use the calculated Date object
    });

    console.log(`Ritual notifications scheduled for: ${morningTrigger.toLocaleString()} and ${eveningTrigger.toLocaleString()}`);
};

/**
 * Initializes notifications on app start.
 */
export const initializeNotifications = async () => {
    const {status} = await Notifications.requestPermissionsAsync();
    if (status !== "granted") {
        console.error("Notification permissions not granted");
        storage.set(NOTIFICATIONS_ENABLED_KEY, false);
        return;
    }

    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowBanner: true,
            shouldShowList: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
        }),
    });

    if (status === 'granted') {
        storage.set(NOTIFICATIONS_ENABLED_KEY, true);

        // Check if notifications are *enabled* by the user
        const userEnabled = storage.getBoolean(NOTIFICATIONS_ENABLED_KEY);
        if (userEnabled) {
            // Check if notifications are already scheduled
            const scheduled = await Notifications.getAllScheduledNotificationsAsync();
            if (scheduled.length === 0) {
                // If none are scheduled (e.g., first launch or after they've fired), schedule new ones.
                console.log("No notifications scheduled. Setting up daily rituals.");
                await scheduleDailyRitualNotifications();
            } else {
                console.log(`${scheduled.length} notifications already scheduled.`);
            }
        }
    }
};

/**
 * Zustand state management store
 */
export const useQuoteStore = create((set) => ({
    quotes: [],
    notificationQuote: null,
    setNotificationQuote: (quote) => set({notificationQuote: quote}),
    clearNotificationQuote: () => set({notificationQuote: null}),
    setQuotes: (quotes) => {
        set({quotes});
        storage.set(QUOTES_KEY, JSON.stringify(quotes));
    },

    /**
     * Loads quotes from storage or local JSON and shuffles them.
     * Scheduling is now handled by initializeNotifications.
     */
    loadQuotes: () => {
        const storedQuotes = storage.getString(QUOTES_KEY);
        let loadedQuotes = [];

        try {
            if (storedQuotes) {
                const parsed = JSON.parse(storedQuotes);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    loadedQuotes = parsed;
                }
            }
        } catch (err) {
            console.error("Failed to parse stored quotes, falling back to local.");
            loadedQuotes = [];
        }

        if (loadedQuotes.length === 0) {
            loadedQuotes = localQuotes.quotes ? [...localQuotes.quotes] : [];
        }

        const shuffled = shuffle(loadedQuotes);
        set({quotes: shuffled});
        storage.set(QUOTES_KEY, JSON.stringify(shuffled));

        // We no longer schedule notifications here, as it causes bugs.
        // Scheduling is handled by initializeNotifications() in App.js
        // and by handleToggleNotifications() in useSettings.js
    },
}));

/**
 * Notification click listener. (No changes needed)
 */
Notifications.addNotificationResponseReceivedListener((response) => {
    const {quote} = response.notification.request.content.data;
    if (quote) {
        useQuoteStore.getState().setNotificationQuote(quote);
    }
});

/**
 * Fisher-Yates (aka Knuth) Shuffle algorithm. (No changes needed)
 */
function shuffle(array) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
    return array;
}