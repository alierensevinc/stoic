# Stoic — İyileştirme Planı ve Tamamlananlar Özeti

> Son Güncelleme: 2026-11-24 · Durum: Tüm Fazlar (Faz 1 – Faz 4) tamamlandı.

## 1. Build Altyapısı: CNG + EAS Temizliği + Metro'suz Xcode (Tamamlandı)
- [x] **Tek kaynak `app.json`**: Versiyon `3.0.0`, `ios.buildNumber: "33"`, `ios.appleTeamId: "EF8VE8N587"` ve `QuoteWidget` `DEVELOPMENT_TEAM` tanımlandı.
- [x] **Tam CNG**: `ios/` klasörü git takibinden çıkarıldı ve `.gitignore`'a eklendi (`npm run ios:prebuild` ile her seferinde `app.json` + `plugins/` üzerinden temiz üretiliyor).
- [x] **EAS kalıntıları kaldırıldı**: `expo-insights`, `expo-dev-client` ve kullanılmayan paketler (`react-native-share`, `prop-types`, `@react-native-community/netinfo`, `expo-device`, `@react-navigation/native-stack`, `@react-native-firebase/perf`) kaldırıldı.
- [x] **Metro'suz Xcode çalıştırma (`plugins/withEmbeddedJsBundle.js`)**:
  - `ios/.xcode.env.updates` içine `unset SKIP_BUNDLING` + `export FORCE_BUNDLING=1` yazılarak Debug konfigürasyonunda da `main.jsbundle` `.app` içine gömülüyor.
  - `AppDelegate.swift` içinde `#if DEBUG` dalı önce gömülü `main.jsbundle`'ı yüklüyor; Metro sunucusuna ihtiyaç duymadan Xcode'dan ⌘R ile doğrudan çalışıyor.
  - Paylaşımlı `stoic-Release.xcscheme` otomatik üretiliyor.

## 2. Expo SDK 58 ve Major Kütüphane Yükseltmeleri (Tamamlandı)
- [x] **Expo SDK 58** (`expo@^58.0.0`, React `19.3.0`, React Native `0.88.1`, Reanimated `4.7.1`, Gesture Handler `3.3.0`).
- [x] **`@react-native-firebase/app`, `analytics`, `crashlytics` v27**: Modular API (`getAnalytics`, `getCrashlytics`, `logEvent`, `logScreenView`, `recordError`) entegre edildi.
- [x] **`@react-navigation/native` & `stack` v7** yükseltmesi tamamlandı.
- [x] **`react-native-google-mobile-ads` v17** + Google UMP (`AdsConsent`) entegrasyonu yapıldı.
- [x] **`zustand` v5** yükseltmesi ve selector bazlı store tüketimi yapıldı.
- [x] **`expo-dynamic-app-icon` → `expo-alternate-app-icons` v11**: Yeni Mimari uyumlu paketle değiştirildi; `npx expo-doctor` **20/20 passed**.
- [x] **`react-native-dotenv` kaldırıldı**: Expo'nun yerleşik `EXPO_PUBLIC_*` sistemine geçildi.
- [x] **`react-native-swipe-list-view` kaldırıldı**: `react-native-gesture-handler/ReanimatedSwipeable` ile değiştirildi.

## 3. Kod Kalitesi, Bütünlük ve Performans (Tamamlandı)
- [x] **ESLint + Prettier**: `eslint.config.js` (`eslint-config-expo/flat`) ve `.prettierrc` eklendi; `npm run lint` 0 hata / 0 uyarı.
- [x] **Ortak modüller**: `app/utils/storage.js` (tek MMKV instance), `app/utils/constants.js`, `app/utils/logger.js`, `app/utils/telemetry.js`.
- [x] **UI bloklamayan başlatma (`useAppInitialization.js`)**: Fontlar yüklendiğinde (veya hata durumunda sistem fontuna düşerek) UI anında açılır; UMP consent → ATT izni → `mobileAds().initialize()` arka planda sırayla çalışır.
- [x] **Paylaşımlı Reklam Yöneticisi**: Tekil Interstitial instance + aksiyon ve 60 sn cooldown sınırı; AppOpen reklamlarında 4 saatlik expiry, minimum 30 sn arka plan süresi ve oturum başına 1 gösterim sınırı.
- [x] **Tekilleştirilmiş & ID Bazlı Söz Modeli (`quotes.json` + `quoteStore.js`)**:
  - 1774 söz içindeki 48 kopya temizlendi → **1726 benzersiz söz**, her birine deterministik `id` (`q_<sha1>`) eklendi.
  - Her açılışta yeniden karıştırma hatası giderildi; sadece `currentIndex` (tek bir sayı) güncelleniyor.
  - Eski MMKV `quotes`, `bookmarks` ve `quoteNotes` verileri için otomatik v1→v2 migration eklendi.
- [x] **14 Günlük Kayan Bildirim Motoru (`notificationScheduler.js`)**: Her gün için farklı Günün Sözü ve akşam refleksiyon sözü içeren 28 adet `DATE` trigger + 1 haftalık fallback bildirimi ve cold-start bildirim tıklama yakalayıcısı eklendi.
- [x] **Tema & Status Bar**: `expo-status-bar` ile karanlık/aydınlık mod kontrast hatası düzeltildi; `Appearance.setColorScheme` senkronu ve Settings'e opt-in *"Match app icon to theme"* ayarı eklendi.

## 4. Yeni Özellikler (Tamamlandı)
- [x] **F1 — Günün Sözü + Widget Senkronu**: JS (`getQuoteOfTheDay`) ve Swift (`QuoteWidget.swift`) aynı FNV-1a `YYYY-MM-DD` algoritmasını (ve App Group `UserDefaults` desteğini) kullanıyor; `systemSmall` widget ailesi de eklendi.
- [x] **F2 — Widget Derin Bağlantısı**: Widget'a tıklandığında `stoic://quote/<quote>` URL'si ile uygulama doğrudan o sözde açılıyor (`App.js` Linking listener).
- [x] **F3 — Reflections (Notlar / Günlük) Ekranı (`app/screens/Notes.jsx`)**: Yazılan tüm refleksiyonları tarih sıralı görüntüleme, arama, düzenleme, silme, ilgili söze gitme ve dışa aktarma (Share). Hem Home alt barından hem Settings'ten erişilebilir.
- [x] **F4 — Akıllı App Store Değerlendirme İsteği (`app/utils/reviewPrompt.js`)**: 7/30 günlük streak veya 5/15 bookmark kilometre taşlarında 120 gün cooldown ile `StoreReview.requestReview()` çağrılır.

## 5. Kullanıcı Tarafında Yapılacak Dış Aksiyonlar
1. **GitHub Pages (`stoic-website`)**: `stoic-website` reposunun git remote'unu ve GitHub Pages yayınını aktif edip `privacy-policy` ve kök domain `app-ads.txt` erişimini doğrulayın.
2. **AdMob Console (UMP/GDPR)**: AdMob panelinde *Privacy & messaging → European regulations* altından GDPR onay mesajını yayınlayın.
