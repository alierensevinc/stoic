import { create } from "zustand";
import { MMKV } from "react-native-mmkv";

const storage = new MMKV();

export const useFavoriteStore = create((set) => ({
  favorites: JSON.parse(storage.getString("favorites") || "[]"),

  addFavorite: (quote) =>
    set((state) => {
      const newFavorites = [...state.favorites, quote];
      storage.set("favorites", JSON.stringify(newFavorites));
      return { favorites: newFavorites };
    }),

  removeFavorite: (quote) =>
    set((state) => {
      const newFavorites = state.favorites.filter((fav) => fav.q !== quote.q);
      storage.set("favorites", JSON.stringify(newFavorites));
      return { favorites: newFavorites };
    }),
}));
