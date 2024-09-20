import { MMKV } from "react-native-mmkv";
import axios from "axios";
import moment from "moment";
import { create } from "zustand";

const storage = new MMKV();

export const useQuoteStore = create((set) => ({
  quotes: [],
  archiveQuotes: [],
  setQuotes: (quotes) => set({ quotes }),
  setArchiveQuotes: (archiveQuotes) => set({ archiveQuotes }),
  fetchQuotes: async () => {
    try {
      const storedQuotes = storage.getString("quotes");
      if (storedQuotes) {
        const quotesObject = JSON.parse(storedQuotes);
        if (quotesObject.date === moment().format("YYYY-MM-DD HH")) {
          set({ quotes: quotesObject.quotes });
          return;
        }
      }

      const response = await axios.get("https://zenquotes.io/api/quotes/");
      const quotes = response.data;
      const quotesObject = {
        date: moment().format("YYYY-MM-DD HH"),
        quotes,
      };
      storage.set("quotes", JSON.stringify(quotesObject));
      set({ quotes });
      set({ archiveQuotes: quotes });
    } catch (error) {
      console.error("Error fetching quotes:", error);
    }
  },
  loadQuotesFromArchive: () => {
    const storedArchiveQuotes = storage.getString("archiveQuotes");
    if (storedArchiveQuotes) {
      const archiveQuotes = JSON.parse(storedArchiveQuotes);
      set({ quotes: archiveQuotes });
    }
  },
}));

// Save archiveQuotes to storage whenever it changes
useQuoteStore.subscribe(
  (state) => state.archiveQuotes,
  (archiveQuotes) => {
    storage.set("archiveQuotes", JSON.stringify(archiveQuotes));
  }
);
