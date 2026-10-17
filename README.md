# KidsStream — React Native App

A safe, kid-friendly YouTube video streaming app with parental controls, screen-time management, and a centralized backend.

This project is a **1:1 migration** of the original Kotlin/Jetpack Compose Android app to **React Native + TypeScript**, preserving identical UI, flows, and API contracts.

---

## 📱 Features

### Child Experience
- **Splash Screen** — Animated branding + backend health check
- **Profile Selection** — Tap avatar or enter password
- **Home Feed** — Approved channels, playlists, videos with category filter
- **Explore Tab** — Independent category browsing
- **Search** — Real-time safe search (approved content only)
- **Channel Details** — Browse a channel's approved videos
- **Playlist Details** — Numbered video list with "Play All"
- **Video Player** — YouTube embed + watch-time tracker
- **Child Profile** — Screen time progress + profile switcher
- **Almost-Time Warning** — Shown at ≤5 min remaining
- **Time-Out Lock** — Full-screen lock when daily limit is exhausted

### Parent Experience
- **Parental Auth** — 4-digit PIN, login, register, admin
- **Parent Dashboard** — Family overview + stats
- **Children Management** — Add, edit, delete child profiles
- **Content Management** — Approve/remove YouTube videos, channels, playlists
- **Screen Time** — Global daily limit (15–180 minutes)
- **PIN Management** — Secure PIN updates
- **Time Extension** — Grant temporary bonus time from timeout

### Admin Experience
- **Admin Console** — System-wide governance
- **Overview** — Platform telemetry + stats
- **Parents Directory** — Suspend/activate parent accounts
- **Children Directory** — Pause/activate child profiles
- **Content Oversight** — Moderate approved content

---

## 🏗️ Architecture

### Tech Stack
- **React Native** (latest)
- **TypeScript**
- **Zustand** — State management (replaces Kotlin StateFlow repositories)
- **Axios** — HTTP client (replaces Retrofit)
- **React Navigation** — Screen navigation (replaces Compose Navigation)
- **react-native-webview** — YouTube player (replaces Android WebView)
- **react-native-vector-icons** — Material icons
- **react-native-linear-gradient** — Gradients
- **react-native-reanimated** — Animations
- **@react-native-community/slider** — Extension dialog slider
- **@react-native-async-storage/async-storage** — Token persistence

### Folder Structure
src/
├── app/ # App-level: navigation, providers, config
│ ├── navigation/ # RootNavigator, navigationRef, ScreenState
│ ├── providers/ # AppProviders (theme + tokens)
│ └── config/ # env.ts (API URLs)
├── components/ # Reusable UI
│ ├── ui/ # Cards, category row, status views, toast
│ └── layout/ # Header, bottom nav
├── features/ # Feature-based modules
│ ├── splash/
│ ├── auth/ # Child login
│ ├── home/
│ ├── explore/
│ ├── search/
│ ├── channel/
│ ├── playlist/
│ ├── player/
│ ├── profile/
│ ├── timeout/ # Lock + almost-time dialog
│ ├── parental/ # Auth dialog, PIN, extension, settings
│ ├── parent-dashboard/ # Full parent panel + dialogs
│ └── admin-dashboard/ # Full admin panel
├── services/
│ ├── api/ # client.ts, kidsApi.ts (all endpoints)
│ └── storage/ # secureStorage.ts (tokens)
├── store/ # Zustand stores
│ ├── contentStore.ts # Approved videos/channels/playlists + session
│ ├── screenTimeStore.ts # Timer, PIN, extensions
│ └── parentAdminStore.ts # Parent + admin sessions
├── theme/ # colors, typography, dimensions, ThemeProvider
├── types/ # models, api, navigation
├── hooks/ # useScreenTime, useChildSession
├── utils/ # formatTime, youtube, color
└── constants/ # Category tabs metadata

---

## 🚀 Setup

### Prerequisites
- Node.js ≥ 18
- npm or yarn
- React Native CLI
- Android Studio (for Android)
- Xcode (for iOS, macOS only)
- Backend running at `http://localhost:4000` (or cloud URL)

### 1. Create the Project

```bash
npx @react-native-community/cli@latest init KidsStreamApp --pm npm
cd KidsStreamApp
# Navigation
npm install @react-navigation/native @react-navigation/native-stack
npm install react-native-screens react-native-safe-area-context

# State management
npm install zustand

# HTTP client
npm install axios

# Storage
npm install @react-native-async-storage/async-storage

# WebView (YouTube player)
npm install react-native-webview

# Icons
npm install react-native-vector-icons

# Slider
npm install @react-native-community/slider

# Gradients
npm install react-native-linear-gradient

# Animations
npm install react-native-reanimated
npm install react-native-worklets

# Date utilities
npm install date-fns# KiddoTube
