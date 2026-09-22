import {AppState} from "react-native";
import {MMKV} from "react-native-mmkv";
import {create} from "zustand";
import localQuotes from '../../assets/quotes.json';

const storage = new MMKV();
const QUOTES_KEY = "quotes";
const AUTHORS_FILTER_KEY = "preferredAuthors";

/**
 * All distinct authors present in the local quote pack, in a stable order.
 */
export const ALL_AUTHORS = Array.from(
    new Set((localQuotes.quotes || []).map((q) => q.author))
);

const getPreferredAuthors = () => {
    const raw = storage.getString(AUTHORS_FILTER_KEY);
    try {
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        return [];
    }
};

// An empty/absent filter means "no preference" — every author is included.
const applyAuthorFilter = (quotes, preferredAuthors) => {
    if (!preferredAuthors || preferredAuthors.length === 0) {
        return quotes;
    }
    const filtered = quotes.filter((q) => preferredAuthors.includes(q.author));
    return filtered.length > 0 ? filtered : quotes;
};

/**
 * Zustand state management store
 */
export const useQuoteStore = create((set, get) => ({
    quotes: [],
    notificationQuote: null,
    preferredAuthors: getPreferredAuthors(),
    setNotificationQuote: (quote) => set({notificationQuote: quote}),
    clearNotificationQuote: () => set({notificationQuote: null}),

    /**
     * Replaces the philosopher filter, immediately re-derives the quote
     * pool from the (unfiltered) local pack, reshuffles it, and persists
     * both the filter and the new pool so notifications pick from it too.
     */
    setAuthorFilter: (authors) => {
        storage.set(AUTHORS_FILTER_KEY, JSON.stringify(authors));
        const pool = applyAuthorFilter(
            localQuotes.quotes ? [...localQuotes.quotes] : [],
            authors
        );
        const shuffled = shuffle(pool);
        set({quotes: shuffled, preferredAuthors: authors});
        storage.set(QUOTES_KEY, JSON.stringify(shuffled));
    },

    /**
     * Updates the in-memory quote order only. Persistence to MMKV is
     * deferred to `persistQuotes` (flushed when the app backgrounds) so
     * swiping through quotes doesn't serialize the whole ~1800-item array
     * on every single gesture.
     */
    setQuotes: (quotes) => set({quotes}),

    persistQuotes: () => {
        storage.set(QUOTES_KEY, JSON.stringify(get().quotes));
    },

    /**
     * Loads quotes from storage or local JSON and shuffles them.
     * Notification scheduling lives in utils/notificationScheduler.js.
     */
    loadQuotes: () => {
        const storedQuotes = storage.getString(QUOTES_KEY);
        let loadedQuotes = [];

        try {
            if (storedQuotes) {
                const parsed = JSON.parse(storedQuotes);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    loadedQuotes = parsed;
                }
            }
        } catch (err) {
            console.error("Failed to parse stored quotes, falling back to local.");
            loadedQuotes = [];
        }

        if (loadedQuotes.length === 0) {
            loadedQuotes = localQuotes.quotes ? [...localQuotes.quotes] : [];
        }

        const shuffled = shuffle(loadedQuotes);
        set({quotes: shuffled});
        storage.set(QUOTES_KEY, JSON.stringify(shuffled));
    },
}));

/**
 * Flush the current quote order to MMKV whenever the app is about to leave
 * the foreground, so the reading position survives a relaunch without
 * paying the serialization cost on every swipe.
 */
AppState.addEventListener("change", (nextAppState) => {
    if (nextAppState === "background" || nextAppState === "inactive") {
        useQuoteStore.getState().persistQuotes();
    }
});

/**
 * Fisher-Yates (aka Knuth) Shuffle algorithm.
 */
function shuffle(array) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
    return array;
}