# Wayzle 🗺️

![Wayzle Banner](https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1200&h=400)

**Wayzle** is a modern, real-time navigation and place discovery application built for Web, iOS, and Android. It seamlessly combines highly accurate geospatial routing, live location tracking, and rich place metadata into a smooth, cross-platform experience. 

Designed with a sleek, map-centric user interface, Wayzle helps users discover trending restaurants, top-rated hotels, and entertainment hotspots near them, offering turn-by-turn routing with dynamic voice guidance.

---

## ✨ Features

- **🌍 Intelligent Discovery Feed**
  - View Top Rated and Trending places in your immediate vicinity.
  - Dynamically fetches rich place details, categorized intelligently (Restaurants, Hotels, Entertainment, Parks, Shopping).
  - Search functionality built directly into the discovery feed.

- **📍 Real-Time Navigation**
  - **Turn-by-Turn Routing**: Calculates precise driving, walking, and tuk-tuk routes via the OpenRouteService API.
  - **MapLibre Integration**: High-performance vector map rendering across Native (MapLibre React Native) and Web (MapLibre GL).
  - **Voice TTS Guidance**: Step-by-step vocal instructions dynamically triggered as you approach intersections.

- **🏪 Google Places Integration**
  - Pulls live, highly-detailed place data including operating hours, formatted addresses, and high-quality photo galleries.
  - Interactive "Place Details" screens complete with custom bottom-sheet modal interactions.

- **💬 Anonymous Review System**
  - Powered by Supabase, users can drop ratings and anonymous reviews for places instantly.
  - Real-time fetching of community feedback.

- **📱 Fully Cross-Platform (Universal App)**
  - A single, unified codebase serving iOS, Android, and Web browsers perfectly.
  - Built on Expo Router for native file-based routing and deep-linking support.

---

## 🛠 Tech Stack

### Core
- **Framework**: [React Native](https://reactnative.dev/) & [Expo](https://expo.dev/) (SDK 57)
- **Routing**: [Expo Router](https://docs.expo.dev/router/introduction/) (File-based routing)
- **Language**: TypeScript
- **Styling**: [NativeWind v4](https://www.nativewind.dev/) (Tailwind CSS for React Native)
- **Animations**: [Moti](https://moti.fyi/) & React Native Reanimated

### Backend & Data
- **Database & Auth**: [Supabase](https://supabase.com/)
- **State Management**: [Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction)
- **Maps (Native)**: `@maplibre/maplibre-react-native`
- **Maps (Web)**: `react-map-gl` & `maplibre-gl`

### APIs
- **Places**: Google Places API
- **Routing**: OpenRouteService (ORS) Directions API

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your local machine:
- **Node.js** (v20+ recommended)
- **npm** or **yarn**
- **Expo CLI** (`npm install -g expo-cli`)
- A **Supabase** Project
- **Google Cloud Console** Account (Places API enabled)
- **OpenRouteService** Account (API Key)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Suganth-U/wayzle.git
   cd wayzle
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env` file in the root of the project and add your API keys:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   EXPO_PUBLIC_GOOGLE_API_KEY=your_google_places_api_key
   EXPO_PUBLIC_OPENROUTESERVICE_KEY=your_ors_api_key
   ```

4. **Database Setup (Supabase):**
   Navigate to the Supabase SQL editor and run the migrations required to setup the anonymous reviews table. 
   *(See `scratch/reviews_migration.sql` if provided, or simply create a `reviews` table containing `id`, `place_id`, `rating`, `content`, `created_at`.)*

### Running the App

To run the app locally, start the Expo development server:

```bash
npx expo start
```

- Press `w` to open it in a Web browser.
- Press `i` to open it in an iOS Simulator.
- Press `a` to open it in an Android Emulator.
- Alternatively, scan the QR code using the **Expo Go** app on your physical device.

---

## 📁 Project Structure

```text
wayzle/
├── app/                      # Expo Router screens and navigation flows
│   ├── (tabs)/               # Main bottom-tab navigator (Map, Discover, Saved, Profile)
│   ├── explore/              # Category and search exploration screens
│   ├── place/                # Place details dynamic route
│   └── route-planner.tsx     # Navigation & Routing UI
├── src/
│   ├── api/                  # API integrations (Google Places, ORS, Supabase)
│   ├── components/
│   │   ├── map/              # MapLibre container components (Web/Native split)
│   │   └── ui/               # Reusable UI elements (Cards, Buttons, Modals)
│   ├── hooks/                # Custom React Hooks (useLocation, useRoute, etc.)
│   └── store/                # Zustand global state (useAppStore.ts)
├── assets/                   # Local image and font assets
├── tailwind.config.js        # NativeWind/Tailwind styling configuration
└── app.json                  # Expo configuration
```

---

## 🔧 Troubleshooting

- **Map Not Loading on Native:** MapLibre on Native requires a custom dev client. Standard Expo Go does not support custom native code natively if relying on advanced MapLibre features. You may need to run `npx expo run:ios` or `npx expo run:android` to compile the native bindings.
- **API 429 Errors:** OpenRouteService has strict rate limits. The app features a *Smart Fallback* routing algorithm that calculates a Haversine "straight-line" route automatically if ORS rate-limits are exhausted so development is uninterrupted.
- **Web Build Errors (MIME Type strict checking):** Ensure that there are no rogue escaped backslashes (e.g., `\$`) inside template literals within components rendered on the web, as this can break the Metro bundler AST parser.

---

## 📄 License

This project is licensed under the MIT License.
