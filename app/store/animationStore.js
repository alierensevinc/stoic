import {MMKV} from "react-native-mmkv";
import {create} from "zustand";

const storage = new MMKV();

const ANIMATION_SHOWN_KEY = "hasShownAnimation";

const saveToStorage = (key, data) => {
    storage.set(key, JSON.stringify(data));
};

const loadFromStorage = (key) => {
    const storedData = storage.getString(key);
    return storedData ? JSON.parse(storedData) : null;
};

export const useAnimationStore = create((set) => ({
    hasShownAnimation: loadFromStorage(ANIMATION_SHOWN_KEY) || false,

    setHasShownAnimation: (value) => {
        saveToStorage(ANIMATION_SHOWN_KEY, value);
        set({hasShownAnimation: value});
    },
}));