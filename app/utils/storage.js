import {MMKV} from "react-native-mmkv";

export const storage = new MMKV();

export const getJSON = (key, fallback = null) => {
    const raw = storage.getString(key);
    if (!raw) {
        return fallback;
    }
    try {
        const parsed = JSON.parse(raw);
        return parsed ?? fallback;
    } catch {
        return fallback;
    }
};

export const setJSON = (key, value) => {
    storage.set(key, JSON.stringify(value));
};
