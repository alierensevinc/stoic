# Stoic — İyileştirme Planı ve Checklist

> Oluşturulma: 2026-09-22. Bu doküman canlıdır — üzerinde çalıştıkça kutucuklar işaretlenecek, notlar eklenecek.

## 1. Tespit: Bildirim "hit" düşüşünün kök nedeni

`app/store/quoteStore.js` içindeki `scheduleDailyRitualNotifications` fonksiyonu incelendi:

- **Bildirimler tekrar etmiyor.** Her çağrıda sadece **bir sonraki** 09:00 ve 19:00 için tek seferlik (`Date` trigger) bildirim kuruluyor. Expo'nun `daily: true` tekrarlayan trigger'ı kullanılmıyor. Yani kullanıcı iki bildirimi aldıktan sonra **uygulamayı tekrar açmadığı sürece bir daha hiç bildirim almıyor** — çünkü yeniden zamanlama sadece `initializeNotifications` (app açılışı, ve `scheduled.length === 0` ise) veya toggle aç/kapa anında tetikleniyor. Pasif kullanıcı = sessizliğe düşüyor. Bu, engagement düşüşünün en büyük tek sebebi.
- **İçerik hep aynı iki söz.** `morningQuote = quotes[0]`, `eveningQuote = quotes[1]` — yani MMKV'de duran mevcut sırlamanın ilk iki elemanı. 1774 sözden sadece kullanıcının o anki "üstteki" iki sözü bildirime giriyor; günler geçse de genelde aynı kalıyor (kullanıcı swipe etmedikçe). Gerçek "günün sözü" rotasyonu yok.
- **Saat kullanıcıya sabit** (09:00/19:00), kişiselleştirme yok — kullanıcı zaman diliminde uygunsuz saatte gelen bildirimi kapatıyor olabilir.
- **Permission isteği iki farklı yerden** yapılıyor (`App.js` → `initializeNotifications`, ve `useSettings.js` → `handleToggleNotifications`) — ilk açılışta kullanıcıya sorulmadan `requestPermissionsAsync` çağrılıyor, bu iOS'ta "soft-ask" olmadan direkt sistem prompt'u göstermek demek — genelde ret oranını artırır.
- Bildirime tıklanınca söz listenin başına ekleniyor (`useHome.js`) ama bu, widget'taki günün sözüyle senkron değil (widget ayrı `QuotesData.swift` kullanıyor, kontrol edilmeli).

**Sonuç:** Teknik altyapı (izin, içerik, planlama) var ama "ritüel" hissi kırılgan. Bunu düzeltmek en yüksek ROI'li iş.

## 2. Genel kod/teknoloji durumu

- **Stack:** Expo SDK 53, React Native 0.79.6, React 19, Zustand, MMKV, Nativewind (Tailwind), Reanimated 3 — çekirdek stack güncel, büyük bir "eski teknoloji" sorunu yok.
- **Ölü kod:** `app/utils/axiosInstance.js` (stoic-quotes.com/api) hiçbir yerde import edilmiyor — API entegrasyonu terk edilmiş, local `quotes.json` kullanılıyor.
- **Kullanılmayan bağımlılıklar:** `moment` (hiç import edilmiyor), `axios` (sadece ölü dosyada), `add` (anlamsız paket), `react-navigation` v5 (eski, `@react-navigation/*` v6 zaten kullanılıyor — legacy paket kalıntısı).
- **Kod tekrarı:** `Settings.jsx` içinde `screenHeight < 812` dallanmasında **aynı JSX bloğu iki kez** yazılmış (satır 41-88 ve 90-136) — tek fark ScrollView/View sarmalayıcı. Bu, bakım riskidir.
- **Lint/format/test yok.** ESLint, Prettier, TypeScript, hiçbir test dosyası bulunamadı. Regresyonları yakalamak tamamen manuel.
- **`useSettings.js`** hem izin kontrolü hem email/share/rate/navigation gibi alakasız sorumlulukları tek hook'ta topluyor — bölünmeye aday.
- Performans: `QuoteList`/ana ekran incelenmedi detaylı ama `setQuotes` her çağrıda **tüm quotes dizisini JSON.stringify edip MMKV'ye yazıyor** (1774 öğe) — swipe'ta gereksiz I/O olabilir, ölçülmeli.

## 3. Checklist

İşaretleme: `[ ]` yapılacak · `[x]` tamamlandı · `[~]` kısmen/değerlendiriliyor

### Faz 1 — Bildirim Sistemi Yeniden Tasarımı (Kritik, önce bu)
- [x] `scheduleDailyRitualNotifications` yeniden yazıldı → tek seferlik `Date` trigger yerine, her hafta günü (1-7) × ritüel (sabah/akşam) için `SchedulableTriggerInputTypes.WEEKLY` ile **gerçek, OS seviyesinde tekrar eden** 14 bildirim kuruluyor. Artık uygulama tekrar açılmadan da bildirimler sonsuza kadar akmaya devam ediyor. Bkz. [notificationScheduler.js](../app/utils/notificationScheduler.js).
- [x] Bildirim içeriği için **rotasyon**: her hafta günü + ritüel slotuna, quotes havuzundan deterministik ve **birbirinden farklı** bir söz atanıyor (`pickQuote`) — artık hep aynı iki söz değil, haftada 14 farklı söz dönüyor.
- [x] İlk açılışta otomatik `requestPermissionsAsync` çağrısı kaldırıldı (`initializeNotifications` artık sadece handler kurar + önceden izin verilmişse zamanlamayı garantiler). İzin isteği artık **sadece** kullanıcı Settings'te toggle'ı açtığında tetikleniyor.
- [ ] Kullanıcının bildirim **saatini kendisi seçebilmesi** (Settings'te time picker) — sabit 09:00/19:00 yerine. *(sonraki iterasyon)*
- [ ] Bildirim **kategorileri/aksiyonları**: "Kaydet" / "Paylaş" quick action (iOS `UNNotificationCategory`). *(sonraki iterasyon)*
- [ ] Widget (`QuotesData.swift`) ile bildirim içeriğinin aynı "günün sözü" kaynağından beslenmesi — bu native/Swift tarafında App Group üzerinden paylaşılan veri gerektiriyor, ayrı bir iş paketi. *(sonraki iterasyon)*
- [ ] Bildirime tıklama → analytics event (hangi bildirim türü açılış getiriyor, Firebase Analytics zaten mevcut). *(sonraki iterasyon)*
- [ ] Gerçek cihaz/simülatörde doğrulama: `npm install` sonrası (kaldırılan bağımlılıklar nedeniyle lockfile güncellenmeli) build alıp bildirimlerin planlandığını (`getAllScheduledNotificationsAsync`) ve doğru saatlerde tetiklendiğini test et.

### Faz 2 — Kod Temizliği / Refactor
- [x] `Settings.jsx` içindeki tekrarlanan JSX bloğu tek `ListWrapper` (ScrollView/View) bileşenine indirildi.
- [x] Ölü dosya/bağımlılıklar kaldırıldı: `axiosInstance.js` silindi; `axios`, `moment`, `add`, `react-navigation` (v5) `package.json`'dan çıkarıldı. *(Not: `npm install` çalıştırılıp `package-lock.json` senkronize edilmeli.)*
- [x] `quoteStore.js`'te bildirim mantığı ile quote state mantığı ayrıldı → yeni `app/utils/notificationScheduler.js`.
- [ ] `useSettings.js`'i sorumluluklarına göre böl (ör. `useNotificationSettings`, `useAppActions`) — bildirim mantığı ayrıldı ama hook henüz tek parça, sonraki iterasyonda bölünebilir.
- [ ] ESLint + Prettier kurulumu (React Native/Expo preset) — CI'da olmasa bile local script.
- [ ] (Değerlendirilecek) Kademeli TypeScript geçişi — en azından store ve hook'lardan başlanabilir.

### Faz 3 — Performans
- [x] **MMKV yazma sıklığı düzeltildi**: `setQuotes` artık sadece bellekteki (zustand) state'i güncelliyor; ~1800 elemanlı diziyi `JSON.stringify` edip MMKV'ye yazma işi her swipe'tan kaldırıldı. Yeni `persistQuotes()` aksiyonu, uygulama arka plana geçtiğinde (`AppState` "background"/"inactive") tek seferde flush ediyor. Bkz. [quoteStore.js](../app/store/quoteStore.js). Swipe artık native thread'de (Reanimated) çalışan animasyonun dışında hiçbir senkron disk I/O tetiklemiyor.
- [x] **Gereksiz re-render'lar**: `QuoteListItem` (bookmarks listesindeki her satır) `React.memo` ile sarmalandı; `theme` nesneleri (`themes.js`) modül seviyesinde sabit referanslar olduğu için memo gerçek anlamda etkili — değişmeyen `item`/`theme` için satırlar artık re-render olmuyor. Bkz. [QuoteListItem.jsx](../app/components/QuoteListItem.jsx).
- [x] **Reanimated/worklet kontrolü**: `useHome.js`'teki gesture/animasyon zinciri zaten doğru desenle yazılmış (`useAnimatedGestureHandler`, `useSharedValue`, `withTiming`, JS tarafına geçiş için `runOnJS`) — tüm animasyonlar UI thread'inde çalışıyor, değişiklik gerekmedi.
- [x] **Expo/React Native güncellik kontrolü**: `npx expo install --check` çalıştırıldı → "Dependencies are up to date". Bu maddede aksiyon gerekmedi.
- [x] **Görsel varlıklar**: `assets/new2.png` (2.7MB), `assets/new3.png` (3.6MB), `assets/new4.png` (3.6MB) kod tabanında hiçbir yerden referans verilmiyordu (App Store ekran görüntüsü boyutları: 1290×2796, 1284×2778, 1024×1536) ve Expo'nun runtime `assets/` klasörünü ~10MB şişiriyordu. Kullanıcı onayıyla `picasso.pco/SourceScreenshots/` altına taşındı (git rename) — artık mağaza görselleri kendi proje klasöründe, `assets/` sadece uygulamanın gerçekten kullandığı dosyaları içeriyor.

### Faz 4 — Yeni Özellikler (Faz 1 sonrası, engagement odaklı)
- [x] **Streak / seri takibi**: [streakStore.js](../app/store/streakStore.js) — uygulama her açıldığında/öne geldiğinde (`AppState`) günlük olarak sayılıyor; ardışık gün açılırsa +1, gün atlanırsa 1'e resetleniyor. [StreakBadge.jsx](../app/components/StreakBadge.jsx) Home ekranının üst ortasında 2+ günden itibaren 🔥 rozeti olarak gösteriyor.
- [x] **Kategori/filozof filtresi**: `quoteStore.js`'e `ALL_AUTHORS` (quotes.json'dan türetilen: Marcus Aurelius, Seneca, Epictetus, Cleanthes) ve `setAuthorFilter` eklendi. Filtre hem Home'daki söz döngüsünü hem de bildirim havuzunu (aynı `QUOTES_KEY`'i paylaştıkları için) etkiliyor. Settings'te [AuthorFilterModal.jsx](../app/components/AuthorFilterModal.jsx) üzerinden çoklu seçim yapılabiliyor.
- [x] **Günlük not/refleksiyon**: [notesStore.js](../app/store/notesStore.js) her sözü kendi metnine göre anahtarlayan bir not haritası tutuyor. Home'daki aksiyon çubuğuna kalem ikonlu yeni bir buton eklendi ([NoteModal.jsx](../app/components/NoteModal.jsx)); not varsa ikon dolu hale geliyor. *(Notlara göz atmak için ayrı bir liste ekranı henüz yok — gelecek iterasyon.)*
- [x] **Bildirim zamanı özelleştirme**: `notificationScheduler.js`'e `getRitualHours`/`setRitualHour` eklendi (varsayılan 09:00/19:00, MMKV'de saat bazında saklanıyor). Settings'te [TimePickerModal.jsx](../app/components/TimePickerModal.jsx) ile saat seçilip anında yeniden zamanlanıyor (bildirimler açıksa).
- [ ] **Haftalık özet bildirimi**: "Bu hafta 5 söz okudun" gibi engagement bildirimleri. *(sonraki iterasyon — streak altyapısı hazır, üzerine kurulabilir)*
- [ ] **Live Activity / genişletilmiş widget** seçenekleri (iOS 16+ zaten hedefleniyor). *(sonraki iterasyon, native/Swift iş paketi)*

### Faz 5 — Kalite Güvencesi
**Kullanıcı talebiyle atlandı** (test altyapısına gerek olmadığı belirtildi). Not olarak duruyor, ileride istenirse tekrar açılabilir.
- [ ] ~~Kritik akışlar için temel test altyapısı (Jest + React Native Testing Library).~~
- [ ] ~~Bildirim zamanlama mantığı için unit test.~~
- [ ] ~~Manuel test checklist'i: izin reddi/kabulü, toggle aç-kapa, uygulama arka planda/kapalıyken bildirim tetiklenmesi.~~

### Faz 6 — Xcode 27 / Expo SDK 57 Yükseltmesi (kritik, acil)
Geliştirme makinesinde **Xcode 27.0 / macOS 27.0** tespit edildi. Apple, iOS 27 SDK ile derlenen uygulamalarda **UIKit scene-based lifecycle**'ı zorunlu kıldı; bu destek Expo tarafında ancak **SDK 57.0.23+** ile geldi (SDK 56 ve altı launch'ta çöküyor — [expo/expo#46663](https://github.com/expo/expo/issues/46663), [#46664](https://github.com/expo/expo/issues/46664)). Proje SDK 53'teydi, bu yüzden **SDK 57'ye yükseltildi**.
- [x] `npx expo install expo@^57.0.0 --fix` ile Expo ve tüm expo-managed paketler (React 19.2.3, React Native 0.86.3 dahil) hizalandı.
- [x] `app.json` → `expo-build-properties` plugin'ine `ios.enableSceneSupport: true` eklendi (Xcode 27/iOS 27 launch şartı).
- [x] `app.json`'daki eski top-level `splash` alanı kaldırıldı, SDK 57'de zorunlu olan `expo-splash-screen` config plugin formatına taşındı (yoksa schema validasyonu patlıyordu).
- [x] **react-native-reanimated 4.5.1'e yükseltme** — bu majör sürüm `useAnimatedGestureHandler`'ı tamamen kaldırdı (sadece Yeni Mimari'yi destekliyor). `useHome.js` ve `QuoteViewShot.jsx` yeni **Gesture API**'ye taşındı (`Gesture.Pan()` + `GestureDetector`, eski `PanGestureHandler`/`useAnimatedGestureHandler` yerine).
- [x] `babel.config.js`: `react-native-reanimated/plugin` → `react-native-worklets/plugin` (Reanimated 4'te worklet derlemesi ayrı pakete taşındı; `react-native-worklets` peer dependency olarak eklendi).
- [x] `App.js`'e `GestureHandlerRootView` sarmalayıcısı eklendi (Gesture API'nin gerektirdiği, önceden yoktu).
- [x] Eksik kalan `babel-preset-expo` devDependency olarak eklendi (npm hoisting sorunu nedeniyle proje kökünden çözülemiyordu, build zaten kırık olurdu).
- [x] `npx expo-doctor` temiz: sadece iki önceden var olan, engelleyici olmayan uyarı kaldı (CNG sync notu — ios/ klasörü commit'li olduğu için beklenen; `expo-dynamic-app-icon` paketinin Yeni Mimari'de test edilmemiş/bakımsız olması — **cihazda test ederken açık/koyu tema ikon değişimini özellikle kontrol edin**).
- [ ] **`npx expo prebuild --clean` çalıştırılmalı** — `ios/` klasörü SDK 53 native modülleriyle üretilmişti, SDK 57'nin yeni native bağımlılıklarıyla (Firebase, AdMob, Reanimated 4, vb.) eşleşmiyor. Bu adımı ve ardından `pod install` + Xcode build'i **kullanıcı kendi simülatöründe çalıştıracak**, ajan tarafında yapılmadı.
- [ ] Simülatörde doğrulanması gerekenler: genel açılış (scene lifecycle), swipe jestleri (Gesture API geçişi), bildirim zamanlaması, dynamic app icon geçişi (dark/light).

## 4. Önerilen sıralama

1. Faz 1 (bildirim) — düşen hit'lerin doğrudan sebebi, en hızlı etki.
2. Faz 2 (temizlik) — Faz 1'i yaparken zaten `quoteStore.js`'e dokunacağız, aynı anda temizleyelim.
3. Faz 3 (performans) — ölçüm sonrası önceliklendirilir.
4. Faz 4 (yeni özellikler) — sağlam temel üstüne.
5. ~~Faz 5 (test)~~ — kullanıcı talebiyle atlandı.
6. Faz 6 (Xcode 27/SDK 57) — acil, aksi halde Xcode 27 ile hiç build alınamıyor.
