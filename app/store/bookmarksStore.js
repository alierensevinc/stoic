import { create } from "zustand";
import { MMKV } from "react-native-mmkv";

const storage = new MMKV();

export const useBookmarksStore = create((set) => ({
  bookmarks: JSON.parse(storage.getString("bookmarks") || "[]"),

  addToBookmarks: (quote) =>
    set((state) => {
      const newBookmarks = [...state.bookmarks, quote];
      storage.set("bookmarks", JSON.stringify(newBookmarks));
      return { bookmarks: newBookmarks };
    }),

  removeFromBookmarks: (quote) =>
    set((state) => {
      const newBookmarks = state.bookmarks.filter(
        (bookmark) => bookmark.text !== quote.text
      );
      storage.set("bookmarks", JSON.stringify(newBookmarks));
      return { bookmarks: newBookmarks };
    }),

  removeAllBookmarks: () =>
    set(() => {
      storage.set("bookmarks", JSON.stringify([]));
      return { bookmarks: [] };
    }),
}));
