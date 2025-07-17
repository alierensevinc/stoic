import {MMKV} from "react-native-mmkv";
import {create} from "zustand";
import * as Notifications from "expo-notifications";
import localQuotes from '../../assets/quotes.json';

const storage = new MMKV();

const NOTIFICATIONS_ENABLED_KEY = "notificationsEnabled";

Notifications.addNotificationResponseReceivedListener((response) => {
    const {type, quote} = response.notification.request.content.data;
});

const scheduleNotification = async (quotes) => {
    const notificationsEnabled = storage.getBoolean(NOTIFICATIONS_ENABLED_KEY);
    if (!notificationsEnabled) return;

    await Notifications.cancelAllScheduledNotificationsAsync();

    const triggerTimes = [];
    for (let i = 0; i < 7; i++) {
        for (let hour = 9; hour <= 21; hour += 3) {
            let triggerTime = new Date();
            triggerTime.setHours(hour, 0, 0, 0);
            triggerTime.setDate(triggerTime.getDate() + i);
            triggerTimes.push({time: triggerTime, quote: quotes[(i * 5 + (hour - 9) / 3) % quotes.length]});
        }
    }

    for (const {time, quote} of triggerTimes) {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: quote.text,
                body: quote.author,
                data: {type: "futureQuotes", quote: quote},
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
                hour: time.getHours(),
                minute: time.getMinutes(),
                weekday: ((time.getDay() + 1) % 7) + 1,
                repeats: true
            },
        });
    }
};

export const initializeNotifications = async () => {
    const {status} = await Notifications.requestPermissionsAsync();
    if (status !== "granted") {
        console.error("Notification permissions not granted");
        return;
    }

    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowBanner: true,
            shouldShowList: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
        }),
    });

    if (status === 'granted') {
        storage.set(NOTIFICATIONS_ENABLED_KEY, true);
    }
};

const QUOTES_KEY = "quotes";

export const useQuoteStore = create((set) => ({
    quotes: [],
    setQuotes: (quotes) => {
        set({quotes});
        storage.set(QUOTES_KEY, JSON.stringify(quotes));
    },
    loadQuotes: () => {
        const storedQuotes = storage.getString(QUOTES_KEY);
        if (storedQuotes) {
            try {
                let parsed = JSON.parse(storedQuotes);
                if (Array.isArray(parsed)) {
                    // Her açılışta karıştır
                    parsed = shuffle(parsed);
                    set({quotes: parsed});
                } else {
                    set({quotes: localQuotes.quotes ? shuffle([...localQuotes.quotes]) : []});
                    storage.set(QUOTES_KEY, JSON.stringify(localQuotes.quotes || []));
                }
            } catch (err) {
                set({quotes: localQuotes.quotes ? shuffle([...localQuotes.quotes]) : []});
                storage.set(QUOTES_KEY, JSON.stringify(localQuotes.quotes || []));
            }
        } else {
            const shuffled = localQuotes.quotes ? shuffle([...localQuotes.quotes]) : [];
            set({quotes: shuffled});
            storage.set(QUOTES_KEY, JSON.stringify(shuffled));
        }
    },
}));

function shuffle(array) {
    let currentIndex = array.length, randomIndex;

    // Kalan eleman kalmayana kadar karıştır
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // Swap
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
    return array;
}