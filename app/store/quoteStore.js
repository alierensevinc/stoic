import {AppState} from "react-native";
import {create} from "zustand";
import localQuotes from "../../assets/quotes.json";
import {getJSON, setJSON, storage} from "utils/storage";

const QUOTE_ORDER_KEY = "quoteOrderIds";
const QUOTE_INDEX_KEY = "quoteCurrentIndex";
const LEGACY_QUOTES_KEY = "quotes";
const AUTHORS_FILTER_KEY = "preferredAuthors";
const STORAGE_VERSION_KEY = "storageVersion";
const CURRENT_STORAGE_VERSION = 2;

export const ALL_QUOTES = localQuotes.quotes || [];

export const QUOTES_BY_ID = ALL_QUOTES.reduce((acc, q) => {
    acc[q.id] = q;
    return acc;
}, {});

export const QUOTES_BY_TEXT = ALL_QUOTES.reduce((acc, q) => {
    acc[q.text] = q;
    return acc;
}, {});

export const ALL_AUTHORS = Array.from(new Set(ALL_QUOTES.map((q) => q.author)));

/**
 * Deterministic Quote of the Day based on calendar date (YYYY-MM-DD) and optional
 * preferred author pool. Used by the Home screen, rolling notifications, and widget sync.
 */
export const getQuoteOfTheDay = (date = new Date(), preferredAuthors = []) => {
    const pool = applyAuthorFilter(ALL_QUOTES, preferredAuthors);
    if (pool.length === 0) {
        return ALL_QUOTES[0] || null;
    }
    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;
    let hash = 2166136261;
    for (let i = 0; i < dateKey.length; i++) {
        hash ^= dateKey.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }
    const index = Math.abs(hash) % pool.length;
    return pool[index];
};

const getPreferredAuthors = () => {
    const parsed = getJSON(AUTHORS_FILTER_KEY, []);
    return Array.isArray(parsed) ? parsed : [];
};

export const applyAuthorFilter = (quotes, preferredAuthors) => {
    if (!preferredAuthors || preferredAuthors.length === 0) {
        return quotes;
    }
    const filtered = quotes.filter((q) => preferredAuthors.includes(q.author));
    return filtered.length > 0 ? filtered : quotes;
};

function shuffle(array) {
    const copy = [...array];
    let currentIndex = copy.length;
    while (currentIndex !== 0) {
        const randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [copy[currentIndex], copy[randomIndex]] = [
            copy[randomIndex],
            copy[currentIndex],
        ];
    }
    return copy;
}

/**
 * One-time storage migration from v1 (full quote objects serialized on every session,
 * text-keyed bookmarks/notes) to v2 (ID-based order + numeric index).
 */
export const runStorageMigrationIfNeeded = () => {
    const version = storage.getNumber(STORAGE_VERSION_KEY) || 1;
    if (version >= CURRENT_STORAGE_VERSION) {
        return;
    }

    // 1. Migrate legacy "quotes" full array -> quoteOrderIds
    const legacyQuotes = getJSON(LEGACY_QUOTES_KEY, null);
    if (Array.isArray(legacyQuotes) && legacyQuotes.length > 0) {
        const migratedOrder = [];
        const seen = new Set();
        for (const item of legacyQuotes) {
            const match =
                (item?.id && QUOTES_BY_ID[item.id]) ||
                (item?.text && QUOTES_BY_TEXT[item.text]);
            if (match && !seen.has(match.id)) {
                seen.add(match.id);
                migratedOrder.push(match.id);
            }
        }
        if (migratedOrder.length > 0) {
            setJSON(QUOTE_ORDER_KEY, migratedOrder);
            storage.set(QUOTE_INDEX_KEY, 0);
        }
        storage.delete(LEGACY_QUOTES_KEY);
    }

    // 2. Migrate bookmarks to ensure each bookmark has a stable `id`
    const legacyBookmarks = getJSON("bookmarks", []);
    if (Array.isArray(legacyBookmarks) && legacyBookmarks.length > 0) {
        const migratedBookmarks = [];
        const seenIds = new Set();
        for (const bm of legacyBookmarks) {
            if (!bm || !bm.text) continue;
            const match = (bm.id && QUOTES_BY_ID[bm.id]) || QUOTES_BY_TEXT[bm.text];
            const normalized = match
                ? {id: match.id, text: match.text, author: match.author}
                : {
                      id: bm.id || `legacy_${migratedBookmarks.length}`,
                      text: bm.text,
                      author: bm.author || "Unknown",
                  };
            if (!seenIds.has(normalized.id)) {
                seenIds.add(normalized.id);
                migratedBookmarks.push(normalized);
            }
        }
        setJSON("bookmarks", migratedBookmarks);
    }

    // 3. Migrate quoteNotes to include quoteId alongside text/author
    const legacyNotes = getJSON("quoteNotes", {});
    if (legacyNotes && typeof legacyNotes === "object") {
        const migratedNotes = {};
        for (const [key, entry] of Object.entries(legacyNotes)) {
            if (!entry || typeof entry.note !== "string") continue;
            const match = QUOTES_BY_ID[key] || QUOTES_BY_TEXT[key];
            if (match) {
                migratedNotes[match.id] = {
                    quoteId: match.id,
                    quoteText: match.text,
                    quoteAuthor: match.author,
                    note: entry.note,
                    updatedAt: entry.updatedAt || Date.now(),
                };
            } else {
                migratedNotes[key] = {
                    quoteId: key,
                    quoteText: entry.quoteText || key,
                    quoteAuthor: entry.quoteAuthor || "Stoic",
                    note: entry.note,
                    updatedAt: entry.updatedAt || Date.now(),
                };
            }
        }
        setJSON("quoteNotes", migratedNotes);
    }

    storage.set(STORAGE_VERSION_KEY, CURRENT_STORAGE_VERSION);
};

runStorageMigrationIfNeeded();

export const useQuoteStore = create((set, get) => ({
    order: [],
    currentIndex: 0,
    currentQuote: null,
    notificationQuote: null,
    preferredAuthors: getPreferredAuthors(),

    setNotificationQuote: (quote) => set({notificationQuote: quote}),
    clearNotificationQuote: () => set({notificationQuote: null}),

    setAuthorFilter: (authors) => {
        setJSON(AUTHORS_FILTER_KEY, authors);
        const pool = applyAuthorFilter(ALL_QUOTES, authors);
        const newOrder = shuffle(pool.map((q) => q.id));
        const firstQuote = QUOTES_BY_ID[newOrder[0]] || ALL_QUOTES[0] || null;
        setJSON(QUOTE_ORDER_KEY, newOrder);
        storage.set(QUOTE_INDEX_KEY, 0);
        set({
            order: newOrder,
            currentIndex: 0,
            currentQuote: firstQuote,
            preferredAuthors: authors,
        });
    },

    /**
     * Loads the persisted reading order and index without reshuffling on launch.
     * Any newly added quotes in `quotes.json` not yet in `order` are appended.
     */
    loadQuotes: () => {
        const preferredAuthors = get().preferredAuthors;
        const allowedPool = applyAuthorFilter(ALL_QUOTES, preferredAuthors);
        const allowedSet = new Set(allowedPool.map((q) => q.id));

        const storedOrder = getJSON(QUOTE_ORDER_KEY, []);
        let validOrder = Array.isArray(storedOrder)
            ? storedOrder.filter((id) => allowedSet.has(id))
            : [];

        if (validOrder.length === 0) {
            validOrder = shuffle(allowedPool.map((q) => q.id));
            // Put today's Quote of the Day at index 0 on fresh install
            const qotd = getQuoteOfTheDay(new Date(), preferredAuthors);
            if (qotd) {
                validOrder = [
                    qotd.id,
                    ...validOrder.filter((id) => id !== qotd.id),
                ];
            }
            setJSON(QUOTE_ORDER_KEY, validOrder);
            storage.set(QUOTE_INDEX_KEY, 0);
        } else if (validOrder.length < allowedPool.length) {
            const existingSet = new Set(validOrder);
            const missingIds = shuffle(
                allowedPool
                    .map((q) => q.id)
                    .filter((id) => !existingSet.has(id))
            );
            validOrder = [...validOrder, ...missingIds];
            setJSON(QUOTE_ORDER_KEY, validOrder);
        }

        const storedIndex = storage.getNumber(QUOTE_INDEX_KEY) || 0;
        const safeIndex =
            validOrder.length > 0 ? storedIndex % validOrder.length : 0;
        const currentQuote =
            QUOTES_BY_ID[validOrder[safeIndex]] || allowedPool[0] || null;

        set({
            order: validOrder,
            currentIndex: safeIndex,
            currentQuote,
        });
    },

    /**
     * O(1) index step forward or backward — only persists a single integer.
     */
    stepQuote: (direction = "next") => {
        const {order, currentIndex} = get();
        if (order.length <= 1) {
            return;
        }
        const delta = direction === "previous" ? -1 : 1;
        const nextIndex = (currentIndex + delta + order.length) % order.length;
        const nextQuote = QUOTES_BY_ID[order[nextIndex]] || null;
        storage.set(QUOTE_INDEX_KEY, nextIndex);
        set({
            currentIndex: nextIndex,
            currentQuote: nextQuote,
        });
    },

    /**
     * Jumps directly to a quote by ID or quote object (e.g., from a notification,
     * widget deep link, or Notes screen).
     */
    focusQuote: (quoteOrId) => {
        if (!quoteOrId) return;
        const target =
            typeof quoteOrId === "string"
                ? QUOTES_BY_ID[quoteOrId] || QUOTES_BY_TEXT[quoteOrId]
                : (quoteOrId.id && QUOTES_BY_ID[quoteOrId.id]) ||
                  (quoteOrId.text && QUOTES_BY_TEXT[quoteOrId.text]) ||
                  quoteOrId;
        if (!target) return;

        const {order} = get();
        const existingIdx = target.id ? order.indexOf(target.id) : -1;
        if (existingIdx >= 0) {
            storage.set(QUOTE_INDEX_KEY, existingIdx);
            set({
                currentIndex: existingIdx,
                currentQuote: QUOTES_BY_ID[order[existingIdx]] || target,
            });
        } else {
            set({currentQuote: target});
        }
    },

    persistQuotes: () => {
        storage.set(QUOTE_INDEX_KEY, get().currentIndex);
    },
}));

AppState.addEventListener("change", (nextAppState) => {
    if (nextAppState === "background" || nextAppState === "inactive") {
        useQuoteStore.getState().persistQuotes();
    }
});
