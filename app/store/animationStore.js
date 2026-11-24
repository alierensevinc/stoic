import {create} from "zustand";
import {getJSON, setJSON} from "utils/storage";

const ANIMATION_SHOWN_KEY = "hasShownAnimation";

export const useAnimationStore = create((set) => ({
    hasShownAnimation: Boolean(getJSON(ANIMATION_SHOWN_KEY, false)),

    setHasShownAnimation: (value) => {
        setJSON(ANIMATION_SHOWN_KEY, Boolean(value));
        set({hasShownAnimation: Boolean(value)});
    },
}));
