import {create} from "zustand";
import {getJSON, setJSON} from "utils/storage";
import {QUOTES_BY_ID, QUOTES_BY_TEXT} from "store/quoteStore";

const NOTES_KEY = "quoteNotes";

const resolveKeyAndQuote = (quoteOrKey) => {
    if (!quoteOrKey) return {key: null, quote: null};
    if (typeof quoteOrKey === "object") {
        const match =
            (quoteOrKey.id && QUOTES_BY_ID[quoteOrKey.id]) ||
            (quoteOrKey.text && QUOTES_BY_TEXT[quoteOrKey.text]) ||
            quoteOrKey;
        const key = match.id || match.text;
        return {key, quote: match};
    }
    const match = QUOTES_BY_ID[quoteOrKey] || QUOTES_BY_TEXT[quoteOrKey];
    if (match) {
        return {key: match.id, quote: match};
    }
    return {key: quoteOrKey, quote: {id: quoteOrKey, text: quoteOrKey, author: "Stoic"}};
};

/**
 * Keeps personal reflections per quote, keyed by stable quote ID (with transparent
 * fallback for legacy text keys).
 */
export const useNotesStore = create((set, get) => ({
    notes: getJSON(NOTES_KEY, {}),

    getNote: (quoteOrKey) => {
        if (!quoteOrKey) return "";
        const {key, quote} = resolveKeyAndQuote(quoteOrKey);
        const notes = get().notes;
        return (
            notes[key]?.note ??
            (quote?.text ? notes[quote.text]?.note : "") ??
            ""
        );
    },

    saveNote: (quoteOrKey, noteText) => {
        const {key, quote} = resolveKeyAndQuote(quoteOrKey);
        if (!key) return;
        const notes = {...get().notes};
        const trimmed = (noteText || "").trim();

        // Clean up any legacy text-keyed duplicate
        if (quote?.text && quote.text !== key && notes[quote.text]) {
            delete notes[quote.text];
        }

        if (trimmed.length > 0) {
            notes[key] = {
                quoteId: key,
                quoteText: quote?.text || key,
                quoteAuthor: quote?.author || "Stoic",
                note: trimmed,
                updatedAt: Date.now(),
            };
        } else {
            delete notes[key];
        }
        set({notes});
        setJSON(NOTES_KEY, notes);
    },

    deleteNote: (quoteOrKey) => {
        get().saveNote(quoteOrKey, "");
    },
}));
