# BingwaShambani AI 🌿🤖

**BingwaShambani** (Swahili for "Field Expert") is a premium, AI-powered mobile application designed to empower Kenyan farmers with real-time crop disease diagnostics, localized agricultural advice, and professional reporting—even in areas with limited internet connectivity.

Built with **Expo** and **Supabase**, Bingwa combines cutting-edge AI (Groq Whisper & Llama 3) with a "local-first" architecture to ensure that every farmer has an expert in their pocket, 24/7.

---

## ✨ Key Features

### 🔍 Smart Diagnostics
*   **Visual Analysis:** Scan crops using the camera to identify diseases instantly.
*   **High-Accuracy AI:** Utilizes optimized computer vision models to provide severity levels and detailed diagnosis.
*   **Confidence Scores:** Clear indicators of analysis reliability.

### 🎙️ AI Knowledge Hub (Assistant)
*   **ChatGPT-Style Voice Input:** Intuitive "Hold-to-Talk" voice messaging powered by **Groq Whisper (Whisper-large-v3)**.
*   **Bilingual Support:** Full support for both **English and Swahili**, allowing farmers to communicate in their preferred language.
*   **Expert Advice:** Context-aware conversations about crop management, organic remedies, and prevention strategies.

### 📄 Receipt-ify (Professional Reporting)
*   **Agro-Reports:** Convert your scan history into professional, printable PDF reports.
*   **Share & Print:** Send reports directly to agrovets or print them for physical record-keeping.
*   **Remedy Vault:** Includes organic and chemical treatment advice for every diagnosed condition.

### 📶 Offline-Tolerant Architecture
*   **Local-First Caching:** Uses **React Query** and **AsyncStorage** to ensure your scan history and profile are available without internet.
*   **Smart Sync:** Automatically fetches fresh data when a connection is restored.
*   **Premium Offline UI:** Branded "Connection Lost" states and offline banners for a seamless user experience.

---

## 🛠️ Tech Stack

*   **Frontend:** React Native (Expo SDK 54)
*   **Language:** TypeScript
*   **Styling:** NativeWind (Tailwind CSS)
*   **Animations:** Moti (Powered by Reanimated)
*   **State & Cache:** TanStack React Query (v5)
*   **Backend:** Supabase (Auth, PostgreSQL, Storage, Edge Functions)
*   **AI Engine:** Groq (Whisper-large-v3 for Voice, Llama-3 for Chat)
*   **Local Storage:** AsyncStorage

---

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18+)
*   Expo Go app on your mobile device
*   Supabase Account

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/Bingwa-Expo.git
    cd Bingwa-Expo/Bingwa-expo
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    npx expo install
    ```

3.  **Environment Setup:**
    Create a `.env` file in the root directory:
    ```env
    EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
    EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
    ```

4.  **Run the app:**
    ```bash
    npx expo start
    ```

---

## 📂 Project Structure

```text
Bingwa-expo/
├── app/                # Expo Router (Pages and Layouts)
│   ├── (auth)          # Authentication Flow
│   ├── (tabs)          # Main App Navigation
│   ├── (onboarding)    # New User Experience
│   └── ai-assistant    # Knowledge Hub Logic
├── components/         # Reusable UI Components (ReceiptPreview, OfflineUI, etc.)
├── hooks/              # Custom React Hooks (useProfile, useNetwork, useScans)
├── services/           # API and Payment integrations
├── supabase/           # Edge Functions (Transcribe, AI-Assistant)
└── utils/              # Helper functions and constants
```

---

## 🏗️ Build & Deployment

The app is configured for **EAS (Expo Application Services)**:

**Build Android APK:**
```bash
eas build -p android --profile preview
```

**Build for Production:**
```bash
eas build -p android --profile production
```

---

## 🛡️ License
Distributed under the MIT License. See `LICENSE` for more information.

---

## 👨‍💻 Author
**Bingwa Team** - *4th Year Project*
Kenya 🇰🇪
