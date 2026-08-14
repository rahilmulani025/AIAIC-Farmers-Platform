# AIAIC Kisan — Demo Script (5 minutes)

Audience framing: this is a farmer-facing view of the AIAIC decision engine. Nothing is
hardcoded — every line on screen comes from an engine response, and where the engine is
unsure or silent, the screen says so.

## 0. Setup (before the demo)

- Engine base URL must be reachable (ngrok tunnel or hosted URL) via the `AIAIC_BASE_URL` env var.
- Open the app on a phone-sized window (or a real Android phone) — the layout is mobile-first.
- Clear site data if you want to show the first-time flow.

## 1. Landing page (30s)

- Point out: language switch (English / हिंदी / मराठी) is the very first control.
- Read the honest banner: this is a demonstration, advice is not yet cleared by farm scientists.
- Returning users see **Continue with my saved farm** — no retyping.

## 2. Ask screen (45s)

- Show the big pickers: district, crop, land size, and which topics they care about.
- Note the accessibility choices: 18px+ base text, tap targets over 56px, no dropdowns,
  searchable district list, everything reachable with one thumb.

## 3. Result screen — dashboard (60s)

- The top card is the **Decision Dashboard**: farm subject, total suggestions, and the
  count in each sureness band (fairly / somewhat / not very sure).
- The dashboard gives the last-updated time, a **Listen** button for all advice combined,
  **Share or print** for WhatsApp, quick links to each topic, and the Kisan Call Centre number.
- Below the dashboard: one card per topic with the plain-language headline, the crop/region it
  applies to, and a three-bar "sureness" meter instead of a false-precision percentage.
- Point out the amber note: "not yet checked by farm scientists" appears whenever the
  engine reports the model is uncalibrated.
- If a topic returns nothing, the card says **no advice today** — it does not invent one.

## 4. Detail screen (90s) — the trust story

- **What we suggest**: the engine's action, in farmer words.
- **In one line**: number of sources, age of newest reading, sureness, calibration status.
- **Listen to this advice**: speaks the advice in the selected language (browser voice).
- **Share or print**: sends a plain-text version to WhatsApp or the printer.
- **Why we say this**: the engine's own reasoning steps and best/average/worst case.
- **Where this comes from**: source names and how old the data is — a stale-data banner
  appears when the newest reading is old.
- **How sure we are / next action**: what would change the answer, and the Kisan Call
  Centre number for a human check.
- **Was this useful?** sends thumbs up/down to the shared store (and keeps a device copy),
  so the team sees real farmer reactions on `/review`.

## 5. Honesty and resilience (60s)

- Turn off the network (or stop the tunnel) and reload: the screen shows
  **Saved from earlier** with the timestamp of the last successful answer, plus a retry.
- Open **Expert review packet** (`/review`): raw engine payloads per topic and the
  feedback collected from all farmers, for reviewers who want to audit the mapping from
  engine output to farmer wording.

## 5b. Plant photo check (45s)

- On the dashboard, tap **Take or choose a photo** and pick a leaf photo.
- With `PLANT_BASE_URL` set, the Plant Intelligence subsystem's observations appear as
  plain label/value lines with the "observations only, not a diagnosis" disclaimer.
- With no URL set (or the subsystem down), the screen says the photo check is not
  connected / not answering — it never guesses a disease.

## 6. Closing line

"Every claim on screen is traceable to an engine response and a data source, with its age
and confidence visible. Where the engine abstains, the farmer is told to ask a human —
that is deliberate."
