import { MMKV } from "react-native-mmkv";
import axios from "axios";
import moment from "moment";
import { create } from "zustand";

const storage = new MMKV();

const QUOTES_KEY = "quotes";
const ARCHIVE_QUOTES_KEY = "archiveQuotes";
const QUOTES_API_URL = "https://zenquotes.io/api/quotes/";

export const useQuoteStore = create((set) => ({
  quotes: [],
  archiveQuotes: [],
  setQuotes: (quotes) => set({ quotes }),
  setArchiveQuotes: (archiveQuotes) => set({ archiveQuotes }),

  fetchQuotes: async () => {
    try {
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
