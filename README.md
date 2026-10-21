# AIMAN — AI Medicine Affordability Network

> Same medicine. Honest price.

**AIMAN** is an AI-powered medicine affordability assistant built for India. It helps families buy the *exact* medicines their doctor prescribed — at the *lowest honest price* — by comparing branded retail MRPs against Jan Aushadhi generics (PMBJP) and NLEM/DPCO ceiling prices, scanning prescriptions with OCR + **Gemma 4**, and locating the nearest Jan Aushadhi Kendra.

Built for hackathon submission (theme: AI for healthcare accessibility). Problem fit, technical depth, safety-first UX and a working, test-covered demo over everything else.

---

## What it does (working features, not mocks)

| # | Feature | Implementation |
|---|---------|----------------|
| 1 | **Medicine search** | Fuzzy search across brand, generic and salt names. Tolerates typos via trigram Dice + Damerau-Levenshtein, and rejects "wrong medicine" results with **hard strength/dosage-form guards** (see `test/engine.test.ts` → safety tests). Also expands digit-run misreads (`dolo 65 0` → `dolo 650`). Zero-network, works offline. |
| 2 | **Photo-based scan (“Scan Medicine List”)** | In-browser OCR (Tesseract.js, `eng+hin`) → optional **Gemma 4** interpretation (Google AI Studio or local Ollama) → **human-in-the-loop review screen**: every line editable, low-confidence lines start *unchecked*. AIMAN never guesses a medicine silently. Images never leave the device (all processing in-page; discarded after). |
| 3 | **Price comparison** | Same ingredient + strength + form only: brand MRPs vs Jan Aushadhi MRP (per unit, per pack, drug code) vs NLEM/DPCO ceiling price. Savings computed **only** on comparable scope, tagged with source + last-verified date. Visual bars + ₹/unit math. |
| 4 | **Nearby Jan Aushadhi Kendras** | Browser geolocation **or** city/PIN-code entry (Nominatim geocoding). Curated, date-stamped directory of 30+ verified kendras with haversine distances, Google Maps links, directions, call-to-confirm buttons, PMBJP helpline 1800-180-8080, plus a live OpenStreetMap/Overpass lookup (best effort). **No stock claims, ever.** |
| 5 | **Gemma 4** | Real integration, honestly reported (see below). Settings page probes Google AI / Ollama and reports exactly what is connected. Fallback = clearly labelled deterministic heuristic — never presented as Gemma. |
| 6 | **Design & accessibility** | Mobile-first, 3rem+ tap targets, visible focus rings, skip-link, `aria-live` results, EN/HI toggle (`हिं`/`EN`) with Hindi voice search (`hi-IN`/`en-IN`) via Web Speech API, Fraunces + Mukta type, high-contrast warm-paper palette. |
| 7 | **Safety & privacy** | AIMAN **never** diagnoses, prescribes, or substitutes. Consult-a-pharmacist messaging on every medicine page, in the basket, in footers. No accounts, no backend, no analytics. List persists only in `localStorage`. |

## Architecture

```
index.html ──────────────────────── meta, fonts (Fraunces/Mukta), favicon.svg
src/
  main.tsx ── AppProvider (lib/context.tsx) ... actually components/AppProvider.tsx
  App.tsx ──────────────────────── HashRouter routes + global ErrorBoundary + skip-link
  data/
    medicines.ts ───────────────── 46 formulations: composition, salts, strength, form,
                                   JA MRP (+ drug code), brand MRPs, NLEM ceilings, aliases,
                                   source + verified date on EVERY price row
    kendras.ts ─────────────────── 30+ verified PMBJP kendras (google-maps links, PN), geo helpers,
                                   Overpass live lookup, Nominatim geocoder
  lib/
    search.ts ──────────────────── normalize → parseQuery (units, digit-runs, forms) →
                                   strengthsClose (hard guard) → token trigram/DL similarity
    compare.ts ─────────────────── buildPriceRows, computeSavings (30-unit/month scope),
                                   computeBasketSavings (whole-basket savings), INR formatters
    gemma.ts ───────────────────── Gemma 4 layer: runtime detection (Google AI key / Ollama),
                                   prompt contract (strict JSON, "never invent"), response parser
                                   (fence/JSON extraction), symbolic fallback
    ocr.ts ─────────────────────── tesseract.js wrapper (dynamic import; eng+hin) + text cleanup
    i18n.ts, cn.ts, catalog.ts ── EN/HI dict, class merge, comparable-category helper
  components/
    Header / Footer / SearchBar ── nav with list badge, voice mic, live suggestions (role=combobox)
    PriceTable ─── price rows + savings hero + comparison bars
    MedicineCard ─ search-result cards with add-to-list
  pages/
    Home, SearchPage, MedicineDetail, ScanPage (OCR flow), KendrasPage,
    MyListPage (savings basket, print), SettingsPage (Gemma config), AboutPage
test/
  engine.test.ts ───────────────── 24 tests, node:test, zero deps
```

## Data sources & honesty policy

- **Jan Aushadhi MRPs** — PMBJP published product MRP list (janaushadhi.gov.in), accessed Oct 2026.
- **NLEM/DPCO ceiling prices** — National Pharmaceutical Pricing Authority.
- **Brand prices** — *indicative* maximum retail prices observed at Indian pharmacies, each tagged `source` + `verified` date. Shelf prices vary by city/pharmacy; the UI shows the verified date beside every price.
- **Kendra locations** — PMBJP listings + district administration pages, verified 2026-10-01; coordinates flagged approximate where uncertain. Live OpenStreetMap data is used opportunistically.
- **No price or medicine is ever invented**: anything not in the dataset simply does not appear. Basket totals exclude entries lacking a comparable JA price (and say so).

The dataset is intentionally small but real (`src/data/medicines.ts`, 46 formulations covering pain/fever, BP & heart, cholesterol, diabetes, stomach, allergy/antibiotics, vitamins, thyroid, skin, cough, anxiety). Swapping in the full PMBJP list is a data-only change bounded by the `Medicine` type.

## Gemma 4 — model, runtime, integration status

Gemma 4 (Google DeepMind, **released 2 April 2026**, Apache-2.0) is used for **one** job: turning messy OCR text into structured medicine candidates. It is **never** used to diagnose, to suggest switches, or to invent prices/data.

**Runtime support matrix (detect automatically, in order):**

| Priority | Runtime | How | Status handling |
|---|---|---|---|
| 1 | **Google AI Studio** — `gemma-4-31b-it` (default), `gemma-4-26b-a4b-it`, `gemma-4-4b-it` | Browser → `https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent` with header `x-goog-api-key`. Key stored in user's `localStorage` only; sent **only** to Google. | Settings page "Test connection" probes the exact model endpoint. |
| 2 | **Ollama** (fully offline) — `gemma4:e4b`, `gemma4:31b` | `POST {baseUrl}/api/generate` (default `http://localhost:11434`). | `pingOllama` probes `/api/tags` before use. |
| 3 | Nothing configured / unreachable | Deterministic **symbolic heuristic** (line classifier) | Clearly labelled “Gemma 4: not connected” in the UI and on the review screen; every candidate marked `low` confidence. |

Integration contract (`src/lib/gemma.ts`):
- Prompt forbids invention (“Never invent a medicine … set confidence to low”) and demands strict JSON: `{ "medicines": [{ name, strength, form, confidence, note }] }`.
- Parser strips code fences, extracts the outermost JSON object, coerces confidence to `low` unless literally `high`, and drops empty names.
- Low-confidence candidates start **unchecked** on the review screen. High-confidence ≠ auto-added — the user always confirms.
- Every outcome carries a `runtime` field (`google-ai` | `ollama` | `none`); the UI renders exactly that fact. **AIMAN never pretends Gemma is connected.**
- **Environment note:** the sandbox this was built in has no `GEMINI_API_KEY` set, so out-of-the-box the app runs the labelled heuristic path. Add your key (Settings → Option A) or set `VITE_GEMMA_API_KEY` at build time to enable real Gemma 4 inference — no code changes needed.

## API configuration

| Variable | Purpose | Where |
|---|---|---|
| `VITE_GEMMA_API_KEY` | Google AI Studio key for Gemma 4 (build-time default; can also be typed in Settings) | `.env` (never commit) or Settings UI |
| `VITE_GEMMA_MODEL` | Override model id (default `gemma-4-31b-it`) | env / Settings |
| `VITE_GEMMA_OLLAMA_URL` | Ollama endpoint (default `http://localhost:11434`) | env / Settings |
| `VITE_GEMMA_OLLAMA_MODEL` | Ollama model tag (default `gemma4:e4b`) | env / Settings |

Keys typed into Settings live in `localStorage` (`aiman.gemma.config.v1`), are shown masked, and are transmitted only to Google's API (or your LAN Ollama). There is no AIMAN backend. Nominatim/Overpass (kendra lookup) and Google Fonts are the only third-party runtime calls, and both need no keys.

## Setup & development

```bash
npm install
npm run dev        # vite dev server
npm test           # 24 engine tests (node:test — no extra deps)
npm run lint       # eslint, zero errors
npm run build      # tsc -b && vite build → dist/
npm run preview    # serve the production build
```

Requires Node ≥ 20 (tests use built-in `node --test` with type stripping; app needs only evergreen browsers).

## Testing

`npm test` runs 24 assertions over the safety-critical core:
- fuzzy search on real queries — `dolo 650`, `amoxicilin 500` (typo), `metformn`, and `dolo 65 0` (digit-run),
- **hard safety invariants**: `paracetamol 325` returns nothing when only 500/650 exist; a 5 mg query never surfaces a 10 mg row; plain-salt queries outrank combinations; combination queries find the combo;
- savings math (avg-brand→JA per unit, 30-unit months, ₹ grouping), dataset internal consistency (pack math, `verified` dates, JA drug codes),
- Gemma helpers: fence-stripping JSON parser, confidence degradation, prompt contract, symbolic fallback behavior,
- haversine sanity (Delhi↔Mumbai ≈ 1150 km).

Browser flows verified with headless Chromium: home → fuzzy search → detail → scan page → kendra locator (25 cards, helpline) → settings → about — zero console/page errors.

## Hackathon priorities

Problem fit (real out-of-pocket pain + Jan Aushadhi underutilisation), Innovation (OCR+Gemma 4 human-confirmed prescription parsing; strength-safe fuzzy search), Technical depth (working OCR pipeline, JSON-contract LLM layer, offline-first catalogue, 24 tests), Impact (₹600–900/month illustration, basket-level savings), UX (mobile-first, EN/HI, voice, 44px+ targets), Code quality (typed, linted, tested), Honesty (every number sourced and dated).

## Limitations

- Dataset = 46 curated formulations, not the full PMBJP catalogue; "not found" is an honest answer, expanded by swapping `data/medicines.ts`.
- Brand MRPs are indicative and age; `verified` dates are the ground truth in-app.
- OCR quality depends on handwriting; Gemma 4 (if connected) shapes text but cannot guarantee a misread — hence mandatory user confirmation.
- No live kendra stock exists publicly; AIMAN deliberately shows locations, not inventory.
- Not a medical device, not a pharmacy; never substitutes medicines.

## License

MIT — see `LICENSE` sections in `package.json`; fonts via Google Fonts (Fraunces, Mukta — OFL).

Made for India's medicine buyers. 🇮🇳
