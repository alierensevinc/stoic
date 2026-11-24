import {AppState} from "react-native";
import {create} from "zustand";
import {getJSON, setJSON} from "utils/storage";

const STREAK_KEY = "streakData";

const toDateKey = (date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
        date.getDate()
    ).padStart(2, "0")}`;

const loadStreak = () => {
    const parsed = getJSON(STREAK_KEY, null);
    if (parsed && typeof parsed.currentStreak === "number") {
        return parsed;
    }
    return {currentStreak: 0, longestStreak: 0, lastOpenDate: null};
};

export const useStreakStore = create((set, get) => ({
    ...loadStreak(),

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
        setJSON(STREAK_KEY, next);
    },
}));

useStreakStore.getState().recordAppOpen();
AppState.addEventListener("change", (nextAppState) => {
    if (nextAppState === "active") {
        useStreakStore.getState().recordAppOpen();
    }
});
