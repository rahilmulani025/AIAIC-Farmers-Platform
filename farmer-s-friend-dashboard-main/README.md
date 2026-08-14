# AIAIC MP & MH Farmer Interface & Decision Dashboard

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-blue.svg)](https://react.dev/)
[![TanStack Start](https://img.shields.io/badge/TanStack--Start-1.168-orange.svg)](https://tanstack.com/router)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind--CSS-v4.2-38bdf8.svg)](https://tailwindcss.com/)

A simple, intuitive, real-data farmer-facing mobile web interface for the **AIAIC (AI Agricultural Intelligence Center) Decision Engine**. Designed specifically for smartphone-using farmers in **Madhya Pradesh (MP)** and **Maharashtra (MH)** — prioritizing accessibility for first-time smartphone users, limited technical literacy, and 50+ year-old users.

---

## 🌟 Key Features & Highlights

- **🌾 Farmer-First UX & Accessibility**:
  - Large readable text with high-contrast UI.
  - Extra-large tap targets (**56px+ height**) designed for easy touch navigation.
  - Clean Devanagari typography using Google Fonts (**Baloo 2** for headings and **Mukta** for body).
- **🌐 Tri-Lingual Support (EN / HI / MR)**:
  - Instant toggle between **English**, **Hindi (हिंदी)**, and **Marathi (मराठी)**.
  - Complete context-aware dictionary translation with persistent user preference storage.
- **🔊 Text-to-Speech (Voice Synthesis)**:
  - Integrated browser Web Speech API (`use-speech.ts`) enabling one-tap audio read-out of recommendations for low-literacy users.
- **📊 Visual Confidence Gauge**:
  - Replaces confusing percentage metrics with a simple 3-stage visual meter (**High / Medium / Low / Abstain**) and plain words.
- **⚠️ Strict Honesty & Uncalibrated Warnings**:
  - Prominent disclaimer banners on every decision card: _"Uncalibrated illustrative defaults — demonstration of operation on real evidence, NOT farmer-ready advice."_
  - Honest presentation of engine abstentions (`recommendation: "ABSTAIN"`), missing evidence, and known unknowns.
- **📸 Plant Health Inspection**:
  - Photo diagnostic checker (`PlantCheck.tsx`) allowing farmers to upload leaf/plant photos to receive objective observations.

---

## 📍 Supported Regions & Commodities

### Supported Regions

- **Madhya Pradesh (MP)**: Bhopal, Indore, Ujjain, Sagar, Jabalpur, Gwalior, Dewas, Dhar, Khargone, Ratlam, Chhindwara, Rewa, Sehore, Raisen, Vidisha, Narmadapuram, Mandsaur, Neemuch, Satna, Morena.
- **Maharashtra (MH)**: Pune, Nashik, Ahmednagar, Latur, Beed, Yavatmal, Kolhapur, Nagpur, Solapur, Amravati, Akola, Sangli, Satara, etc. (all 36 districts).

### Supported Commodities

- Soybean, Wheat, Onion, Tomato, Potato, Cotton, Gram, Tur, Sugarcane, Maize, Bajra, Jowar, Banana, Mango, Grapes, Pomegranate, Chilli, Groundnut, Garlic, Ginger, etc.

---

## 📱 User Flow & Application Screens

| Route                                | Purpose                                                                                                                                                  | Key Components                                              |
| :----------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------- |
| **`/` (Landing)**                    | Language choice, saved farm shortcut, project mission, and honest demonstration disclaimer.                                                              | `LanguageSwitcher`, `BigSelect`, `StateBlock`               |
| **`/ask` (Data Entry)**              | Accessible form to select district, crop, land size, water access, and plant photo upload.                                                               | `BigSelect`, `PlantCheck`                                   |
| **`/result` (Decision Overview)**    | Multi-service dashboard displaying recommendation cards for Market, Weather, Water, Crop Care, and Storage.                                              | `RecommendationCard`, `ConfidenceMeter`, `DashboardSummary` |
| **`/advice/$service` (Detail View)** | Deep-dive decision page featuring plain-language explanation, APMC mandi price comparisons, official evidence sources, known unknowns, and action steps. | `EvidenceCard`, `AdviceActions`, `FeedbackBlock`            |
| **`/review` (Intelligence Review)**  | Full regional intelligence overview summarizing all services for selected district/crop.                                                                 | `StateBlock`, `DashboardSummary`                            |

---

## 🛠️ Technology Stack

- **Core Framework**: [React 19](https://react.dev) + [TanStack Start](https://tanstack.com/router) (SSR) & [TanStack Router](https://tanstack.com/router)
- **Build System**: [Vite 8](https://vitejs.dev/) + [Nitro Engine](https://nitro.unjs.io/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + [Radix UI](https://www.radix-ui.com/) + [Lucide React Icons](https://lucide.dev/)
- **State & Data Fetching**: [TanStack React Query v5](https://tanstack.com/query)
- **Localization**: Custom Typed Context (`src/lib/i18n.tsx`) + Web Speech API (`src/lib/use-speech.ts`)
- **Database/Auth Integration**: Supabase Client (`@supabase/supabase-js`)

---

## 🔌 Live Backend API Integration

The frontend connects directly to the live AIAIC Decision Engine API:

- **Base URL**: `https://disarm-scrubbed-pushiness.ngrok-free.dev`
- **Required Header**: `ngrok-skip-browser-warning: true`
- **Key Endpoints**:
  - `GET /intelligence/{service}?region={district}&crop={crop}&limit=1`
  - `GET /intelligence/unified?limit=5`
  - `GET /catalog` (5-minute server-side cached catalog)
  - `GET /docs` & `GET /openapi.json`

> **Server Proxy Architecture**: All backend calls route through server functions (`src/lib/aiaic.functions.ts`). The browser client never touches ngrok or CORS headers directly, keeping API keys and tunnel logic secure on the server.

---

## 🚀 Getting Started & Local Development

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **Package Manager**: `npm` (or `bun`)

### Setup Instructions

1. **Clone the Repository**:

   ```bash
   git clone <repository-url>
   cd farmer-s-friend-dashboard-main
   ```

2. **Install Dependencies**:

   ```bash
   npm install
   ```

3. **Start Local Development Server**:

   ```bash
   npm run dev
   ```

   Open your browser at `http://localhost:3000` (or `http://localhost:5173`).

4. **Verify TypeScript Type Safety**:

   ```bash
   npx tsc --noEmit
   ```

5. **Lint and Format Code**:

   ```bash
   npm run lint
   npm run format
   ```

6. **Build for Production**:
   ```bash
   npm run build
   npm run preview
   ```

---

## 📁 Repository Structure

```
.
├── docs/
│   ├── REVIEW_PACKET.md         # Focused code & architecture review package
│   ├── HANDOVER.md              # Complete developer handover notes & design choices
│   ├── DEMO-SCRIPT.md           # 5-minute walkthrough script for review demos
│   └── evidence_packet/         # Verified UI screenshots across all 7 flow states
├── src/
│   ├── components/farm/         # Reusable farmer UI components (ConfidenceMeter, BigSelect, etc.)
│   ├── components/ui/           # Radix/Shadcn primitives (button, card, dialog, badge)
│   ├── integrations/supabase/   # Supabase client & server middleware
│   ├── lib/
│   │   ├── aiaic.functions.ts   # Server proxy querying AIAIC endpoints
│   │   ├── aiaic-types.ts       # Response schemas & confidence logic
│   │   ├── aiaic-labels.ts      # MP & MH districts, crops, and label mappings
│   │   ├── catalog.functions.ts # Engine catalog server cache handler
│   │   ├── i18n.tsx             # Multi-lingual dictionary (EN, HI, MR)
│   │   └── use-speech.ts        # Audio speech synthesis hook
│   └── routes/                  # TanStack file-based routes (index, ask, result, advice.$service)
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## 📄 Handover & Review Documentation

- 📄 **Review Packet**: See [`docs/REVIEW_PACKET.md`](file:///c:/Users/Rahil%20Mulani/Downloads/farmer-s-friend-dashboard-main/farmer-s-friend-dashboard-main/docs/REVIEW_PACKET.md) for focused code architecture review.
- 📋 **Handover Notes**: See [`docs/HANDOVER.md`](file:///c:/Users/Rahil%20Mulani/Downloads/farmer-s-friend-dashboard-main/farmer-s-friend-dashboard-main/docs/HANDOVER.md) for technical implementation details.
- 🖼️ **Screenshot Evidence**: See [`docs/evidence_packet/`](file:///c:/Users/Rahil%20Mulani/Downloads/farmer-s-friend-dashboard-main/farmer-s-friend-dashboard-main/docs/evidence_packet/) for UI screen verification captures.

---

## ⚖️ License & Attribution

Built for the **AIAIC Platform (Farmer Interface & Decision Dashboard)**. Data provided by **Agmarknet (Directorate of Marketing & Inspection, Ministry of Agriculture & Farmers Welfare, Govt of India)** via `data.gov.in`.
