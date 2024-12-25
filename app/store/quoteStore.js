import {MMKV} from "react-native-mmkv";
import moment from "moment";
import {create} from "zustand";
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

const scheduleNotification = async (quotes) => {
    const notificationsEnabled = storage.getBoolean(NOTIFICATIONS_ENABLED_KEY);
    if (!notificationsEnabled) return;

    await cancelAllNotifications();

    const triggerTimes = [];
    for (let i = 0; i < 7; i++) {
        for (let hour = 9; hour <= 21; hour += 3) {
            let triggerTime = new Date();
            triggerTime.setHours(hour, 0, 0, 0);
            triggerTime.setDate(triggerTime.getDate() + i);
            triggerTimes.push({time: triggerTime, quote: quotes[(i * 5 + (hour - 9) / 3) % quotes.length]});
        }
    }


    for (const {time, quote} of triggerTimes) {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: quote.text,
                body: quote.author,
                data: {type: "futureQuotes", quote: quote},
            },
            trigger: {
                hour: time.getHours(),
                minute: time.getMinutes(),
                day: time.getDate(),
                repeats: false,
            },
        });
    }

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
    saveToStorage(QUOTES_KEY, {date: moment().format("YYYY-MM-DD HH"), quotes});
    setQuotes(quotes);

    const futureQuotes = await fetchQuotesFromAPI();
    saveToStorage(FUTURE_QUOTES_KEY, futureQuotes);
    setFutureQuotes(futureQuotes);

    if (futureQuotes.length > 0) {
        await scheduleNotification(futureQuotes);
    }
};

const loadQuotesFromArchive = (setQuotes) => {
    const archiveQuotes = loadFromStorage(ARCHIVE_QUOTES_KEY);
    if (archiveQuotes) {
        setQuotes(archiveQuotes);
    }
};

const handleFutureQuotesNotification = async (quote) => {
    const {
        futureQuotes,
        setQuotes,
        setCameFromNotification,
        setNotificationFutureQuote,
        setPreventFetch,
        setFutureQuotes,
    } = useQuoteStore.getState();

    let notificationQuote;
    if (!futureQuotes || futureQuotes.length === 0) {
        const storedFutureQuotes = loadFromStorage(FUTURE_QUOTES_KEY);
        if (storedFutureQuotes) {
            notificationQuote = storedFutureQuotes[0];
            setQuotes([notificationQuote, ...storedFutureQuotes.slice(1)]);
        }
    } else {
        notificationQuote = quote;
        setQuotes([notificationQuote, ...futureQuotes.slice(1)]);
    }

    setNotificationFutureQuote(notificationQuote);
    setCameFromNotification(true);
    setPreventFetch(true);

    const newFutureQuotes = await fetchQuotesFromAPI();
    saveToStorage(FUTURE_QUOTES_KEY, newFutureQuotes);
    setFutureQuotes(newFutureQuotes);

    await cancelAllNotifications();

    if (newFutureQuotes.length > 0) {
        await scheduleNotification(newFutureQuotes);
    }
};

Notifications.addNotificationResponseReceivedListener((response) => {
    const {type, quote} = response.notification.request.content.data;
    if (type === "futureQuotes") {
        handleFutureQuotesNotification(quote);
    }
});

const initializeNotifications = async () => {
    const {status} = await Notifications.requestPermissionsAsync();
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

    if(status === 'granted') {
        console.log(status);
        storage.set(NOTIFICATIONS_ENABLED_KEY, true);
    }
};

export const useQuoteStore = create((set) => ({
    quotes: [],
    archiveQuotes: [],
    futureQuotes: [],
    cameFromNotification: false,
    notificationFutureQuote: null,
    preventFetch: false,

    setQuotes: (quotes) => set({quotes}),
    setArchiveQuotes: (archiveQuotes) => set({archiveQuotes}),
    setFutureQuotes: (futureQuotes) => set({futureQuotes}),
    setCameFromNotification: (value) => set({cameFromNotification: value}),
    setNotificationFutureQuote: (quote) => set({notificationFutureQuote: quote}),
    setPreventFetch: (value) => set({preventFetch: value}),

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

export {initializeNotifications};