import type { Lang } from "./i18n";
import type { Service } from "./aiaic-types";

/**
 * The 36 districts of Maharashtra — the regions the live AIAIC engine currently
 * evaluates. `region` is sent to the API exactly as written here.
 */
export const DISTRICTS = [
  // Madhya Pradesh (MP) Districts
  "Bhopal",
  "Indore",
  "Ujjain",
  "Sagar",
  "Jabalpur",
  "Gwalior",
  "Dewas",
  "Dhar",
  "Khargone",
  "Ratlam",
  "Chhindwara",
  "Rewa",
  "Sehore",
  "Raisen",
  "Vidisha",
  "Narmadapuram",
  "Mandsaur",
  "Neemuch",
  "Satna",
  "Morena",
  // Maharashtra (MH) Districts
  "Ahmednagar",
  "Akola",
  "Amravati",
  "Aurangabad",
  "Beed",
  "Bhandara",
  "Buldhana",
  "Chandrapur",
  "Dhule",
  "Gadchiroli",
  "Gondia",
  "Hingoli",
  "Jalgaon",
  "Jalna",
  "Kolhapur",
  "Latur",
  "Mumbai City",
  "Mumbai Suburban",
  "Nagpur",
  "Nanded",
  "Nandurbar",
  "Nashik",
  "Osmanabad",
  "Palghar",
  "Parbhani",
  "Pune",
  "Raigad",
  "Ratnagiri",
  "Sangli",
  "Satara",
  "Sindhudurg",
  "Solapur",
  "Thane",
  "Wardha",
  "Washim",
  "Yavatmal",
] as const;

/** Common Agmarknet commodities. `crop` is sent to the API as written here. */
export const CROPS = [
  "Onion",
  "Tomato",
  "Potato",
  "Soybean",
  "Cotton",
  "Wheat",
  "Bajra",
  "Jowar",
  "Maize",
  "Gram",
  "Tur",
  "Sugarcane",
  "Banana",
  "Mango",
  "Grapes",
  "Pomegranate",
  "Orange",
  "Chilli",
  "Groundnut",
  "Sunflower",
  "Turmeric",
  "Cabbage",
  "Cauliflower",
  "Brinjal",
  "Okra",
  "Green Chilli",
  "Coriander",
  "Garlic",
  "Ginger",
  "Papaya",
] as const;

/**
 * Fallback APMC market list for the market service, used only when
 * `GET /catalog` is unreachable. Sent to the API as written here.
 */
export const MANDIS = [
  "Kolhapur APMC",
  "Mumbai APMC",
  "Nashik APMC",
  "Pune APMC",
  "Nagpur APMC",
  "Solapur APMC",
  "Latur APMC",
  "Jalgaon APMC",
  "Chattrapati Sambhajinagar APMC",
] as const;

/**
 * Farmer-friendly wording for the engine's recommendation codes.
 * Anything not listed falls back to the code, humanised, and is always shown
 * next to the engine's own `recommendation_detail` — we never invent a meaning.
 */
const RECOMMENDATION_LABELS: Record<string, Record<Lang, string>> = {
  SELL_AT_MANDI: {
    en: "Sell at the mandi today",
    hi: "आज मंडी में बेचें",
    mr: "आज मंडीत विका",
  },
  HOLD: {
    en: "Wait — do not sell yet",
    hi: "रुकें — अभी न बेचें",
    mr: "थांबा — आत्ता विकू नका",
  },
  STORE: {
    en: "Store your crop for now",
    hi: "फ़िलहाल फ़सल रखें",
    mr: "सध्या पीक साठवा",
  },
  IRRIGATE: {
    en: "Give water to the field",
    hi: "खेत में पानी दें",
    mr: "शेताला पाणी द्या",
  },
  DELAY_IRRIGATION: {
    en: "Wait before watering",
    hi: "पानी देने में रुकें",
    mr: "पाणी देण्यास थांबा",
  },
  AVOID_SOWING: {
    en: "Do not sow right now",
    hi: "अभी बुवाई न करें",
    mr: "आत्ता पेरणी करू नका",
  },
  SOW: { en: "Sowing looks suitable", hi: "बुवाई ठीक लगती है", mr: "पेरणी योग्य वाटते" },
  ABSTAIN: { en: "No advice given", hi: "कोई सलाह नहीं", mr: "सल्ला नाही" },
};

export function recommendationLabel(code: string | undefined, lang: Lang): string {
  if (!code) return "—";
  const known = RECOMMENDATION_LABELS[code.toUpperCase()];
  if (known) return known[lang];
  return code
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/^./, (c) => c.toUpperCase());
}

/** Explainability lines like "3. decision:mandi_net: …" are the technical trace. */
export function isTechnicalLine(line: string): boolean {
  return /^\s*\d+\.\s|decision:|signal:|score|=|\{|\[/.test(line);
}
