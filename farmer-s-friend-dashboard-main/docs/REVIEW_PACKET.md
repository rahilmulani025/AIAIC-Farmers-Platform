# AIAIC MP Farmer Interface — Review Packet

> **Notice**: This review packet contains the focused summary of core files, architecture, integration endpoints, and design decisions necessary to review the AIAIC MP Farmer Interface frontend implementation.

---

## 1. System Overview

The **AIAIC MP Farmer Interface** is a mobile-first, high-accessibility decision dashboard designed for smartphone-using farmers in **Madhya Pradesh (MP)** and **Maharashtra (MH)** (targeting 50+ year-old non-technical users).

It translates real-time AI agricultural intelligence (market mandis, weather warnings, water/irrigation, crop evaluation, storage advice) into plain language with visual confidence meters and audio read-out capability in **English**, **Hindi (हिंदी)**, and **Marathi (मराठी)**.

---

## 2. Core File Registry (Focused Review Set)

### A. Routes & Screen Definitions (`src/routes/`)

- [`index.tsx`](file:///c:/Users/Rahil%20Mulani/Downloads/farmer-s-friend-dashboard-main/farmer-s-friend-dashboard-main/src/routes/index.tsx): Landing screen with language selection, saved farm profile quick-action, and uncalibrated demonstration notice.
- [`ask.tsx`](file:///c:/Users/Rahil%20Mulani/Downloads/farmer-s-friend-dashboard-main/farmer-s-friend-dashboard-main/src/routes/ask.tsx): Farmer data entry screen for selecting district, crop, land size, water access, and plant photo check upload.
- [`result.tsx`](file:///c:/Users/Rahil%20Mulani/Downloads/farmer-s-friend-dashboard-main/farmer-s-friend-dashboard-main/src/routes/result.tsx): Decision Dashboard displaying summary of available recommendations with confidence indicators and share/speech controls.
- [`advice.$service.tsx`](file:///c:/Users/Rahil%20Mulani/Downloads/farmer-s-friend-dashboard-main/farmer-s-friend-dashboard-main/src/routes/advice.$service.tsx): Service-specific recommendation detail page featuring plain-language explanation, APMC mandi price comparisons, evidence sources, known unknowns, and primary action step.
- [`review.tsx`](file:///c:/Users/Rahil%20Mulani/Downloads/farmer-s-friend-dashboard-main/farmer-s-friend-dashboard-main/src/routes/review.tsx): District intelligence overview summarizing regional data across all services.

### B. Live Intelligence API Integration (`src/lib/`)

- [`aiaic.functions.ts`](file:///c:/Users/Rahil%20Mulani/Downloads/farmer-s-friend-dashboard-main/farmer-s-friend-dashboard-main/src/lib/aiaic.functions.ts): Server functions for querying `/intelligence/{service}` and `/intelligence/unified` endpoints with error classification (`ERR_NGROK_3200` tunnel errors vs HTTP 404).
- [`aiaic-types.ts`](file:///c:/Users/Rahil%20Mulani/Downloads/farmer-s-friend-dashboard-main/farmer-s-friend-dashboard-main/src/lib/aiaic-types.ts): TypeScript response schemas for `AIAICResponse`, `ConfidenceLevel`, `SourceUsed`, `CaseNarrative`, and `Subject`.
- [`aiaic-labels.ts`](file:///c:/Users/Rahil%20Mulani/Downloads/farmer-s-friend-dashboard-main/farmer-s-friend-dashboard-main/src/lib/aiaic-labels.ts): District options (MP and MH), common crops, fallback mandis, and recommendation code humanizer mappings.
- [`catalog.functions.ts`](file:///c:/Users/Rahil%20Mulani/Downloads/farmer-s-friend-dashboard-main/farmer-s-friend-dashboard-main/src/lib/catalog.functions.ts): Live catalog fetcher (`GET /catalog`) with 5-minute server-side caching.

### C. Farmer-First UX & Accessibility Components (`src/components/farm/`)

- [`ConfidenceMeter.tsx`](file:///c:/Users/Rahil%20Mulani/Downloads/farmer-s-friend-dashboard-main/farmer-s-friend-dashboard-main/src/components/farm/ConfidenceMeter.tsx): Visual 3-bar gauge with icon indicators (High / Medium / Low / Abstain).
- [`RecommendationCard.tsx`](file:///c:/Users/Rahil%20Mulani/Downloads/farmer-s-friend-dashboard-main/farmer-s-friend-dashboard-main/src/components/farm/RecommendationCard.tsx): Plain-language action card.
- [`EvidenceCard.tsx`](file:///c:/Users/Rahil%20Mulani/Downloads/farmer-s-friend-dashboard-main/farmer-s-friend-dashboard-main/src/components/farm/EvidenceCard.tsx): Data freshness, observation date, and official source links (e.g., Agmarknet).
- [`LanguageSwitcher.tsx`](file:///c:/Users/Rahil%20Mulani/Downloads/farmer-s-friend-dashboard-main/farmer-s-friend-dashboard-main/src/components/farm/LanguageSwitcher.tsx): EN / HI / MR language toggle with TTS voice synthesis.
- [`BigSelect.tsx`](file:///c:/Users/Rahil%20Mulani/Downloads/farmer-s-friend-dashboard-main/farmer-s-friend-dashboard-main/src/components/farm/BigSelect.tsx): Touch target picker designed for non-technical users.

---

## 3. Key Design & Technical Principles

1. **Strict Honesty & Calibrated Warnings**:
   - Every recommendation page explicitly displays: _"Uncalibrated illustrative defaults — demonstration of operation on real evidence, NOT farmer-ready advice."_
   - Abstentions (`recommendation: "ABSTAIN"`) display the exact reason given by the AI engine.

2. **Zero Hardcoding of Intelligence**:
   - The UI never invents advice or hardcodes decisions. All recommendations, mandis, and prices originate directly from the live API (`https://disarm-scrubbed-pushiness.ngrok-free.dev`).

3. **Accessibility**:
   - Touch targets are 56px+ tall.
   - Devanagari typography (Mukta & Baloo 2) ensures clear legibility for Hindi and Marathi text.
   - Speech synthesis reads out full advice text aloud for low-literacy users.

---

## 4. Verification & Build Integrity

- **TypeScript**: Passed (`npx tsc --noEmit`) with 0 errors.
- **Linter**: Passed (`npm run lint`) with 0 errors.
- **Production Build**: Verified (`npm run build`) via TanStack Start SSR & Vite.
- **Live API Endpoint**: Verified live connectivity to `GET /intelligence/market`.
