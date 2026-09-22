import {create} from "zustand";
import {MMKV} from "react-native-mmkv";

const storage = new MMKV();
const NOTES_KEY = "quoteNotes";

const loadNotes = () => {
    const raw = storage.getString(NOTES_KEY);
    try {
        const parsed = raw ? JSON.parse(raw) : {};
        return parsed && typeof parsed === "object" ? parsed : {};
    } catch (e) {
        console.error("Failed to parse quote notes", e);
        return {};
    }
};

/**
 * Keeps a short personal reflection per quote, keyed by the quote text.
 * Stored as a flat { [quoteText]: { note, updatedAt } } map in MMKV.
 */
export const useNotesStore = create((set, get) => ({
    notes: loadNotes(),

    getNote: (quoteText) => get().notes[quoteText]?.note ?? "",

    saveNote: (quoteText, note) => {
        const notes = {...get().notes};
        const trimmed = (note || "").trim();
        if (trimmed.length > 0) {
            notes[quoteText] = {note: trimmed, updatedAt: Date.now()};
        } else {
            delete notes[quoteText];
        }
        set({notes});
        storage.set(NOTES_KEY, JSON.stringify(notes));
    },
}));
