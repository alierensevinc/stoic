import { create } from "zustand";
import { MMKV } from "react-native-mmkv";
import axios from "axios";
import moment from "moment";

const storage = new MMKV();

export const useQuoteStore = create((set) => ({
  quotes: [],
  setQuotes: (quotes) => set({ quotes }),
  getQuotes: async () => {
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
    } catch (error) {
      console.error("Error fetching quotes:", error);
    }
  },
}));
