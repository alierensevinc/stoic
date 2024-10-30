import { MMKV } from "react-native-mmkv";
import moment from "moment";
import { create } from "zustand";
import * as Notifications from "expo-notifications";
import axiosInstance from "utils/axiosInstance";

const storage = new MMKV();

const QUOTES_KEY = "quotes";
const ARCHIVE_QUOTES_KEY = "archiveQuotes";
const FUTURE_QUOTES_KEY = "futureQuotes";
const NOTIFICATIONS_ENABLED_KEY = "notificationsEnabled";
const QUOTES_API_URL = "https://stoic-quotes.com/api/quotes?num=20";

const saveToStorage = (key, data) => {
    storage.set(key, JSON.stringify(data));
};

const loadFromStorage = (key) => {
    const storedData = storage.getString(key);
    return storedData ? JSON.parse(storedData) : null;
};

const cancelAllNotifications = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
};

const scheduleNotification = async (quote) => {
    const notificationsEnabled = storage.getBoolean(NOTIFICATIONS_ENABLED_KEY);
    if (!notificationsEnabled) return;

    await cancelAllNotifications();

    let triggerTime = new Date();
    const currentHour = triggerTime.getHours();

    if (currentHour >= 22 || currentHour < 9) {
        triggerTime.setHours(9, 0, 0, 0);
        if (triggerTime <= new Date()) {
            triggerTime.setDate(triggerTime.getDate() + 1);
        }
    } else {
        triggerTime.setHours(triggerTime.getHours() + 1);
    }

    await Notifications.scheduleNotificationAsync({
        content: {
            title: quote.text,
            body: quote.author,
            data: { type: "futureQuotes" },
        },
        trigger: triggerTime,
    });
};

const fetchQuotesFromAPI = async () => {
    try {
        const response = await axiosInstance.get(QUOTES_API_URL);
        return response.data;
    } catch (error) {
        console.error("Error fetching quotes from API:", error);
        return [];
    }
};

const fetchAndStoreQuotes = async (setQuotes, setArchiveQuotes, setFutureQuotes) => {
    const oldQuotes = loadFromStorage(QUOTES_KEY)?.quotes || [];
    setArchiveQuotes(oldQuotes);

    const quotes = await fetchQuotesFromAPI();
    saveToStorage(QUOTES_KEY, { date: moment().format("YYYY-MM-DD HH"), quotes });
    setQuotes(quotes);

    const futureQuotes = await fetchQuotesFromAPI();
    saveToStorage(FUTURE_QUOTES_KEY, futureQuotes);
    setFutureQuotes(futureQuotes);

    if (futureQuotes.length > 0) {
        await scheduleNotification(futureQuotes[0]);
    }
};

const loadQuotesFromArchive = (setQuotes) => {
    const archiveQuotes = loadFromStorage(ARCHIVE_QUOTES_KEY);
    if (archiveQuotes) {
        setQuotes(archiveQuotes);
    }
};

const handleFutureQuotesNotification = async () => {
    const {
        futureQuotes,
        setQuotes,
        setCameFromNotification,
        setNotificationFutureQuote,
        setPreventFetch,
        setFutureQuotes,
    } = useQuoteStore.getState();

    if (!futureQuotes || futureQuotes.length === 0) {
        const storedFutureQuotes = loadFromStorage(FUTURE_QUOTES_KEY);
        if (storedFutureQuotes) {
            setNotificationFutureQuote(storedFutureQuotes[0]);
            setQuotes([storedFutureQuotes[0], ...storedFutureQuotes.slice(1)]);
        }
    } else {
        setNotificationFutureQuote(futureQuotes[0]);
        setQuotes([futureQuotes[0], ...futureQuotes.slice(1)]);
    }

    setCameFromNotification(true);
    setPreventFetch(true);

    const newFutureQuotes = await fetchQuotesFromAPI();
    saveToStorage(FUTURE_QUOTES_KEY, newFutureQuotes);
    setFutureQuotes(newFutureQuotes);

    await cancelAllNotifications();

    if (newFutureQuotes.length > 0) {
        await scheduleNotification(newFutureQuotes[0]);
    }
};

Notifications.addNotificationResponseReceivedListener((response) => {
    if (response.notification.request.content.data.type === "futureQuotes") {
        handleFutureQuotesNotification();
    }
});

const initializeNotifications = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") {
        console.error("Notification permissions not granted");
        return;
    }

    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
        }),
    });
};

export const useQuoteStore = create((set) => ({
    quotes: [],
    archiveQuotes: [],
    futureQuotes: [],
    cameFromNotification: false,
    notificationFutureQuote: null,
    preventFetch: false,

    setQuotes: (quotes) => set({ quotes }),
    setArchiveQuotes: (archiveQuotes) => set({ archiveQuotes }),
    setFutureQuotes: (futureQuotes) => set({ futureQuotes }),
    setCameFromNotification: (value) => set({ cameFromNotification: value }),
    setNotificationFutureQuote: (quote) => set({ notificationFutureQuote: quote }),
    setPreventFetch: (value) => set({ preventFetch: value }),

    fetchQuotes: async () => {
        const {
            cameFromNotification,
            notificationFutureQuote,
            preventFetch,
            setQuotes,
            setArchiveQuotes,
            setFutureQuotes,
            setCameFromNotification,
            setNotificationFutureQuote,
            setPreventFetch,
        } = useQuoteStore.getState();

        if (preventFetch) {
            setPreventFetch(false);
            return;
        }

        if (cameFromNotification && notificationFutureQuote) {
            setQuotes([notificationFutureQuote, ...futureQuotes.slice(1)]);
            setCameFromNotification(false);
            setNotificationFutureQuote(null);
        } else {
            await fetchAndStoreQuotes(setQuotes, setArchiveQuotes, setFutureQuotes);
        }
    },

    loadQuotesFromArchive: () => {
        loadQuotesFromArchive(useQuoteStore.getState().setQuotes);
    },
}));

useQuoteStore.subscribe(
    (state) => state.archiveQuotes,
    (archiveQuotes) => saveToStorage(ARCHIVE_QUOTES_KEY, archiveQuotes)
);

useQuoteStore.subscribe(
    (state) => state.futureQuotes,
    (futureQuotes) => saveToStorage(FUTURE_QUOTES_KEY, futureQuotes)
);

export { initializeNotifications };