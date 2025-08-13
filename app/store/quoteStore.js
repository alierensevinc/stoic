import {MMKV} from "react-native-mmkv";
import {create} from "zustand";
import * as Notifications from "expo-notifications";
import localQuotes from '../../assets/quotes.json';

const storage = new MMKV();

const NOTIFICATIONS_ENABLED_KEY = "notificationsEnabled";

export const scheduleNotification = async (quotes) => {
    const notificationsEnabled = storage.getBoolean(NOTIFICATIONS_ENABLED_KEY);
    if (!notificationsEnabled) return;

    await Notifications.cancelAllScheduledNotificationsAsync();

    for (let i = 0; i < 5; i++) {
        for (let hour = 9; hour <= 21; hour += 3) {
            const quoteIndex = (i * 5 + (hour - 9) / 3) % quotes.length;
            const quote = quotes[quoteIndex];

            const triggerDate = new Date();
            triggerDate.setDate(triggerDate.getDate() + i);
            triggerDate.setHours(hour, 0, 0, 0);

            if (triggerDate.getTime() < new Date().getTime()) {
                continue;
            }

            await Notifications.scheduleNotificationAsync({
                content: {
                    title: "Günün Stoacı Sözü",
                    body: `"${quote.text}" - ${quote.author}`,
                    data: {type: "futureQuotes", quote: quote},
                },
                // DEĞİŞİKLİK: 'deprecated' uyarısını gidermek için trigger formatı güncellendi.
                trigger: {
                    type: 'date',
                    date: triggerDate,
                },
            });
        }
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
    notificationQuote: null, // Tıklanan bildirimdeki sözü tutacak yeni state
    setNotificationQuote: (quote) => set({ notificationQuote: quote }), // Bu sözü state'e yazacak fonksiyon
    clearNotificationQuote: () => set({ notificationQuote: null }), // Söz işlendikten sonra state'i temizleyecek fonksiyon
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
                    parsed = shuffle(parsed);
                    scheduleNotification(parsed);
                    set({quotes: parsed});
                } else {
                    const shuffled = localQuotes.quotes ? shuffle([...localQuotes.quotes]) : [];
                    set({quotes: shuffled});
                    storage.set(QUOTES_KEY, JSON.stringify(shuffled));
                }
            } catch (err) {
                const shuffled = localQuotes.quotes ? shuffle([...localQuotes.quotes]) : [];
                set({quotes: shuffled});
                storage.set(QUOTES_KEY, JSON.stringify(shuffled));
            }
        } else {
            const shuffled = localQuotes.quotes ? shuffle([...localQuotes.quotes]) : [];
            set({quotes: shuffled});
            storage.set(QUOTES_KEY, JSON.stringify(shuffled));
        }
    },
}));

Notifications.addNotificationResponseReceivedListener((response) => {
    const { quote } = response.notification.request.content.data;
    if (quote) {
        // Zustand store'daki state'i gelen söz ile güncelle
        useQuoteStore.getState().setNotificationQuote(quote);
    }
});

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