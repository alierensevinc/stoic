import {create} from "zustand";
import {getJSON, setJSON} from "utils/storage";
import {QUOTES_BY_ID, QUOTES_BY_TEXT} from "store/quoteStore";

const BOOKMARKS_KEY = "bookmarks";

const isSameQuote = (a, b) => {
    if (!a || !b) return false;
    if (a.id && b.id) return a.id === b.id;
    return a.text === b.text;
};

const normalizeQuote = (quote) => {
    if (!quote) return null;
    const match =
        (quote.id && QUOTES_BY_ID[quote.id]) ||
        (quote.text && QUOTES_BY_TEXT[quote.text]);
    if (match) {
        return {id: match.id, text: match.text, author: match.author};
    }
    return {
        id: quote.id || quote.text,
        text: quote.text,
        author: quote.author || "Unknown",
    };
};

export const useBookmarksStore = create((set, get) => ({
    bookmarks: getJSON(BOOKMARKS_KEY, []),

    isQuoteBookmarked: (quote) => {
        if (!quote) return false;
        return get().bookmarks.some((bm) => isSameQuote(bm, quote));
    },

    addToBookmarks: (quote) =>
        set((state) => {
            const normalized = normalizeQuote(quote);
            if (
                !normalized ||
                state.bookmarks.some((bm) => isSameQuote(bm, normalized))
            ) {
                return state;
            }
            const newBookmarks = [...state.bookmarks, normalized];
            setJSON(BOOKMARKS_KEY, newBookmarks);
            return {bookmarks: newBookmarks};
        }),

    removeFromBookmarks: (quote) =>
        set((state) => {
            const newBookmarks = state.bookmarks.filter(
                (bookmark) => !isSameQuote(bookmark, quote)
            );
            setJSON(BOOKMARKS_KEY, newBookmarks);
            return {bookmarks: newBookmarks};
        }),

    removeAllBookmarks: () =>
        set(() => {
            setJSON(BOOKMARKS_KEY, []);
            return {bookmarks: []};
        }),
}));
