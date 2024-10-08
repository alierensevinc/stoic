import { MMKV } from "react-native-mmkv";
import axios from "axios";
import moment from "moment";
import { create } from "zustand";
import * as Notifications from "expo-notifications";

const storage = new MMKV();

const QUOTES_KEY = "quotes";
const ARCHIVE_QUOTES_KEY = "archiveQuotes";
const FUTURE_QUOTES_KEY = "futureQuotes";
const QUOTES_API_URL = "https://stoic-quotes.com/api/quotes?num=20";

export const useQuoteStore = create((set) => ({
  quotes: [],
  archiveQuotes: [],
  futureQuotes: [],
  cameFromNotification: false,
  setQuotes: (quotes) => set({ quotes }),
  setArchiveQuotes: (archiveQuotes) => set({ archiveQuotes }),
  setFutureQuotes: (futureQuotes) => set({ futureQuotes }),
  setCameFromNotification: (value) => set({ cameFromNotification: value }),

  fetchQuotes: async () => {
    try {
      const {
        cameFromNotification,
        futureQuotes,
        setQuotes,
        setFutureQuotes,
        setCameFromNotification,
      } = useQuoteStore.getState();

      if (cameFromNotification && futureQuotes && futureQuotes.length > 0) {
        setQuotes(futureQuotes);
        setCameFromNotification(false);
        return;
      }

      const storedQuotes = storage.getString(QUOTES_KEY);
      if (storedQuotes) {
        const quotesObject = JSON.parse(storedQuotes);
        if (quotesObject.date === moment().format("YYYY-MM-DD HH")) {
          set({ quotes: quotesObject.quotes });
          return;
        }
      }

      const response = await axios.get(QUOTES_API_URL);
      const quotes = response.data;
      const quotesObject = {
        date: moment().format("YYYY-MM-DD HH"),
        quotes,
      };
      storage.set(QUOTES_KEY, JSON.stringify(quotesObject));
      set({ quotes, archiveQuotes: quotes });

      // Fetch another set of quotes for future use
      const futureResponse = await axios.get(QUOTES_API_URL);
      const newFutureQuotes = futureResponse.data;
      storage.set(FUTURE_QUOTES_KEY, JSON.stringify(newFutureQuotes));
      setFutureQuotes(newFutureQuotes);

      // Schedule a notification for 5 minutes later to load futureQuotes
      await scheduleFutureQuotesNotification();
    } catch (error) {
      console.error("Error fetching quotes:", error);
    }
  },

  loadQuotesFromArchive: () => {
    try {
      const storedArchiveQuotes = storage.getString(ARCHIVE_QUOTES_KEY);
      if (storedArchiveQuotes) {
        const archiveQuotes = JSON.parse(storedArchiveQuotes);
        set({ quotes: archiveQuotes });
      }
    } catch (error) {
      console.error("Error loading quotes from archive:", error);
    }
  },
}));

useQuoteStore.subscribe(
  (state) => state.archiveQuotes,
  (archiveQuotes) => {
    storage.set(ARCHIVE_QUOTES_KEY, JSON.stringify(archiveQuotes));
  }
);

useQuoteStore.subscribe(
  (state) => state.futureQuotes,
  (futureQuotes) => {
    storage.set(FUTURE_QUOTES_KEY, JSON.stringify(futureQuotes));
  }
);

// Function to handle the notification trigger
async function handleFutureQuotesNotification() {
  const { futureQuotes, setQuotes, setCameFromNotification } =
    useQuoteStore.getState();

  if (!futureQuotes || futureQuotes.length === 0) {
    const storedFutureQuotes = storage.getString(FUTURE_QUOTES_KEY);
    if (storedFutureQuotes) {
      const parsedFutureQuotes = JSON.parse(storedFutureQuotes);
      setQuotes(parsedFutureQuotes);
    }
  } else {
    setQuotes(futureQuotes);
  }

  setCameFromNotification(true);
}

// Listen for notification responses
Notifications.addNotificationResponseReceivedListener((response) => {
  if (response.notification.request.content.data.type === "futureQuotes") {
    handleFutureQuotesNotification();
  }
});

export async function scheduleFutureQuotesNotification() {
  try {
    const { futureQuotes } = useQuoteStore.getState();
    if (futureQuotes.length === 0) {
      console.error("No future quotes available to schedule notification");
      return;
    }

    const firstFutureQuote = futureQuotes[0]; // Get the first future quote

    await Notifications.scheduleNotificationAsync({
      content: {
        title: firstFutureQuote.text, // Use the quote text as the title
        body: firstFutureQuote.author, // Use the author as the body
        data: { type: "futureQuotes" },
      },
      trigger: { seconds: 300 }, // 5 minutes
    });
  } catch (error) {
    console.error("Error scheduling future quotes notification:", error);
  }
}

export const initializeNotifications = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") {
    console.error("Notification permissions not granted");
    return;
  }

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true, // should keep on to work on Android
      shouldSetBadge: false,
    }),
  });
};
