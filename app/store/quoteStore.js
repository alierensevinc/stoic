import {MMKV} from "react-native-mmkv";
import {create} from "zustand";
import * as Notifications from "expo-notifications";
import localQuotes from '../../assets/quotes.json';

// (Diğer importlar ve MMKV kurulumu aynı)
const storage = new MMKV();
const NOTIFICATIONS_ENABLED_KEY = "notificationsEnabled";
const QUOTES_KEY = "quotes";

/**
 * Bir sonraki 15:00 için TEK SEFERLİK bir bildirim kurar.
 * Bu fonksiyon, her zaman önce mevcut tüm bildirimleri iptal eder.
 */
export const scheduleNextDailyNotification = async () => {
    const notificationsEnabled = storage.getBoolean(NOTIFICATIONS_ENABLED_KEY);
    if (!notificationsEnabled) {
        console.log("Notifications are disabled. Skipping schedule.");
        return;
    }

    // 1. Depolamadan bir söz al (Mantık aynı)
    const storedQuotes = storage.getString(QUOTES_KEY);
    let quote;
    try {
        if (storedQuotes) {
            const parsed = JSON.parse(storedQuotes);
            if (Array.isArray(parsed) && parsed.length > 0) {
                quote = parsed[0];
            }
        }
    } catch (e) {
        console.error("Failed to parse quotes for notification scheduling", e);
    }

    if (!quote) {
        quote = localQuotes.quotes ? localQuotes.quotes[0] : {text: "Look within.", author: "Marcus Aurelius"};
    }

    // 2. "Hemen Düşme" Hatası Düzeltmesi (Mantık aynı)
    const now = new Date();
    const triggerDate = new Date();
    triggerDate.setHours(15, 0, 0, 0);

    if (now.getTime() > triggerDate.getTime()) {
        triggerDate.setDate(triggerDate.getDate() + 1);
    }

    // 3. (GÜNCELLENDİ) Planlamadan önce HER ZAMAN mevcut tüm bildirimleri iptal et.
    // Bu, "Invalid Date" hatasına neden olan eski kaydı temizler.
    await Notifications.cancelAllScheduledNotificationsAsync();

    // 4. TEK SEFERLİK bildirimi, hesaplanan 'triggerDate' ile kur (Mantık aynı)
    await Notifications.scheduleNotificationAsync({
        content: {
            title: "Quote of the Day",
            body: `"${quote.text}" - ${quote.author}`,
            data: {type: "dailyQuote", quote: quote},
        },
        trigger: triggerDate, // 'repeats: true' YOK.
    });

    console.log(`Notification (re)scheduled successfully for: ${triggerDate.toLocaleString()}`);
};

/**
 * Bildirimler için gerekli izinleri ister ve ayarları yapar.
 */
export const initializeNotifications = async () => {
    const {status} = await Notifications.requestPermissionsAsync();
    if (status !== "granted") {
        console.error("Notification permissions not granted");
        storage.set(NOTIFICATIONS_ENABLED_KEY, false);
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

        // GÜNCELLENDİ: "Invalid Date" hatasını ve "hemen düşme" sorununu çözmek için,
        // uygulama her açıldığında (ve izin varsa) bildirimleri temizle ve yeniden kur.
        console.log("Permissions granted. Ensuring notification is scheduled correctly.");
        await scheduleNextDailyNotification();
    }
};

/**
 * Zustand state management store
 */
export const useQuoteStore = create((set) => ({
    // ... (quotes, notificationQuote, setNotificationQuote, clearNotificationQuote, setQuotes aynı)
    quotes: [],
    notificationQuote: null,
    setNotificationQuote: (quote) => set({notificationQuote: quote}),
    clearNotificationQuote: () => set({notificationQuote: null}),
    setQuotes: (quotes) => {
        set({quotes});
        storage.set(QUOTES_KEY, JSON.stringify(quotes));
    },

    /**
     * Alıntıları yükler. (Mantık aynı, bildirim çağrısı yok)
     */
    loadQuotes: () => {
        // ... (Bu fonksiyonun içi önceki cevapta olduğu gibi aynı kalıyor)
        const storedQuotes = storage.getString(QUOTES_KEY);
        let loadedQuotes = [];

        try {
            if (storedQuotes) {
                const parsed = JSON.parse(storedQuotes);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    loadedQuotes = parsed;
                }
            }
        } catch (err) {
            console.error("Failed to parse stored quotes, falling back to local.");
            loadedQuotes = [];
        }

        if (loadedQuotes.length === 0) {
            loadedQuotes = localQuotes.quotes ? [...localQuotes.quotes] : [];
        }

        const shuffled = shuffle(loadedQuotes);
        set({quotes: shuffled});
        storage.set(QUOTES_KEY, JSON.stringify(shuffled));
    },
}));

/**
 * Bildirim dinleyicisi. (Değişiklik yok)
 */
Notifications.addNotificationResponseReceivedListener((response) => {
    // ... (Mantık aynı)
    const {quote} = response.notification.request.content.data;
    if (quote) {
        useQuoteStore.getState().setNotificationQuote(quote);
    }
});

/**
 * Fisher-Yates (aka Knuth) Shuffle algoritması. (Değişiklik yok)
 */
function shuffle(array) {
    // ... (Mantık aynı)
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
    return array;
}