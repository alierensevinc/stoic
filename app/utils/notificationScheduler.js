import {AppState} from "react-native";
import * as Notifications from "expo-notifications";
import {
    ALL_QUOTES,
    applyAuthorFilter,
    getQuoteOfTheDay,
    QUOTES_BY_ID,
    useQuoteStore,
} from "store/quoteStore";
import {getJSON, storage} from "utils/storage";
import {logger} from "utils/logger";

export const NOTIFICATIONS_ENABLED_KEY = "notificationsEnabled";
const MORNING_HOUR_KEY = "notificationMorningHour";
const EVENING_HOUR_KEY = "notificationEveningHour";

export const DEFAULT_MORNING_HOUR = 9;
export const DEFAULT_EVENING_HOUR = 19;

const ROLLING_DAYS_AHEAD = 14;
const RESCHEDULE_DEBOUNCE_MS = 60 * 1000;

let lastScheduleTimestamp = 0;
let appStateSubscriptionInstalled = false;

export const getRitualHours = () => ({
    morning: storage.contains(MORNING_HOUR_KEY)
        ? storage.getNumber(MORNING_HOUR_KEY)
        : DEFAULT_MORNING_HOUR,
    evening: storage.contains(EVENING_HOUR_KEY)
        ? storage.getNumber(EVENING_HOUR_KEY)
        : DEFAULT_EVENING_HOUR,
});

export const setRitualHour = (ritual, hour) => {
    const key = ritual === "morning" ? MORNING_HOUR_KEY : EVENING_HOUR_KEY;
    storage.set(key, hour);
};

const getFilteredQuotesPool = () => {
    const preferredAuthors = getJSON("preferredAuthors", []);
    const storedOrder = getJSON("quoteOrderIds", []);
    if (Array.isArray(storedOrder) && storedOrder.length > 0) {
        const mapped = storedOrder
            .map((id) => QUOTES_BY_ID[id])
            .filter(Boolean);
        if (mapped.length > 0) {
            return mapped;
        }
    }
    return applyAuthorFilter(ALL_QUOTES, preferredAuthors);
};

/**
 * Schedules a rolling window of 14 days x 2 rituals (28 one-shot DATE triggers,
 * well below iOS's 64 scheduled notification limit) where each morning slot uses
 * that date's Quote of the Day and each evening slot uses a distinct reflection quote.
 * Also schedules 1 weekly fallback reminder if the user does not open the app for >2 weeks.
 */
export const scheduleDailyRitualNotifications = async () => {
    const notificationsEnabled = storage.getBoolean(NOTIFICATIONS_ENABLED_KEY);

    await Notifications.cancelAllScheduledNotificationsAsync();

    if (!notificationsEnabled) {
        logger.log("Notifications are disabled. All notifications cancelled.");
        return;
    }

    const quotes = getFilteredQuotesPool();
    if (quotes.length < 2) {
        logger.error("Not enough quotes to schedule rituals.");
        return;
    }

    const preferredAuthors = getJSON("preferredAuthors", []);
    const {morning, evening} = getRitualHours();
    const now = new Date();
    let scheduledCount = 0;

    for (let dayOffset = 0; dayOffset < ROLLING_DAYS_AHEAD; dayOffset++) {
        const targetDate = new Date(now);
        targetDate.setDate(now.getDate() + dayOffset);

        const morningQuote =
            getQuoteOfTheDay(targetDate, preferredAuthors) ||
            quotes[(dayOffset * 2) % quotes.length];
        const eveningCandidate =
            quotes[(dayOffset * 2 + 1 + Math.floor(quotes.length / 2)) % quotes.length];
        const eveningQuote =
            eveningCandidate.id === morningQuote.id
                ? quotes[(dayOffset * 2 + 2) % quotes.length]
                : eveningCandidate;

        const slots = [
            {
                hour: morning,
                minute: 0,
                title: "Morning Intention",
                ritual: "morning",
                quote: morningQuote,
            },
            {
                hour: evening,
                minute: 0,
                title: "Evening Reflection",
                ritual: "evening",
                quote: eveningQuote,
            },
        ];

        for (const slot of slots) {
            const fireDate = new Date(targetDate);
            fireDate.setHours(slot.hour, slot.minute, 0, 0);
            if (fireDate.getTime() <= now.getTime() + 5000) {
                continue;
            }

            await Notifications.scheduleNotificationAsync({
                content: {
                    title: slot.title,
                    body: `"${slot.quote.text}" - ${slot.quote.author}`,
                    data: {
                        type: "dailyQuote",
                        ritual: slot.ritual,
                        quoteId: slot.quote.id,
                        quote: slot.quote,
                    },
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.DATE,
                    date: fireDate,
                },
            });
            scheduledCount++;
        }
    }

    // Weekly fallback reminder (Sunday at morning hour) so passive users keep receiving wisdom
    const fallbackQuote = quotes[0];
    await Notifications.scheduleNotificationAsync({
        content: {
            title: "Stoic Reflection",
            body: `"${fallbackQuote.text}" - ${fallbackQuote.author}`,
            data: {
                type: "dailyQuote",
                ritual: "weeklyFallback",
                quoteId: fallbackQuote.id,
                quote: fallbackQuote,
            },
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
            weekday: 1,
            hour: morning,
            minute: 0,
        },
    });
    scheduledCount++;

    lastScheduleTimestamp = Date.now();
    logger.log(`Scheduled ${scheduledCount} rolling ritual notifications.`);
};

const handleNotificationResponse = (response) => {
    const data = response?.notification?.request?.content?.data;
    if (!data) return;
    const quote =
        (data.quoteId && QUOTES_BY_ID[data.quoteId]) || data.quote || null;
    if (quote) {
        useQuoteStore.getState().setNotificationQuote(quote);
    }
};

export const initializeNotifications = async () => {
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowBanner: true,
            shouldShowList: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
        }),
    });

    // Cold-start tap handling
    try {
        const lastResponse =
            await Notifications.getLastNotificationResponseAsync();
        if (lastResponse) {
            handleNotificationResponse(lastResponse);
        }
    } catch (e) {
        logger.warn("Failed to read last notification response:", e);
    }

    const {status} = await Notifications.getPermissionsAsync();
    const userEnabled = storage.getBoolean(NOTIFICATIONS_ENABLED_KEY);

    if (status === "granted" && userEnabled) {
        await scheduleDailyRitualNotifications();
    } else if (status !== "granted" && userEnabled) {
        storage.set(NOTIFICATIONS_ENABLED_KEY, false);
    }

    if (!appStateSubscriptionInstalled) {
        appStateSubscriptionInstalled = true;
        AppState.addEventListener("change", async (nextState) => {
            if (nextState !== "active") return;
            if (Date.now() - lastScheduleTimestamp < RESCHEDULE_DEBOUNCE_MS) {
                return;
            }
            const enabled = storage.getBoolean(NOTIFICATIONS_ENABLED_KEY);
            if (!enabled) return;
            const perm = await Notifications.getPermissionsAsync();
            if (perm.status === "granted") {
                await scheduleDailyRitualNotifications();
            }
        });
    }
};

Notifications.addNotificationResponseReceivedListener((response) => {
    handleNotificationResponse(response);
});
