# Stoic

Stoic is an iOS & mobile application that brings daily quotes, reflections, and insights from Stoic philosophers (Marcus Aurelius, Seneca, Epictetus, and Cleanthes).

## Features
- **Daily Quotes & Quote of the Day**: Deterministically synchronized daily wisdom across the Home screen, rolling notifications, and iOS Home/Lock Screen widgets.
- **Reflections Journal (Notes)**: Write, search, edit, and export personal reflections linked to any quote.
- **Personalized Ritual Notifications**: 14-day rolling morning & evening reminders with custom hours and weekly fallback.
- **iOS Home & Lock Screen Widgets**: Small, Medium, Large, and Lock Screen widgets with deep linking (`stoic://quote/...`) directly into the app.
- **Philosopher Filter & Streak Tracking**: Filter by preferred Stoic philosophers and track your daily reading streak.
- **System/Dark/Light Theme & Optional Dynamic App Icon**: Follows system appearance or manual override, with optional app icon matching.

## Tech Stack
- **Expo SDK 58** & **React Native 0.88** (React 19.3, Hermes, New Architecture)
- **Zustand 5** + **MMKV** (O(1) index-based quote persistence with automatic storage migration)
- **React Navigation 7** & **Reanimated 4** + **Gesture Handler 3**
- **Google Mobile Ads 17** (UMP GDPR consent + single-point ATT + shared frequency-capped ad manager)
- **React Native Firebase 27** (Modular Crashlytics & Analytics + ErrorBoundary)
- **NativeWind** (Tailwind CSS)

## Build & Xcode Workflow (CNG, No EAS, No Metro Required)

This project uses **Expo Continuous Native Generation (CNG)**.
- **`app.json` + `plugins/` is the single source of truth.**
- **`eas.json` and EAS Build are not used.**
- The `ios/` directory is git-ignored and generated on demand via `expo prebuild`.
- `plugins/withEmbeddedJsBundle.js` forces Xcode to embed `main.jsbundle` in **both Debug and Release** builds and configures `AppDelegate.swift` to load the embedded bundle first — so pressing **⌘R in Xcode runs standalone without a Metro server**.

### Commands

```sh
# 1. Generate the native iOS project from app.json
npm run ios:prebuild

# 2. Open the workspace in Xcode (press ⌘R to run on Simulator or Device without Metro)
npm run ios:open

# Or build from CLI:
npm run ios:build:sim       # Debug simulator build (with embedded main.jsbundle)
npm run ios:build:release   # Release simulator build

# Health & code quality checks:
npm run lint
npm run doctor
```

### Bumping Version / Build Number
Update **only** `expo.version` and `expo.ios.buildNumber` in `app.json`, then run `npm run ios:prebuild`. Both the main app target and the `QuoteWidget` extension target inherit the version and build number automatically.

### Environment Variables (`.env.development` / `.env.production`)
AdMob unit IDs use Expo's built-in `EXPO_PUBLIC_*` prefix:
- `EXPO_PUBLIC_IOS_ADMOB_BANNER`
- `EXPO_PUBLIC_IOS_ADMOB_INTERSTITIAL`
- `EXPO_PUBLIC_IOS_ADMOB_OPEN`
- `EXPO_PUBLIC_ANDROID_ADMOB_BANNER`
- `EXPO_PUBLIC_ANDROID_ADMOB_INTERSTITIAL`
- `EXPO_PUBLIC_ANDROID_ADMOB_OPEN`

## Reach Me
- **Mail**: sevinc.aeren@gmail.com
- **LinkedIn**: https://www.linkedin.com/in/alierensevinc
- **GitHub**: https://github.com/alierensevinc
