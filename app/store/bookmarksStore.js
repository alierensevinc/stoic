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
        (bookmark) => bookmark.q !== bookmark.q
      );
      storage.set("bookmarks", JSON.stringify(newBookmarks));
      return { bookmarks: newBookmarks };
    }),
}));
