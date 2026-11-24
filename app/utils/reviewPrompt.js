import * as StoreReview from "expo-store-review";
import {storage} from "utils/storage";
import {logger} from "utils/logger";

const LAST_REVIEW_PROMPT_KEY = "lastReviewPromptAt";
const REVIEW_COOLDOWN_MS = 120 * 24 * 60 * 60 * 1000; // ~120 days

export const maybeRequestStoreReview = async ({
    streakCount = 0,
    bookmarkCount = 0,
} = {}) => {
    const milestoneReached =
        streakCount === 7 ||
        streakCount === 30 ||
        bookmarkCount === 5 ||
        bookmarkCount === 15;
    if (!milestoneReached) {
        return;
    }

    const lastPrompt = storage.getNumber(LAST_REVIEW_PROMPT_KEY) || 0;
    if (Date.now() - lastPrompt < REVIEW_COOLDOWN_MS) {
        return;
    }

    try {
        const isAvailable = await StoreReview.isAvailableAsync();
        if (isAvailable) {
            storage.set(LAST_REVIEW_PROMPT_KEY, Date.now());
            await StoreReview.requestReview();
        }
    } catch (e) {
        logger.warn("StoreReview request failed:", e);
    }
};
