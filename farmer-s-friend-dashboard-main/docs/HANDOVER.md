# AIAIC MP Farmer Interface — Frontend Handover

Farmer-facing UI for the AIAIC decision engine. Mobile-first, three languages,
built so a 50+ non-technical farmer can read one screen and know what to do —
and know how sure the system is.

## Screens

| Route              | Purpose                                                                 |
| ------------------ | ----------------------------------------------------------------------- |
| `/`                | Landing: language choice + honest demonstration disclaimer              |
| `/`                | Landing: language choice + honest demonstration disclaimer              |
| `/ask`             | Big-target input: district, crop, land size, which topics               |
| `/result`          | Decision dashboard + one card per topic with headline action + sureness |
| `/advice/$service` | Full detail: reasoning, evidence, sureness, unknowns, what to do now    |

`/result` and `/advice/$service` read their inputs from URL search params
(`region`, `crop`, `landSize`, `services`), so any screen is shareable and
reloadable.

## Backend integration

- All calls go through `getIntelligence` in `src/lib/aiaic.functions.ts`
  (a server function). The browser never talks to the engine directly, so the
  tunnel URL, ngrok header, and CORS never reach the client.
- Base URL comes from `AIAIC_BASE_URL` (server env), falling back to the
  current ngrok tunnel. When the tunnel URL changes, set that variable — no
  code change needed.
- Responses are parsed loosely (`src/lib/aiaic-types.ts`): unknown fields are
  kept, missing fields degrade to a stated "we don't know" rather than a crash.
- ngrok's own offline response is detected and shown as "service offline",
  not as a fake result and not as "unknown district/crop". Note that a down
  tunnel answers **HTTP 404** — with an HTML page for browsers, and plain text
  `ERR_NGROK_3200` for JSON callers like us — so `isTunnelErrorBody` in
  `aiaic-base.server.ts` is checked _before_ the 404 handling.

## The four honesty rules the UI enforces

1. **No advice is invented in the frontend.** Every sentence a farmer reads
   comes from the engine response, or from a fixed label that describes the
   engine's own code (e.g. `SELL_AT_MANDI` → "Sell at the mandi today").
2. **Abstention is shown as abstention.** When the engine declines, the card
   says information only / not enough data — never a guess.
3. **`calibrated: false` is always visible.** Every card and detail page shows
   "not yet checked by farm scientists — a suggestion, not an order".
4. **Sureness, not percentages.** Confidence is shown as a 1–3 bar meter with a
   face icon and plain words. Raw numbers stay out of the farmer's way.

Data age is computed from the newest evidence date; anything older than a week
gets a visible "this data is old" banner.

## Accessibility decisions

- 18px base font, 20px+ body text on detail pages, generous line height.
- Every tap target is at least 56px tall.
- Pickers are large searchable button lists, not native `<select>` menus.
- Icons are real SVG icons (lucide), not emoji — emoji render as empty boxes on
  many low-cost Android devices.
- Colour is never the only signal: each status has an icon and words too.
- Full keyboard/screen-reader labelling, single `h1` per screen, semantic
  sections.

## Languages

`src/lib/i18n.tsx` holds one typed dictionary per language (English, हिंदी,
मराठी). Choice persists in `localStorage`. Adding a language = adding one
dictionary object; TypeScript then reports any missing string.

Fonts: Baloo 2 (headings) + Mukta (body) — both carry full Devanagari, so
Marathi and Hindi don't fall back to a mismatched system font.

## Where things live

```
src/lib/aiaic.functions.ts   server proxy to the engine
src/lib/aiaic-types.ts       response schemas + confidence/date helpers
src/lib/aiaic-labels.ts      districts, crops, recommendation-code wording
src/lib/aiaic-query.ts       query options + search-param parsing
src/lib/catalog.functions.ts server fetch + cache of the engine's valid-value catalog
src/lib/catalog-query.ts     picker options + honest empty-state reasoning
src/lib/i18n.tsx             translations
src/lib/service-icons.ts     topic icons
src/lib/farm-storage.ts      saved farm, last-good advice cache, local feedback
src/lib/use-speech.ts        browser speech synthesis (en-IN / hi-IN / mr-IN)
src/lib/advice-text.ts       one-line summary + text-only advice for voice/share
src/components/farm/         ConfidenceMeter, EvidenceCard, RecommendationCard,
                             BigSelect, StateBlock, LanguageSwitcher,
                             AdviceActions, FeedbackBlock, DashboardSummary
src/routes/                  index, ask, result, advice.$service, review

docs/DEMO-SCRIPT.md          5-minute walkthrough for reviews/demos
```

## Farmer-usability features

- **Saved farm**: district/crop/land/topics persist in `localStorage`; the landing page
  offers "Continue with my saved farm" so nothing is retyped.
- **Decision dashboard**: at the top of `/result`, a summary card shows the farm subject,
  the total number of suggestions, the count in each sureness band, the last-updated time,
  voice/share actions for all advice combined, quick links to each detail page, and the
  Kisan Call Centre number. The dashboard is present even when individual services fail
  or return no data, so the farmer is never left on a blank screen.
- **Last-good advice cache**: every successful result is cached per query. If the engine
  is unreachable, the result screen shows the cached advice under a "Saved from earlier"
  banner with its timestamp and a retry button — never a blank screen, never a guess.
- **Voice read-out**: "Listen to this advice" speaks the advice in the selected language.
- **Share or print**: plain-text advice for WhatsApp or a printout.
- **Feedback**: thumbs up/down stored on device and surfaced in the review packet.
- **Expert review packet** (`/review`, noindex): raw engine payload per topic plus local
  feedback, so a reviewer can audit engine output against farmer wording.

## Known gaps / next steps

- Engine returns Maharashtra data today; district list matches that. Swap
  `DISTRICTS` in `aiaic-labels.ts` when MP data lands, and set a stable
  `AIAIC_BASE_URL` (reserved ngrok domain or hosted deployment) for reliable demos.
- Recommendation-code wording covers the codes seen so far; unknown codes fall
  back to a readable version of the raw code and should be added to the map.
- Plant Intelligence (Kaushal) is wired in and waiting only for a URL: set the
  `PLANT_BASE_URL` secret and the photo check on `/result` starts posting to
  `POST {PLANT_BASE_URL}/analyze`. Until then the screen honestly says
  "photo check not connected yet".
- Feedback is now stored centrally as well as on the device.
- Voice quality depends on the device's installed Marathi/Hindi voices; fall back
  messaging is in place when none exists.
- Nothing here is farmer-ready until thresholds are calibrated and reviewed by
  an agronomist and an agricultural economist — the UI states this on every
  screen.

## Live catalog (`GET /catalog`)

- `src/lib/catalog.functions.ts` reads the engine's catalog server-side (5-minute
  cache, ngrok header) and never invents values.
- `src/lib/catalog-query.ts` turns it into picker options. When the engine is
  unreachable we fall back to the built-in lists **and say so** on `/ask`
  ("this list may be out of date").
- `regions` feed the district picker; `market_mandis` feed a market picker that
  appears only when the market service is selected and is sent as `region` for
  `/intelligence/market`.
- `uncalibrated: true` keeps the "not checked by scientists" banner on.

## Honest empty and error states

- Unknown region/crop returns `[]` with HTTP 200. We compare the subject against
  the catalog and show "the service has no data for this district or crop yet"
  instead of implying there is simply no advice today.
- Unknown service returns 404 with `{"detail": ...}`; the detail string is kept
  on the failure result and shown on `/review`.
- `abstained: true` / `recommendation: "ABSTAIN"` renders the abstain reason and
  `known_unknowns`, never a recommendation.

## Plant photo check (`src/lib/plant.functions.ts`, `PlantCheck.tsx`)

- Server function posts the farmer's photo as multipart `file` to
  `POST {PLANT_BASE_URL}/analyze` with the ngrok bypass header, and reuses
  `isTunnelErrorBody` so a dead tunnel reads as "service not answering".
- `plant_species` / `growth_stage` are shown as-is; every other field is flattened
  into label/value observation lines. Nothing is renamed, scored, or turned into a
  treatment instruction, and a fixed disclaimer states these are observations only.
- No URL configured -> `configured: false` -> "photo check not connected yet".
- The last result is kept on the device and printed raw on `/review` for experts.

## Central feedback (`advice_feedback` table)

- Columns: service, region, crop, mandi, recommendation, decision_id, useful, lang,
  created_at. No names, phone numbers or free text — nothing personal is collected.
- Anyone (including anonymous visitors) may insert and read; the review page lists the
  latest 100 rows. Editing and deleting are not granted to app users.
- `farm-storage.saveFeedback` still writes a device copy, so a failed send is not lost
  and the farmer is told the answer stayed on the phone.
