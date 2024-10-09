import { MMKV } from "react-native-mmkv";
import axios from "axios";
import moment from "moment";
import { create } from "zustand";
import * as Notifications from "expo-notifications";

const storage = new MMKV();

const QUOTES_KEY = "quotes";
const ARCHIVE_QUOTES_KEY = "archiveQuotes";
const FUTURE_QUOTES_KEY = "futureQuotes";
const NOTIFICATIONS_ENABLED_KEY = "notificationsEnabled";
const QUOTES_API_URL = "https://stoic-quotes.com/api/quotes?num=20";

// Utility functions
const saveToStorage = (key, data) => {
  storage.set(key, JSON.stringify(data));
};

const loadFromStorage = (key) => {
  const storedData = storage.getString(key);
  return storedData ? JSON.parse(storedData) : null;
};

// Notification functions
const scheduleNotification = async (quote) => {
  try {
    const notificationsEnabled = storage.getBoolean(NOTIFICATIONS_ENABLED_KEY);
    if (!notificationsEnabled) {
      console.log("Notifications are disabled. Skipping scheduling.");
      return;
    }

    const startHour = 9;
    const endHour = 23;

    for (let hour = startHour; hour <= endHour; hour++) {
      let triggerTime = new Date();
      triggerTime.setHours(hour);
      triggerTime.setMinutes(0);
      triggerTime.setSeconds(0);

      // If the trigger time is in the past, schedule it for the next day
      if (triggerTime <= new Date()) {
        triggerTime.setDate(triggerTime.getDate() + 1);
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: quote.text,
          body: quote.author,
          data: { type: "futureQuotes" },
        },
        trigger: triggerTime,
      });
    }
  } catch (error) {
    console.error("Error scheduling future quotes notification:", error);
  }
};

// Fetch functions
const fetchQuotesFromAPI = async () => {
  try {
    const response = await axios.get(QUOTES_API_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching quotes from API:", error);
    return [];
  }
};

const fetchQuotes = async (setQuotes, setArchiveQuotes, setFutureQuotes) => {
  const oldQuotes = loadFromStorage(QUOTES_KEY)?.quotes || [];
  setArchiveQuotes(oldQuotes);

  const quotes = await fetchQuotesFromAPI();
  const quotesObject = {
    date: moment().format("YYYY-MM-DD HH"),
    quotes,
  };
  saveToStorage(QUOTES_KEY, quotesObject);
  setQuotes(quotes);

  const futureQuotes = await fetchQuotesFromAPI();
  saveToStorage(FUTURE_QUOTES_KEY, futureQuotes);
  setFutureQuotes(futureQuotes);

  await scheduleNotification(futureQuotes[0]);
};

const loadQuotesFromArchive = (setQuotes) => {
  const archiveQuotes = loadFromStorage(ARCHIVE_QUOTES_KEY);
  if (archiveQuotes) {
    setQuotes(archiveQuotes);
  }
};

// Store creation
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
  setNotificationFutureQuote: (quote) =>
    set({ notificationFutureQuote: quote }),
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
      await fetchQuotes(setQuotes, setArchiveQuotes, setFutureQuotes);
    }
  },

  loadQuotesFromArchive: () => {
    loadQuotesFromArchive(useQuoteStore.getState().setQuotes);
  },
}));

// Subscriptions
useQuoteStore.subscribe(
  (state) => state.archiveQuotes,
  (archiveQuotes) => saveToStorage(ARCHIVE_QUOTES_KEY, archiveQuotes)
);

useQuoteStore.subscribe(
  (state) => state.futureQuotes,
  (futureQuotes) => saveToStorage(FUTURE_QUOTES_KEY, futureQuotes)
);

// Notification handler
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

  // Fetch new future quotes before scheduling the next notification
  const newFutureQuotes = await fetchQuotesFromAPI();
  saveToStorage(FUTURE_QUOTES_KEY, newFutureQuotes);
  setFutureQuotes(newFutureQuotes);

  await scheduleNotification(newFutureQuotes[0]);
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

export { initializeNotifications };
