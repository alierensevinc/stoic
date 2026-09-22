import {AppState} from "react-native";
import {MMKV} from "react-native-mmkv";
import {create} from "zustand";

const storage = new MMKV();
const STREAK_KEY = "streakData";

const toDateKey = (date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
        date.getDate()
    ).padStart(2, "0")}`;

const loadStreak = () => {
    const raw = storage.getString(STREAK_KEY);
    try {
        const parsed = raw ? JSON.parse(raw) : null;
        if (parsed && typeof parsed.currentStreak === "number") {
            return parsed;
        }
    } catch (e) {
        console.error("Failed to parse streak data", e);
    }
    return {currentStreak: 0, longestStreak: 0, lastOpenDate: null};
};

export const useStreakStore = create((set, get) => ({
    ...loadStreak(),

    /**
     * Call whenever the app is opened/resumed. Increments the streak once
     * per calendar day: +1 if the last open was yesterday, reset to 1 if a
     * day was missed, no-op if already counted today.
     */
    recordAppOpen: () => {
        const today = new Date();
        const todayKey = toDateKey(today);
        const {currentStreak, longestStreak, lastOpenDate} = get();

        if (lastOpenDate === todayKey) {
            return;
        }

        let nextStreak = 1;
        if (lastOpenDate) {
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            if (lastOpenDate === toDateKey(yesterday)) {
                nextStreak = currentStreak + 1;
            }
        }

        const next = {
            currentStreak: nextStreak,
            longestStreak: Math.max(longestStreak, nextStreak),
            lastOpenDate: todayKey,
        };
        set(next);
        storage.set(STREAK_KEY, JSON.stringify(next));
    },
}));

// Count the cold-start launch immediately, then any later resume from background.
useStreakStore.getState().recordAppOpen();
AppState.addEventListener("change", (nextAppState) => {
    if (nextAppState === "active") {
        useStreakStore.getState().recordAppOpen();
    }
});
