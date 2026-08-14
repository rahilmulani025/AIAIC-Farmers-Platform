# Farmer's Friend Dashboard

the task : Rahil + Rhugved — AIAIC MP Farmer Interface & Decision Dashboard (AIAIC – Current Task) READ THIS FIRST. Paste this entire task into your preferred GPT/LLM before doing anything else. Your GPT must help you execute this task, ask only delivery-relevant questions, and convert this assignment into an execution plan. Your responsibility is to turn the emerging AIAIC intelligence into a simple, usable, real-data farmer-facing interface. Hemanth owns runtime/integration; Kaushlendra owns intelligence/ML. You own the user experience and frontend delivery. PHASE 1 — LEARN Review the existing AIAIC frontend, APIs, response schemas, available real datasets and current recommendation flows. Identify the minimum screens required for the MP PoC. Do not invent workflows that the backend cannot support. PHASE 2 — DESIGN Design a very simple farmer-first experience usable by:

first-time smartphone users

farmers with limited technical literacy

50+ year-old users Prioritize:

large readable text

obvious actions

minimal navigation

Marathi/Hindi/English-ready structure

simple terminology

clear status indicators

visual explanations rather than technical data dumps

accessibility and responsive mobile-first behaviour The interface must explain uncertainty clearly. Never present an illustrative or uncalibrated recommendation as a guaranteed agricultural instruction. PHASE 3 — BUILD Build the production-quality frontend using the existing AIAIC stack and reusable BHIV UI capabilities where available. Core PoC flow: Farmer / operator → location / land / crop information → available water/weather/plant/market intelligence → recommendation → simple explanation → evidence/source → confidence/limitations → next action Create only the screens required to demonstrate this complete flow. PHASE 4 — INTEGRATE Work directly with Hemanth against the live API contracts. Use real API responses wherever available. Handle:

loading

empty data

unavailable service

incomplete evidence

low confidence

failed request

stale data

unsupported location/crop No hardcoded recommendation values masquerading as live intelligence. PHASE 5 — TEST Test the UI on mobile and desktop. Validate the complete real-data flow and capture screenshots of:

landing/input experience

farmer data entry

intelligence result

recommendation explanation

evidence/source

error/uncertainty state

responsive/mobile view Conduct a usability pass specifically asking whether a non-technical farmer can understand what to do without external instruction. PHASE 6 — DOCUMENT + HANDOVER Deliver:

frontend implementation

reusable components

design decisions

responsive layouts

API integration notes

supported states

screenshots

short demo video

REVIEW_PACKET

focused /code_packet/

evidence_packet/

handover notes REVIEW_PACKET must contain only the focused files necessary to review the implementation, not the entire repository. NON-GOALS Do not redesign AIAIC architecture. Do not create a second backend. Do not invent intelligence. Do not hardcode production decisions. Do not turn the dashboard into a technical command centre. Do not expose unnecessary internal BHIV/TANTRA complexity to farmers. SUCCESS CONDITION A real AIAIC recommendation generated from real evidence can be presented through a simple interface that a farmer can understand and act upon without technical training. In runtime this means: Real farmer input → real AIAIC intelligence → simple recommendation → explanation → evidence → clear next action.

this is the next task given to me , go through it properly and tell me what its about what we have to do what are the things which will be required to complete this .

This is about building a farmer-facing mobile app for Madhya Pradesh.

The context: AIAIC is an AI system that gives agricultural recommendations to farmers — what crop to plant, when to irrigate, what the market price looks like, weather warnings, etc. Right now that intelligence exists in a backend but there is no simple interface for a farmer to use it.

Your job: build the frontend that a farmer in MP can actually use.

Not a technical dashboard. Not a command center. A simple, large-text, Hindi/Marathi-ready mobile screen that a 55-year-old farmer with a basic smartphone can understand without anyone teaching him.

The 6 phases broken down simply

Phase 1 — Learn (do this first, before building anything)

You need to talk to Hemanth (he owns runtime/integration) and Kaushlendra (he owns the ML/intelligence). Ask them:

What APIs exist?

What does a real recommendation response look like?

What real datasets are available (weather, water, market prices, plant data)?

What locations and crops are currently supported?

Do not build anything until you know what the backend can actually give you.

Phase 2 — Design

Design screens that a farmer can understand. The brief is very specific about this:

Large text

Obvious buttons

Marathi/Hindi/English support

No technical jargon

Show confidence levels clearly (never pretend a recommendation is guaranteed)

Visual explanations, not data tables

Phase 3 — Build

Build these specific screens:

Landing / Input — farmer enters location, land size, crop type

Intelligence view — weather, water, market data shown simply

Recommendation — what the AI suggests, in plain language

Explanation — why it is suggesting this

Evidence/Source — where the data came from

Confidence/Limitations — how sure the AI is, what it does not know

Next Action — one clear thing the farmer should do now

Phase 4 — Integrate

Connect every screen to Hemanth's live APIs. No hardcoded values. Handle every failure state — loading, no data, service down, low confidence, unsupported location.

Phase 5 — Test

Test on mobile. Take screenshots of every screen including error states. Do a usability check: can a non-technical person understand what to do without help?

Phase 6 — Document

Deliver frontend code, components, design decisions, API integration notes, screenshots, demo video, and the documentation package.

What you own vs what others own

Person Responsibility You (Rahil) Frontend, UX, farmer interface, all screens Rhugved Collaborating on frontend (check with him on split) Hemanth Backend APIs, runtime, live data integration Kaushlendra ML models, intelligence, recommendation logic

You do not touch the backend. You do not invent recommendations. You only build the screen that shows what the backend gives you.

What you need before you can build anything

From Hemanth (message him today):

Base URL of the AIAIC API

What endpoint gives a recommendation (method, params, response shape)

What endpoint gives weather data for a location

What endpoint gives market prices

What locations/crops are currently supported

Sample real API responses (even just JSON examples)

Any authentication needed

From Kaushlendra (message him today):

What does a recommendation object look like in JSON?

What confidence fields are returned?

What explanation fields are returned?

What evidence/source fields are returned?

What does a low-confidence response look like?

What does an unsupported location response look like?

From Rhugved (message him today):

What is the existing AIAIC frontend stack? (React? Vue? Native?)

What reusable components already exist?

How do you split the work between the two of you?

What I can start building right now (before APIs arrive)

Even before Hemanth sends the API docs, I can build:

The complete UI skeleton — all 7 screens with the correct layout, large text, Hindi/Marathi text strings, mobile-first responsive design

All the loading, empty, error, and low-confidence states — these are purely frontend

The language switcher — English/Hindi/Marathi toggle

The farmer input form — location, land size, crop type

The recommendation display components — confidence indicator, evidence cards, next action button

The design system — large text scale, accessible colors, mobile touch targets

The moment Hemanth sends the API response shape, I wire the real data in. The skeleton becomes live in hours.

The single most important design principle

The brief says this explicitly and it is the core of the whole project:

"Never present an illustrative or uncalibrated recommendation as a guaranteed agricultural instruction."

This means every recommendation must show:

How confident the AI is (as a simple visual — not a percentage, a farmer cannot process that)

What it does not know

That this is a suggestion, not a guaranteed instruction

If you get this wrong, a farmer could make a bad decision based on a guess that looked like a fact. That is the failure condition the brief is designed to prevent.

This is what hemant provided me , go through it and tell me what are the other things needed , and about rhugved he is working on another project so i will be doing the whole frontend part and if i need any help i can ask him for .

AQIAIC live API — base URL, recommendation endpoint, sample, supported crops/locations Everything you need below. Note: the platform is UNCALIBRATED — a real-data demonstration, not farmer-ready advice. Every item carries its confidence, sources, and abstentions; render those honestly. Base URL (live, ngrok): https://disarm-scrubbed-pushiness.ngrok-free.dev ⚠️ Send the header ngrok-skip-browser-warning: true on every request, or ngrok returns an HTML page instead of JSON. Interactive docs + full schema: GET /docs · machine-readable: GET /openapi.json. Recommendation endpoints: GET /intelligence/{service}?region=&crop=&limit= — service ∈ market | water | weather | crop | storage GET /intelligence/unified?limit= — all services combined Sample real response — GET /intelligence/market?limit=1: { "recommendation": "SELL_AT_MANDI", "confidence": "high", "recommendation_detail": "Sell at the best-net mandi today", "abstained": false, "subject": { "crop": "mango", "region": "Sangli" }, "sources_used": [{ "source_id": "agmarknet_daily_prices", "source_name": "Agmarknet — Variety-wise Daily Market Prices (Mandi)", "signal": "market", "tier": "primary_official", "observed_at": "2026-06-06T00:00:00", "freshness": "fresh", "license": "GODL-India", "synthetic": false, "source_url": "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070" }], "explainability": [ "Of the options today, Chattrapati Sambhajinagar APMC pays the most net of transport and fees — about ₹16750/quintal. The spread between best and worst mandi is about ₹5750/quintal, so where you sell matters.", "3. decision:mandi_net: net realisable by mandi: Chattrapati Sambhajinagar APMC=₹16750, Kolhapur APMC=₹15000, Nasik APMC=₹14000 …" ], "known_unknowns": [ "Engine runs on UNCALIBRATED illustrative defaults — demonstration of operation on real evidence, NOT farmer-ready advice." ], "supporting_evidence": { "decision_id": "dec_…", "confidence_score": 0.… }, "calibrated": false, "decision_id": "dec_…" } (Abbreviated — call the endpoint or see /docs for the exact full object. Every item has these fields: recommendation, confidence, recommendation_detail, abstained, subject, best/average/worst_case, explainability[], known_unknowns[], supporting_evidence, sources_used[], calibrated, decision_id. An abstention comes back as recommendation: "ABSTAIN" with its reason — show it as-is, never as advice.) Currently supported (real data, Maharashtra): Market & Storage: ~90 commodities (onion, tomato, soybean, mango, cotton, tur/chana, banana, chilli, wheat, potato, …) across the state's APMC mandis (~117 markets). Caveat: prices are currently a single-day snapshot (2026-06-06); a deeper history is being ingested. Water / Weather / Crop intelligence: the 36 Maharashtra districts (Pune, Nashik, Ahmednagar, Latur, Beed, Yavatmal, … — plus taluka granularity for water/groundwater), evaluated for water-intensive crops (e.g. sugarcane). region accepts a district (e.g. region=Latur) and crop a commodity (e.g. crop=onion); omit them to get everything, use limit to cap. Ping me if you need a field added or want me to keep the tunnel up for a testing window — I'll leave the backend + ngrok running.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
