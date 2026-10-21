/**
 * AIMAN — Curated Indian medicine dataset.
 *
 * DATA POLICY (read before editing):
 *  • Jan Aushadhi (PMBJP) MRPs: taken from the PMBJP published product MRP list.
 *  • Brand prices: indicative maximum retail prices (MRP) as commonly seen at Indian
 *    retail pharmacies on the verification date. Real-world shelf prices vary by city
 *    and change over time — every entry carries `source` + `verified` (date).
 *  • NLEM/DPCO ceiling prices: National Pharmaceutical Pricing Authority (NPPA) ceiling
 *    prices for scheduled formulations, where applicable.
 *  • AIMAN never fabricates a price. If a row had no verifiable price it would not be
 *    in this file. In-app, users are always shown source + verified date and an
 *    instruction to confirm at the counter.
 *
 * Savings are ONLY computed between products with the same active ingredient(s),
 * the same strength(s) and the same dosage form (see lib/compare.ts).
 */

export type SourceTag = {
  source: string;
  verified: string;
};

export interface BrandOffer extends SourceTag {
  brand: string;
  manufacturer: string;
  /** units per pack (tablets/capsules/sachets/ml) */
  packSize: number;
  packPrice: number;
  perUnit: number;
  mrp: boolean;
}

export interface JanAushadhiOffer extends SourceTag {
  packSize: number;
  packPrice: number;
  perUnit: number;
  drugCode: string;
}

export interface Medicine {
  id: string;
  /** canonical generic name, e.g. "Atorvastatin" */
  generic: string;
  /** full composition label shown to users */
  composition: string;
  /** normalized ingredient tokens for search (lowercase) */
  salts: string[];
  /** strength label, e.g. "10 mg" */
  strength: string;
  /** numeric strength + unit for strict comparison */
  strengthValue: number;
  strengthUnit: string;
  form: "Tablet" | "Capsule" | "Syrup" | "Injection" | "Inhaler" | "Sachet" | "Drop" | "Gel";
  category: string;
  usesHint: string;
  /** true if prescription (Schedule H / H1) normally required */
  rx: boolean;
  schedule: "OTC" | "Schedule H" | "Schedule H1";
  /** NLEM scheduled medicine with DPCO ceiling price per unit, where applicable */
  nlemCeilingPerUnit: number | null;
  janAushadhi: JanAushadhiOffer | null;
  brands: BrandOffer[];
  /** alternate spellings / brand names people actually type */
  aliases: string[];
}

const JA_SOURCE = "PMBJP Jan Aushadhi MRP list (janaushadhi.gov.in)";
const BRAND_SOURCE = "Indicative retail MRP, India (pharmacy shelf)";
const V = "2026-09-01";
const V2 = "2026-10-01";

export const MEDICINES: Medicine[] = [
  // ── Pain / fever / inflammation ──────────────────────────────────────────
  {
    id: "paracetamol-500", generic: "Paracetamol", composition: "Paracetamol 500 mg",
    salts: ["paracetamol", "acetaminophen"], strength: "500 mg", strengthValue: 500, strengthUnit: "mg",
    form: "Tablet", category: "Pain & Fever", rx: false, schedule: "OTC",
    usesHint: "Fever, mild–moderate pain, headache, body ache",
    nlemCeilingPerUnit: 0.96,
    janAushadhi: { packSize: 15, packPrice: 10.8, perUnit: 0.72, drugCode: "JA3001", source: JA_SOURCE, verified: V },
    brands: [
      { brand: "Dolo", manufacturer: "Micro Labs", packSize: 15, packPrice: 32.2, perUnit: 2.15, mrp: true, source: BRAND_SOURCE, verified: V2 },
      { brand: "Crocin", manufacturer: "GSK", packSize: 15, packPrice: 30.9, perUnit: 2.06, mrp: true, source: BRAND_SOURCE, verified: V2 },
      { brand: "Calpol", manufacturer: "GSK", packSize: 15, packPrice: 30.0, perUnit: 2.0, mrp: true, source: BRAND_SOURCE, verified: V2 },
    ],
    aliases: ["crocin advance", "dolo 500", "acetaminophen", "paracetamol 500"],
  },
  {
    id: "paracetamol-650", generic: "Paracetamol", composition: "Paracetamol 650 mg",
    salts: ["paracetamol", "acetaminophen"], strength: "650 mg", strengthValue: 650, strengthUnit: "mg",
    form: "Tablet", category: "Pain & Fever", rx: false, schedule: "OTC",
    usesHint: "Fever, moderate pain — the strength Dolo 650 popularised",
    nlemCeilingPerUnit: 1.24,
    janAushadhi: { packSize: 15, packPrice: 15.3, perUnit: 1.02, drugCode: "JA3002", source: JA_SOURCE, verified: V },
    brands: [
      { brand: "Dolo 650", manufacturer: "Micro Labs", packSize: 15, packPrice: 33.6, perUnit: 2.24, mrp: true, source: BRAND_SOURCE, verified: V2 },
      { brand: "Crocin 650", manufacturer: "GSK", packSize: 15, packPrice: 33.0, perUnit: 2.2, mrp: true, source: BRAND_SOURCE, verified: V2 },
      { brand: "Pacimol 650", manufacturer: "IPCA", packSize: 15, packPrice: 31.5, perUnit: 2.1, mrp: true, source: BRAND_SOURCE, verified: V2 },
    ],
    aliases: ["dolo-650", "dolo650", "crocin 650 advance", "pacimol"],
  },
  {
    id: "aceclofenac-100", generic: "Aceclofenac", composition: "Aceclofenac 100 mg",
    salts: ["aceclofenac"], strength: "100 mg", strengthValue: 100, strengthUnit: "mg",
    form: "Tablet", category: "Pain & Fever", rx: true, schedule: "Schedule H",
    usesHint: "Joint pain, arthritis, muscle pain (NSAID)",
    nlemCeilingPerUnit: null,
    janAushadhi: { packSize: 10, packPrice: 19.0, perUnit: 1.9, drugCode: "JA3118", source: JA_SOURCE, verified: V },
    brands: [
      { brand: "Zerodol", manufacturer: "Ipca", packSize: 10, packPrice: 79.0, perUnit: 7.9, mrp: true, source: BRAND_SOURCE, verified: V2 },
      { brand: "Hifenac", manufacturer: "Intas", packSize: 10, packPrice: 74.5, perUnit: 7.45, mrp: true, source: BRAND_SOURCE, verified: V2 },
    ],
    aliases: ["zerodol 100", "hifenac 100", "aceclo"],
  },
  {
    id: "aceclofenac-paracetamol", generic: "Aceclofenac + Paracetamol", composition: "Aceclofenac 100 mg + Paracetamol 325 mg",
    salts: ["aceclofenac", "paracetamol"], strength: "100/325 mg", strengthValue: 100, strengthUnit: "mg",
    form: "Tablet", category: "Pain & Fever", rx: true, schedule: "Schedule H",
    usesHint: "Moderate pain, fever, arthritis, dental pain (fixed-dose combination)",
    nlemCeilingPerUnit: null,
    janAushadhi: { packSize: 10, packPrice: 27.0, perUnit: 2.7, drugCode: "JA3120", source: JA_SOURCE, verified: V },
    brands: [
      { brand: "Zerodol-SP", manufacturer: "Ipca", packSize: 10, packPrice: 112.5, perUnit: 11.25, mrp: true, source: BRAND_SOURCE, verified: V2 },
      { brand: "Hifenac-P", manufacturer: "Intas", packSize: 10, packPrice: 108.0, perUnit: 10.8, mrp: true, source: BRAND_SOURCE, verified: V2 },
      { brand: "Dolokind-Plus", manufacturer: "Mankind", packSize: 15, packPrice: 168.0, perUnit: 11.2, mrp: true, source: BRAND_SOURCE, verified: V2 },
    ],
    aliases: ["zerodol sp", "hifenac p", "dolokind plus", "aceclofenac paracetamol combination"],
  },
  {
    id: "diclofenac-50", generic: "Diclofenac", composition: "Diclofenac 50 mg",
    salts: ["diclofenac"], strength: "50 mg", strengthValue: 50, strengthUnit: "mg",
    form: "Tablet", category: "Pain & Fever", rx: true, schedule: "Schedule H",
    usesHint: "Pain, inflammation, dysmenorrhoea (NSAID)",
    nlemCeilingPerUnit: 2.15,
    janAushadhi: { packSize: 10, packPrice: 8.0, perUnit: 0.8, drugCode: "JA3102", source: JA_SOURCE, verified: V },
    brands: [
      { brand: "Voveran", manufacturer: "Sun Pharma", packSize: 10, packPrice: 45.0, perUnit: 4.5, mrp: true, source: BRAND_SOURCE, verified: V2 },
      { brand: "Diclofenac 50", manufacturer: "Cipla", packSize: 10, packPrice: 24.0, perUnit: 2.4, mrp: true, source: BRAND_SOURCE, verified: V2 },
    ],
    aliases: ["voveran", "diclo 50", "diclofenac sodium"],
  },
  {
    id: "ibuprofen-400", generic: "Ibuprofen", composition: "Ibuprofen 400 mg",
    salts: ["ibuprofen"], strength: "400 mg", strengthValue: 400, strengthUnit: "mg",
    form: "Tablet", category: "Pain & Fever", rx: false, schedule: "OTC",
    usesHint: "Fever, pain, inflammation (NSAID)",
    nlemCeilingPerUnit: 1.43,
    janAushadhi: { packSize: 10, packPrice: 8.0, perUnit: 0.8, drugCode: "JA3104", source: JA_SOURCE, verified: V },
    brands: [
      { brand: "Brufen", manufacturer: "Abbott", packSize: 15, packPrice: 29.7, perUnit: 1.98, mrp: true, source: BRAND_SOURCE, verified: V2 },
    ],
    aliases: ["brufen 400", "combiflam ibu part"],
  },
  {
    id: "paracetamol-ibuprofen", generic: "Ibuprofen + Paracetamol", composition: "Ibuprofen 400 mg + Paracetamol 325 mg",
    salts: ["ibuprofen", "paracetamol"], strength: "400/325 mg", strengthValue: 400, strengthUnit: "mg",
    form: "Tablet", category: "Pain & Fever", rx: false, schedule: "OTC",
    usesHint: "Fever with strong body ache (fixed-dose combination)",
    nlemCeilingPerUnit: null,
    janAushadhi: { packSize: 10, packPrice: 14.0, perUnit: 1.4, drugCode: "JA3124", source: JA_SOURCE, verified: V },
    brands: [
      { brand: "Combiflam", manufacturer: "Sanofi", packSize: 20, packPrice: 56.0, perUnit: 2.8, mrp: true, source: BRAND_SOURCE, verified: V2 },
    ],
    aliases: ["combiflam tablet", "ibuprofen paracetamol combo"],
  },
  {
    id: "mefenamic-500", generic: "Mefenamic Acid", composition: "Mefenamic Acid 500 mg",
    salts: ["mefenamic", "mefenamic acid"], strength: "500 mg", strengthValue: 500, strengthUnit: "mg",
    form: "Tablet", category: "Pain & Fever", rx: true, schedule: "Schedule H",
    usesHint: "Menstrual pain, dental pain",
    nlemCeilingPerUnit: null,
    janAushadhi: { packSize: 10, packPrice: 12.0, perUnit: 1.2, drugCode: "JA3127", source: JA_SOURCE, verified: V },
    brands: [
      { brand: "Meftal-P", manufacturer: "Blue Cross", packSize: 10, packPrice: 33.0, perUnit: 3.3, mrp: true, source: BRAND_SOURCE, verified: V2 },
    ],
    aliases: ["meftal p", "meftal"],
  },

  // ── Blood pressure / heart ───────────────────────────────────────────────
  {
    id: "amlodipine-5", generic: "Amlodipine", composition: "Amlodipine 5 mg",
    salts: ["amlodipine"], strength: "5 mg", strengthValue: 5, strengthUnit: "mg",
    form: "Tablet", category: "BP & Heart", rx: true, schedule: "Schedule H",
    usesHint: "Hypertension, angina (calcium-channel blocker)",
    nlemCeilingPerUnit: 1.09,
    janAushadhi: { packSize: 10, packPrice: 10.3, perUnit: 1.03, drugCode: "JA6001", source: JA_SOURCE, verified: V },
    brands: [
      { brand: "Amlong 5", manufacturer: "Micro Labs", packSize: 10, packPrice: 37.5, perUnit: 3.75, mrp: true, source: BRAND_SOURCE, verified: V2 },
      { brand: "Amlodac 5", manufacturer: "Zydus", packSize: 10, packPrice: 24.0, perUnit: 2.4, mrp: true, source: BRAND_SOURCE, verified: V2 },
    ],
    aliases: ["amlong", "amlodac", "amlodipine besylate", "amlip 5"],
  },
  {
    id: "amlodipine-10", generic: "Amlodipine", composition: "Amlodipine 10 mg",
    salts: ["amlodipine"], strength: "10 mg", strengthValue: 10, strengthUnit: "mg",
    form: "Tablet", category: "BP & Heart", rx: true, schedule: "Schedule H",
    usesHint: "Hypertension, angina",
    nlemCeilingPerUnit: 1.69,
    janAushadhi: { packSize: 10, packPrice: 16.9, perUnit: 1.69, drugCode: "JA6002", source: JA_SOURCE, verified: V },
    brands: [
      { brand: "Amlong 10", manufacturer: "Micro Labs", packSize: 10, packPrice: 64.0, perUnit: 6.4, mrp: true, source: BRAND_SOURCE, verified: V2 },
      { brand: "Amlip 10", manufacturer: "Cipla", packSize: 10, packPrice: 52.0, perUnit: 5.2, mrp: true, source: BRAND_SOURCE, verified: V2 },
    ],
    aliases: ["amlong 10", "amlip 10"],
  },
  {
    id: "telmisartan-40", generic: "Telmisartan", composition: "Telmisartan 40 mg",
    salts: ["telmisartan"], strength: "40 mg", strengthValue: 40, strengthUnit: "mg",
    form: "Tablet", category: "BP & Heart", rx: true, schedule: "Schedule H",
    usesHint: "Hypertension (ARB) — often prescribed as single pill",
    nlemCeilingPerUnit: 2.28,
    janAushadhi: { packSize: 10, packPrice: 22.8, perUnit: 2.28, drugCode: "JA6011", source: JA_SOURCE, verified: V },
    brands: [
      { brand: "Telma 40", manufacturer: "Glenmark", packSize: 15, packPrice: 139.5, perUnit: 9.3, mrp: true, source: BRAND_SOURCE, verified: V2 },
      { brand: "Telmikind 40", manufacturer: "Mankind", packSize: 10, packPrice: 88.0, perUnit: 8.8, mrp: true, source: BRAND_SOURCE, verified: V2 },
    ],
    aliases: ["telma", "telmikind", "telmisartan 40"],
  },
  {
    id: "telmisartan-amlodipine", generic: "Telmisartan + Amlodipine", composition: "Telmisartan 40 mg + Amlodipine 5 mg",
    salts: ["telmisartan", "amlodipine"], strength: "40/5 mg", strengthValue: 40, strengthUnit: "mg",
    form: "Tablet", category: "BP & Heart", rx: true, schedule: "Schedule H",
    usesHint: "Hypertension — two BP medicines in one pill",
    nlemCeilingPerUnit: null,
    janAushadhi: { packSize: 15, packPrice: 45.0, perUnit: 3.0, drugCode: "JA6018", source: JA_SOURCE, verified: V },
    brands: [
      { brand: "Telma-AM", manufacturer: "Glenmark", packSize: 15, packPrice: 168.0, perUnit: 11.2, mrp: true, source: BRAND_SOURCE, verified: V2 },
      { brand: "Telmikind-AM", manufacturer: "Mankind", packSize: 10, packPrice: 98.0, perUnit: 9.8, mrp: true, source: BRAND_SOURCE, verified: V2 },
    ],
    aliases: ["telma am", "telmikind am", "telmisartan telma-am"],
  },
  {
    id: "metoprolol-25", generic: "Metoprolol Succinate", composition: "Metoprolol Succinate ER 25 mg",
    salts: ["metoprolol"], strength: "25 mg", strengthValue: 25, strengthUnit: "mg",
    form: "Tablet", category: "BP & Heart", rx: true, schedule: "Schedule H",
    usesHint: "Hypertension, heart failure, angina (extended-release beta-blocker)",
    nlemCeilingPerUnit: 2.26,
    janAushadhi: { packSize: 10, packPrice: 18.6, perUnit: 1.86, drugCode: "JA6022", source: JA_SOURCE, verified: V },
    brands: [
      { brand: "Betaloc-ZOK 25", manufacturer: "AstraZeneca", packSize: 14, packPrice: 112.0, perUnit: 8.0, mrp: true, source: BRAND_SOURCE, verified: V2 },
      { brand: "Metolar-XR 25", manufacturer: "Cipla", packSize: 10, packPrice: 57.0, perUnit: 5.7, mrp: true, source: BRAND_SOURCE, verified: V2 },
    ],
    aliases: ["betaloc zok", "metolar xr", "metoprolol succinate"],
  },
  {
    id: "ramipril-5", generic: "Ramipril", composition: "Ramipril 5 mg",
    salts: ["ramipril"], strength: "5 mg", strengthValue: 5, strengthUnit: "mg",
    form: "Tablet", category: "BP & Heart", rx: true, schedule: "Schedule H",
    usesHint: "Hypertension, heart protection in diabetes (ACE inhibitor)",
    nlemCeilingPerUnit: 2.5,
    janAushadhi: { packSize: 10, packPrice: 14.0, perUnit: 1.4, drugCode: "JA6031", source: JA_SOURCE, verified: V },
    brands: [
      { brand: "Cardace 5", manufacturer: "Sanofi", packSize: 30, packPrice: 120.0, perUnit: 4.0, mrp: true, source: BRAND_SOURCE, verified: V2 },
    ],
    aliases: ["cardace", "ramipril 5"],
  },
  {
    id: "atorvastatin-10", generic: "Atorvastatin", composition: "Atorvastatin 10 mg",
    salts: ["atorvastatin"], strength: "10 mg", strengthValue: 10, strengthUnit: "mg",
    form: "Tablet", category: "Cholesterol", rx: true, schedule: "Schedule H",
    usesHint: "High cholesterol, heart-attack prevention (statin)",
    nlemCeilingPerUnit: 2.23,
    janAushadhi: { packSize: 10, packPrice: 19.7, perUnit: 1.97, drugCode: "JA5001", source: JA_SOURCE, verified: V },
    brands: [
      { brand: "Atorva 10", manufacturer: "Zydus", packSize: 10, packPrice: 61.0, perUnit: 6.1, mrp: true, source: BRAND_SOURCE, verified: V2 },
      { brand: "Lipvas 10", manufacturer: "Cipla", packSize: 10, packPrice: 55.0, perUnit: 5.5, mrp: true, source: BRAND_SOURCE, verified: V2 },
      { brand: "Tonact 10", manufacturer: "Lupin", packSize: 10, packPrice: 60.0, perUnit: 6.0, mrp: true, source: BRAND_SOURCE, verified: V2 },
    ],
    aliases: ["atorva", "lipvas", "tonact", "lipitor", "atorvastatin 10"],
  },
  {
    id: "atorvastatin-20", generic: "Atorvastatin", composition: "Atorvastatin 20 mg",
    salts: ["atorvastatin"], strength: "20 mg", strengthValue: 20, strengthUnit: "mg",
    form: "Tablet", category: "Cholesterol", rx: true, schedule: "Schedule H",
    usesHint: "High cholesterol",
    nlemCeilingPerUnit: 3.67,
    janAushadhi: { packSize: 10, packPrice: 22.4, perUnit: 2.24, drugCode: "JA5002", source: JA_SOURCE, verified: V },
    brands: [
      { brand: "Tonact 20", manufacturer: "Lupin", packSize: 10, packPrice: 105.0, perUnit: 10.5, mrp: true, source: BRAND_SOURCE, verified: V2 },
      { brand: "Lipivas 20", manufacturer: "Cipla", packSize: 10, packPrice: 88.0, perUnit: 8.8, mrp: true, source: BRAND_SOURCE, verified: V2 },
    ],
    aliases: ["tonact 20", "atorvastatin 20"],
  },
  {
    id: "rosuvastatin-10", generic: "Rosuvastatin", composition: "Rosuvastatin 10 mg",
    salts: ["rosuvastatin"], strength: "10 mg", strengthValue: 10, strengthUnit: "mg",
    form: "Tablet", category: "Cholesterol", rx: true, schedule: "Schedule H",
    usesHint: "High cholesterol (statin)",
    nlemCeilingPerUnit: null,
    janAushadhi: { packSize: 10, packPrice: 25.0, perUnit: 2.5, drugCode: "JA5007", source: JA_SOURCE, verified: V },
    brands: [
      { brand: "Rosuvas 10", manufacturer: "Sun Pharma", packSize: 10, packPrice: 118.0, perUnit: 11.8, mrp: true, source: BRAND_SOURCE, verified: V2 },
      { brand: "Rozat 10", manufacturer: "Sun Pharma", packSize: 10, packPrice: 105.0, perUnit: 10.5, mrp: true, source: BRAND_SOURCE, verified: V2 },
    ],
    aliases: ["rosuvas", "rozat", "rosuvastatin 10"],
  },
  {
    id: "clopidogrel-75", generic: "Clopidogrel", composition: "Clopidogrel 75 mg",
    salts: ["clopidogrel"], strength: "75 mg", strengthValue: 75, strengthUnit: "mg",
    form: "Tablet", category: "BP & Heart", rx: true, schedule: "Schedule H",
    usesHint: "Prevents blood clots after stent / stroke (anti-platelet)",
    nlemCeilingPerUnit: 5.14,
    janAushadhi: { packSize: 10, packPrice: 33.2, perUnit: 3.32, drugCode: "JA6041", source: JA_SOURCE, verified: V },
    brands: [
      { brand: "Clopilet 75", manufacturer: "Sun Pharma", packSize: 15, packPrice: 121.5, perUnit: 8.1, mrp: true, source: BRAND_SOURCE, verified: V2 },
      { brand: "Deplatt 75", manufacturer: "Torrent", packSize: 15, packPrice: 112.5, perUnit: 7.5, mrp: true, source: BRAND_SOURCE, verified: V2 },
    ],
    aliases: ["deplatt", "clopilet", "plavix", "clopidogrel 75"],
  },
  {
    id: "aspirin-75", generic: "Aspirin", composition: "Aspirin 75 mg (low-dose)",
    salts: ["aspirin", "acetylsalicylic acid"], strength: "75 mg", strengthValue: 75, strengthUnit: "mg",
    form: "Tablet", category: "BP & Heart", rx: false, schedule: "OTC",
    usesHint: "Heart-attack and stroke prevention (low-dose anti-platelet)",
    nlemCeilingPerUnit: 0.29,
    janAushadhi: { packSize: 10, packPrice: 2.4, perUnit: 0.24, drugCode: "JA6045", source: JA_SOURCE, verified: V },
    brands: [
      { brand: "Ecosprin 75", manufacturer: "USV", packSize: 14, packPrice: 5.6, perUnit: 0.4, mrp: true, source: BRAND_SOURCE, verified: V2 },
    ],
    aliases: ["ecosprin", "aspirin low dose", "disprin"],
  },

  // ── Diabetes ─────────────────────────────────────────────────────────────
  {
    id: "metformin-500", generic: "Metformin", composition: "Metformin 500 mg",
    salts: ["metformin"], strength: "500 mg", strengthValue: 500, strengthUnit: "mg",
    form: "Tablet", category: "Diabetes", rx: true, schedule: "Schedule H",
    usesHint: "Type-2 diabetes, PCOS",
    nlemCeilingPerUnit: 1.92,
    janAushadhi: { packSize: 10, packPrice: 4.6, perUnit: 0.46, drugCode: "JA7001", source: JA_SOURCE, verified: V },
    brands: [
      { brand: "Glycomet 500", manufacturer: "USV", packSize: 20, packPrice: 24.0, perUnit: 1.2, mrp: true, source: BRAND_SOURCE, verified: V2 },
      { brand: "Obimet 500", manufacturer: "Franco-Indian", packSize: 10, packPrice: 23.0, perUnit: 2.3, mrp: true, source: BRAND_SOURCE, verified: V2 },
    ],
    aliases: ["glycomet", "obimet", "metformin hcl"],
  },
  {
    id: "metformin-1000", generic: "Metformin", composition: "Metformin 1000 mg",
    salts: ["metformin"], strength: "1000 mg", strengthValue: 1000, strengthUnit: "mg",
    form: "Tablet", category: "Diabetes", rx: true, schedule: "Schedule H",
    usesHint: "Type-2 diabetes",
    nlemCeilingPerUnit: null,
    janAushadhi: { packSize: 10, packPrice: 8.0, perUnit: 0.8, drugCode: "JA7003", source: JA_SOURCE, verified: V },
    brands: [
      { brand: "Glycomet 1000", manufacturer: "USV", packSize: 20, packPrice: 50.0, perUnit: 2.5, mrp: true, source: BRAND_SOURCE, verified: V2 },
      { brand: "Cetapin 1000", manufacturer: "Cipla", packSize: 10, packPrice: 32.0, perUnit: 3.2, mrp: true, source: BRAND_SOURCE, verified: V2 },
    ],
    aliases: ["cetapin 1000", "glycomet 1000", "metformin 1g"],
  },
  {
    id: "glimepiride-1", generic: "Glimepiride", composition: "Glimepiride 1 mg",
    salts: ["glimepiride"], strength: "1 mg", strengthValue: 1, strengthUnit: "mg",
    form: "Tablet", category: "Diabetes", rx: true, schedule: "Schedule H",
    usesHint: "Type-2 diabetes (sulphonylurea)",
    nlemCeilingPerUnit: 2.14,
    janAushadhi: { packSize: 10, packPrice: 20.0, perUnit: 2.0, drugCode: "JA7011", source: JA_SOURCE, verified: V },
    brands: [
      { brand: "Amaryl 1", manufacturer: "Sanofi", packSize: 15, packPrice: 96.0, perUnit: 6.4, mrp: true, source: BRAND_SOURCE, verified: V2 },
    ],
    aliases: ["amaryl 1", "glimisave", "glimestar 1"],
  },
  {
    id: "glimepiride-metformin", generic: "Glimepiride + Metformin", composition: "Glimepiride 2 mg + Metformin 500 mg SR",
    salts: ["glimepiride", "metformin"], strength: "2/500 mg", strengthValue: 2, strengthUnit: "mg",
    form: "Tablet", category: "Diabetes", rx: true, schedule: "Schedule H",
    usesHint: "Type-2 diabetes — the classic combination pill",
    nlemCeilingPerUnit: null,
    janAushadhi: { packSize: 15, packPrice: 42.0, perUnit: 2.8, drugCode: "JA7018", source: JA_SOURCE, verified: V },
    brands: [
      { brand: "Glycomet-GP 2", manufacturer: "USV", packSize: 20, packPrice: 116.0, perUnit: 5.8, mrp: true, source: BRAND_SOURCE, verified: V2 },
      { brand: "Amaryl-M 2", manufacturer: "Sanofi", packSize: 15, packPrice: 140.0, perUnit: 9.33, mrp: true, source: BRAND_SOURCE, verified: V2 },
      { brand: "Glimisave M2", manufacturer: "Mankind", packSize: 15, packPrice: 105.0, perUnit: 7.0, mrp: true, source: BRAND_SOURCE, verified: V2 },
    ],
    aliases: ["glycomet gp 2", "amaryl m", "glimisave m2", "glimepiride metformin"],
  },
  {
    id: "voglibose-0.2", generic: "Voglibose", composition: "Voglibose 0.2 mg",
    salts: ["voglibose"], strength: "0.2 mg", strengthValue: 0.2, strengthUnit: "mg",
    form: "Tablet", category: "Diabetes", rx: true, schedule: "Schedule H",
    usesHint: "Post-meal blood-sugar spikes",
    nlemCeilingPerUnit: null,
    janAushadhi: { packSize: 10, packPrice: 28.0, perUnit: 2.8, drugCode: "JA7025", source: JA_SOURCE, verified: V },
    brands: [
      { brand: "Volix 0.2", manufacturer: "Sun Pharma", packSize: 10, packPrice: 82.0, perUnit: 8.2, mrp: true, source: BRAND_SOURCE, verified: V2 },
    ],
    aliases: ["volix", "voglibose 0.2"],
  },

  // ── Stomach / digestion ──────────────────────────────────────────────────
  {
    id: "pantoprazole-40", generic: "Pantoprazole", composition: "Pantoprazole 40 mg",
    salts: ["pantoprazole"], strength: "40 mg", strengthValue: 40, strengthUnit: "mg",
    form: "Tablet", category: "Stomach & Digestion", rx: true, schedule: "Schedule H",
    usesHint: "Acidity, heartburn, gastric ulcer",
    nlemCeilingPerUnit: 5.06,
    janAushadhi: { packSize: 10, packPrice: 16.8, perUnit: 1.68, drugCode: "JA8001", source: JA_SOURCE, verified: V },
    brands: [
      { brand: "Pan 40", manufacturer: "Alkem", packSize: 15, packPrice: 88.5, perUnit: 5.9, mrp: true, source: BRAND_SOURCE, verified: V2 },
      { brand: "Pantocid 40", manufacturer: "Sun Pharma", packSize: 15, packPrice: 93.0, perUnit: 6.2, mrp: true, source: BRAND_SOURCE, verified: V2 },
      { brand: "Pantop 40", manufacturer: "Aristo", packSize: 15, packPrice: 79.5, perUnit: 5.3, mrp: true, source: BRAND_SOURCE, verified: V2 },
    ],
    aliases: ["pantocid", "pantop", "pan 40", "pantoprazole 40"],
  },
  {
    id: "pantoprazole-domperidone", generic: "Pantoprazole + Domperidone", composition: "Pantoprazole 40 mg + Domperidone 30 mg SR",
    salts: ["pantoprazole", "domperidone"], strength: "40/30 mg", strengthValue: 40, strengthUnit: "mg",
    form: "Capsule", category: "Stomach & Digestion", rx: true, schedule: "Schedule H",
    usesHint: "Acidity with nausea/bloating",
    nlemCeilingPerUnit: null,
    janAushadhi: { packSize: 10, packPrice: 22.0, perUnit: 2.2, drugCode: "JA8008", source: JA_SOURCE, verified: V },
    brands: [
      { brand: "Pan-D", manufacturer: "Alkem", packSize: 15, packPrice: 147.0, perUnit: 9.8, mrp: true, source: BRAND_SOURCE, verified: V2 },
      { brand: "Pantocid DSR", manufacturer: "Sun Pharma", packSize: 15, packPrice: 150.0, perUnit: 10.0, mrp: true, source: BRAND_SOURCE, verified: V2 },
    ],
    aliases: ["pan d", "pan-d", "pantocid dsr", "pantop dsr"],
  },
  {
    id: "omeprazole-20", generic: "Omeprazole", composition: "Omeprazole 20 mg",
    salts: ["omeprazole"], strength: "20 mg", strengthValue: 20, strengthUnit: "mg",
    form: "Capsule", category: "Stomach & Digestion", rx: true, schedule: "Schedule H",
    usesHint: "Acidity, heartburn",
    nlemCeilingPerUnit: 2.21,
    janAushadhi: { packSize: 10, packPrice: 8.5, perUnit: 0.85, drugCode: "JA8012", source: JA_SOURCE, verified: V },
    brands: [
      { brand: "Omez 20", manufacturer: "Dr Reddy's", packSize: 10, packPrice: 32.0, perUnit: 3.2, mrp: true, source: BRAND_SOURCE, verified: V2 },
    ],
    aliases: ["omez", "omeprazole 20"],
  },
  {
    id: "ranitidine-150", generic: "Ranitidine (legacy)", composition: "Ranitidine 150 mg",
    salts: ["ranitidine"], strength: "150 mg", strengthValue: 150, strengthUnit: "mg",
    form: "Tablet", category: "Stomach & Digestion", rx: false, schedule: "OTC",
    usesHint: "Acidity (note: withdrawn in several markets; ask your doctor)",
    nlemCeilingPerUnit: 1.44,
    janAushadhi: { packSize: 15, packPrice: 6.0, perUnit: 0.4, drugCode: "JA8101", source: JA_SOURCE, verified: V },
    brands: [
      { brand: "Aciloc 150", manufacturer: "Cadila", packSize: 15, packPrice: 30.0, perUnit: 2.0, mrp: true, source: BRAND_SOURCE, verified: V2 },
    ],
    aliases: ["aciloc", "rantac", "ranitidine 150"],
  },
  {
    id: "ondansetron-4", generic: "Ondansetron", composition: "Ondansetron 4 mg",
    salts: ["ondansetron"], strength: "4 mg", strengthValue: 4, strengthUnit: "mg",
    form: "Tablet", category: "Stomach & Digestion", rx: true, schedule: "Schedule H",
    usesHint: "Nausea and vomiting (antiemetic)",
    nlemCeilingPerUnit: 2.84,
    janAushadhi: { packSize: 10, packPrice: 18.0, perUnit: 1.8, drugCode: "JA8201", source: JA_SOURCE, verified: V },
    brands: [
      { brand: "Emeset 4", manufacturer: "Cipla", packSize: 10, packPrice: 50.0, perUnit: 5.0, mrp: true, source: BRAND_SOURCE, verified: V2 },
    ],
    aliases: ["emeset", "ondan 4", "vomikind"],
  },
  {
    id: "ors-sachets", generic: "ORS", composition: "Oral Rehydration Salts (WHO formula)",
    salts: ["ors", "oral rehydration", "electrolytes"], strength: "20.5 g sachet", strengthValue: 20.5, strengthUnit: "g",
    form: "Sachet", category: "Stomach & Digestion", rx: false, schedule: "OTC",
    usesHint: "Dehydration from diarrhoea/vomiting — dissolve in 1 L clean water",
    nlemCeilingPerUnit: 22.0,
    janAushadhi: { packSize: 21, packPrice: 90.3, perUnit: 4.3, drugCode: "JA8301", source: JA_SOURCE, verified: V },
    brands: [
      { brand: "Electral", manufacturer: "FDC", packSize: 21, packPrice: 210.0, perUnit: 10.0, mrp: true, source: BRAND_SOURCE, verified: V2 },
    ],
    aliases: ["electral", "ors sachets", "oral rehydration salts"],
  },

  // ── Allergy / cold / respiratory ─────────────────────────────────────────
  {
    id: "cetirizine-10", generic: "Cetirizine", composition: "Cetirizine 10 mg",
    salts: ["cetirizine"], strength: "10 mg", strengthValue: 10, strengthUnit: "mg",
    form: "Tablet", category: "Allergy & Cold", rx: false, schedule: "OTC",
    usesHint: "Allergic rhinitis, sneezing, itching, hives",
    nlemCeilingPerUnit: 0.34,
    janAushadhi: { packSize: 10, packPrice: 2.5, perUnit: 0.25, drugCode: "JA9001", source: JA_SOURCE, verified: V },
    brands: [
      { brand: "Cetzine", manufacturer: "Cipla", packSize: 10, packPrice: 18.7, perUnit: 1.87, mrp: true, source: BRAND_SOURCE, verified: V2 },
      { brand: "Okacet", manufacturer: "IPCA", packSize: 10, packPrice: 16.0, perUnit: 1.6, mrp: true, source: BRAND_SOURCE, verified: V2 },
    ],
    aliases: ["okacet", "cetzine", "cetirizine 10"],
  },
  {
    id: "levocetirizine-5", generic: "Levocetirizine", composition: "Levocetirizine 5 mg",
    salts: ["levocetirizine"], strength: "5 mg", strengthValue: 5, strengthUnit: "mg",
    form: "Tablet", category: "Allergy & Cold", rx: false, schedule: "OTC",
    usesHint: "Allergic rhinitis, hives (less-drowsy antihistamine)",
    nlemCeilingPerUnit: null,
    janAushadhi: { packSize: 10, packPrice: 6.0, perUnit: 0.6, drugCode: "JA9004", source: JA_SOURCE, verified: V },
    brands: [
      { brand: "Levorid 5", manufacturer: "Cipla", packSize: 10, packPrice: 35.0, perUnit: 3.5, mrp: true, source: BRAND_SOURCE, verified: V2 },
      { brand: "Levosiz 5", manufacturer: "Cipla", packSize: 10, packPrice: 38.0, perUnit: 3.8, mrp: true, source: BRAND_SOURCE, verified: V2 },
    ],
    aliases: ["levosiz", "levorid", "levocetrizine", "levocetirizine 5"],
  },
  {
    id: "montelukast-10", generic: "Montelukast", composition: "Montelukast 10 mg",
    salts: ["montelukast"], strength: "10 mg", strengthValue: 10, strengthUnit: "mg",
    form: "Tablet", category: "Allergy & Cold", rx: true, schedule: "Schedule H",
    usesHint: "Allergic rhinitis, asthma prevention",
    nlemCeilingPerUnit: null,
    janAushadhi: { packSize: 10, packPrice: 18.0, perUnit: 1.8, drugCode: "JA9012", source: JA_SOURCE, verified: V },
    brands: [
      { brand: "Montek 10", manufacturer: "Sun Pharma", packSize: 15, packPrice: 120.0, perUnit: 8.0, mrp: true, source: BRAND_SOURCE, verified: V2 },
      { brand: "Monticope", manufacturer: "Lupin", packSize: 15, packPrice: 105.0, perUnit: 7.0, mrp: true, source: BRAND_SOURCE, verified: V2 },
    ],
    aliases: ["montek", "montair", "montelukast 10"],
  },
  {
    id: "montelukast-levocetirizine", generic: "Montelukast + Levocetirizine", composition: "Montelukast 10 mg + Levocetirizine 5 mg",
    salts: ["montelukast", "levocetirizine"], strength: "10/5 mg", strengthValue: 10, strengthUnit: "mg",
    form: "Tablet", category: "Allergy & Cold", rx: true, schedule: "Schedule H",
    usesHint: "Allergic rhinitis with breathing symptoms",
    nlemCeilingPerUnit: null,
    janAushadhi: { packSize: 15, packPrice: 30.0, perUnit: 2.0, drugCode: "JA9015", source: JA_SOURCE, verified: V },
    brands: [
      { brand: "Montek-LC", manufacturer: "Sun Pharma", packSize: 15, packPrice: 190.5, perUnit: 12.7, mrp: true, source: BRAND_SOURCE, verified: V2 },
      { brand: "Monticope-LC", manufacturer: "Lupin", packSize: 15, packPrice: 165.0, perUnit: 11.0, mrp: true, source: BRAND_SOURCE, verified: V2 },
    ],
    aliases: ["montek lc", "monticope lc", "montek-lc tablet"],
  },
  {
    id: "salbutamol-inhaler", generic: "Salbutamol", composition: "Salbutamol 100 mcg/dose inhaler (200 MDI)",
    salts: ["salbutamol", "albuterol"], strength: "100 mcg/dose", strengthValue: 100, strengthUnit: "mcg",
    form: "Inhaler", category: "Breathing & Asthma", rx: true, schedule: "Schedule H",
    usesHint: "Asthma/wheeze relief — reliever inhaler",
    nlemCeilingPerUnit: 85.0,
    janAushadhi: { packSize: 1, packPrice: 64.0, perUnit: 64.0, drugCode: "JA9501", source: JA_SOURCE, verified: V },
    brands: [
      { brand: "Asthalin", manufacturer: "Cipla", packSize: 1, packPrice: 165.0, perUnit: 165.0, mrp: true, source: BRAND_SOURCE, verified: V2 },
    ],
    aliases: ["asthalin", "salbair", "albuterol inhaler", "salbutamol inhaler"],
  },
  {
    id: "budesonide-formoterol-inhaler", generic: "Budesonide + Formoterol", composition: "Budesonide 200 mcg + Formoterol 6 mcg inhaler",
    salts: ["budesonide", "formoterol"], strength: "200/6 mcg", strengthValue: 200, strengthUnit: "mcg",
    form: "Inhaler", category: "Breathing & Asthma", rx: true, schedule: "Schedule H",
    usesHint: "Long-term asthma/COPD control — controller inhaler",
    nlemCeilingPerUnit: null,
    janAushadhi: { packSize: 1, packPrice: 155.0, perUnit: 155.0, drugCode: "JA9510", source: JA_SOURCE, verified: V },
    brands: [
      { brand: "Foracort 200", manufacturer: "Cipla", packSize: 1, packPrice: 420.0, perUnit: 420.0, mrp: true, source: BRAND_SOURCE, verified: V2 },
      { brand: "Budesonide+Formoterol", manufacturer: "Sun Pharma", packSize: 1, packPrice: 380.0, perUnit: 380.0, mrp: true, source: BRAND_SOURCE, verified: V2 },
    ],
    aliases: ["foracort", "budamate", "budecort formoterol"],
  },
  {
    id: "azithromycin-500", generic: "Azithromycin", composition: "Azithromycin 500 mg",
    salts: ["azithromycin"], strength: "500 mg", strengthValue: 500, strengthUnit: "mg",
    form: "Tablet", category: "Antibiotic", rx: true, schedule: "Schedule H1",
    usesHint: "Bacterial infections — throat, chest, skin (antibiotic). Complete the full course.",
    nlemCeilingPerUnit: 10.7,
    janAushadhi: { packSize: 3, packPrice: 9.6, perUnit: 3.2, drugCode: "JA4701", source: JA_SOURCE, verified: V },
    brands: [
      { brand: "Azithral 500", manufacturer: "Alembic", packSize: 3, packPrice: 119.0, perUnit: 39.67, mrp: true, source: BRAND_SOURCE, verified: V2 },
      { brand: "Azee 500", manufacturer: "Cipla", packSize: 3, packPrice: 110.5, perUnit: 36.83, mrp: true, source: BRAND_SOURCE, verified: V2 },
    ],
    aliases: ["azee", "azithral", "azithromycin 500"],
  },
  {
    id: "amoxicillin-500", generic: "Amoxicillin", composition: "Amoxicillin 500 mg",
    salts: ["amoxicillin"], strength: "500 mg", strengthValue: 500, strengthUnit: "mg",
    form: "Capsule", category: "Antibiotic", rx: true, schedule: "Schedule H1",
    usesHint: "Bacterial infections (antibiotic)",
    nlemCeilingPerUnit: 4.73,
    janAushadhi: { packSize: 10, packPrice: 16.0, perUnit: 1.6, drugCode: "JA4705", source: JA_SOURCE, verified: V },
    brands: [
      { brand: "Novamox 500", manufacturer: "Cipla", packSize: 10, packPrice: 88.0, perUnit: 8.8, mrp: true, source: BRAND_SOURCE, verified: V2 },
      { brand: "Mox 500", manufacturer: "Ranbaxy", packSize: 10, packPrice: 82.0, perUnit: 8.2, mrp: true, source: BRAND_SOURCE, verified: V2 },
    ],
    aliases: ["novamox", "mox 500", "amoxicillin 500"],
  },
  {
    id: "amoxicillin-clavulanate", generic: "Amoxicillin + Clavulanic Acid", composition: "Amoxicillin 500 mg + Clavulanic Acid 125 mg",
    salts: ["amoxicillin", "clavulanic acid", "clavulanate"], strength: "500/125 mg", strengthValue: 500, strengthUnit: "mg",
    form: "Tablet", category: "Antibiotic", rx: true, schedule: "Schedule H1",
    usesHint: "Resistant bacterial infections (antibiotic)",
    nlemCeilingPerUnit: 18.1,
    janAushadhi: { packSize: 10, packPrice: 52.0, perUnit: 5.2, drugCode: "JA4710", source: JA_SOURCE, verified: V },
    brands: [
      { brand: "Augmentin 625", manufacturer: "GSK", packSize: 10, packPrice: 170.0, perUnit: 17.0, mrp: true, source: BRAND_SOURCE, verified: V2 },
      { brand: "Clavam 625", manufacturer: "Alkem", packSize: 10, packPrice: 155.0, perUnit: 15.5, mrp: true, source: BRAND_SOURCE, verified: V2 },
    ],
    aliases: ["augmentin 625", "clavam 625", "amoxiclav"],
  },

  // ── Vitamins / minerals ──────────────────────────────────────────────────
  {
    id: "calcium-vitamin-d3", generic: "Calcium + Vitamin D3", composition: "Calcium Carbonate 500 mg + Vitamin D3 250 IU",
    salts: ["calcium", "vitamin d3", "cholecalciferol"], strength: "500 mg/250 IU", strengthValue: 500, strengthUnit: "mg",
    form: "Tablet", category: "Vitamins & Minerals", rx: false, schedule: "OTC",
    usesHint: "Bone health, calcium deficiency",
    nlemCeilingPerUnit: 3.0,
    janAushadhi: { packSize: 15, packPrice: 17.0, perUnit: 1.13, drugCode: "JA1001", source: JA_SOURCE, verified: V },
    brands: [
      { brand: "Shelcal 500", manufacturer: "Torrent", packSize: 15, packPrice: 105.0, perUnit: 7.0, mrp: true, source: BRAND_SOURCE, verified: V2 },
      { brand: "Calcimax 500", manufacturer: "Cipla", packSize: 15, packPrice: 78.0, perUnit: 5.2, mrp: true, source: BRAND_SOURCE, verified: V2 },
    ],
    aliases: ["shelcal", "calcimax", "calcium tablets", "vitamin d3 calcium"],
  },
  {
    id: "vitamin-d3-60000", generic: "Vitamin D3", composition: "Cholecalciferol 60,000 IU (weekly)",
    salts: ["vitamin d3", "cholecalciferol"], strength: "60,000 IU", strengthValue: 60000, strengthUnit: "IU",
    form: "Capsule", category: "Vitamins & Minerals", rx: true, schedule: "Schedule H",
    usesHint: "Vitamin-D deficiency (weekly dose)",
    nlemCeilingPerUnit: 9.5,
    janAushadhi: { packSize: 4, packPrice: 12.0, perUnit: 3.0, drugCode: "JA1005", source: JA_SOURCE, verified: V },
    brands: [
      { brand: "Uprise-D3 60K", manufacturer: "Alkem", packSize: 4, packPrice: 88.0, perUnit: 22.0, mrp: true, source: BRAND_SOURCE, verified: V2 },
      { brand: "D-Rise 60K", manufacturer: "USV", packSize: 4, packPrice: 82.0, perUnit: 20.5, mrp: true, source: BRAND_SOURCE, verified: V2 },
    ],
    aliases: ["uprise d3", "d rise", "cholecalciferol 60000"],
  },
  {
    id: "b-complex", generic: "Vitamin B-Complex", composition: "Vitamin B-Complex (B1, B2, B6, B12, Niacinamide, Folic Acid)",
    salts: ["b complex", "vitamin b", "becosule"], strength: "—", strengthValue: 1, strengthUnit: "tab",
    form: "Capsule", category: "Vitamins & Minerals", rx: false, schedule: "OTC",
    usesHint: "Weakness, mouth ulcers, nerve-vitamin support",
    nlemCeilingPerUnit: 2.0,
    janAushadhi: { packSize: 10, packPrice: 5.0, perUnit: 0.5, drugCode: "JA1010", source: JA_SOURCE, verified: V },
    brands: [
      { brand: "Becosule", manufacturer: "Pfizer", packSize: 10, packPrice: 36.0, perUnit: 3.6, mrp: true, source: BRAND_SOURCE, verified: V2 },
      { brand: "Neurobion RF", manufacturer: "Procter & Gamble", packSize: 30, packPrice: 74.4, perUnit: 2.48, mrp: true, source: BRAND_SOURCE, verified: V2 },
    ],
    aliases: ["becosule", "becosules", "neurobion rf", "b1 b6 b12"],
  },
  {
    id: "iron-folic-acid", generic: "Iron + Folic Acid", composition: "Ferrous Ascorbate 100 mg + Folic Acid 1.5 mg",
    salts: ["iron", "folic acid", "ferrous", "ascorbate"], strength: "100/1.5 mg", strengthValue: 100, strengthUnit: "mg",
    form: "Tablet", category: "Vitamins & Minerals", rx: false, schedule: "OTC",
    usesHint: "Anaemia, pregnancy supplement (as advised by doctor)",
    nlemCeilingPerUnit: null,
    janAushadhi: { packSize: 30, packPrice: 9.0, perUnit: 0.3, drugCode: "JA1015", source: JA_SOURCE, verified: V },
    brands: [
      { brand: "Orofer XT", manufacturer: "Cipla", packSize: 15, packPrice: 132.0, perUnit: 8.8, mrp: true, source: BRAND_SOURCE, verified: V2 },
      { brand: "Autrin", manufacturer: "Alembic", packSize: 30, packPrice: 88.0, perUnit: 2.93, mrp: true, source: BRAND_SOURCE, verified: V2 },
    ],
    aliases: ["orofer xt", "autrin", "iron tablets", "folic acid tablets"],
  },
  {
    id: "multivitamin", generic: "Multivitamin", composition: "Multivitamin + Multimineral (A, B-complex, C, D, E + zinc)",
    salts: ["multivitamin", "multimineral", "zifi"], strength: "—", strengthValue: 1, strengthUnit: "tab",
    form: "Tablet", category: "Vitamins & Minerals", rx: false, schedule: "OTC",
    usesHint: "General nutritional supplement",
    nlemCeilingPerUnit: null,
    janAushadhi: { packSize: 30, packPrice: 21.0, perUnit: 0.7, drugCode: "JA1020", source: JA_SOURCE, verified: V },
    brands: [
      { brand: "Zincovit", manufacturer: "Apex", packSize: 15, packPrice: 112.5, perUnit: 7.5, mrp: true, source: BRAND_SOURCE, verified: V2 },
      { brand: "Revital", manufacturer: "Sun Pharma", packSize: 10, packPrice: 120.0, perUnit: 12.0, mrp: true, source: BRAND_SOURCE, verified: V2 },
    ],
    aliases: ["zincovit", "revital", "multivitamin tablets", "zifi"],
  },

  // ── Thyroid / hormones ───────────────────────────────────────────────────
  {
    id: "thyroxine-50", generic: "Levothyroxine", composition: "Levothyroxine 50 mcg",
    salts: ["levothyroxine", "thyroxine", "eltroxin"], strength: "50 mcg", strengthValue: 50, strengthUnit: "mcg",
    form: "Tablet", category: "Thyroid & Hormones", rx: true, schedule: "Schedule H",
    usesHint: "Hypothyroidism — take on empty stomach, same time daily",
    nlemCeilingPerUnit: 1.82,
    janAushadhi: { packSize: 10, packPrice: 9.5, perUnit: 0.95, drugCode: "JA1101", source: JA_SOURCE, verified: V },
    brands: [
      { brand: "Thyronorm 50", manufacturer: "Abbott", packSize: 15, packPrice: 58.5, perUnit: 3.9, mrp: true, source: BRAND_SOURCE, verified: V2 },
      { brand: "Thyrox 50", manufacturer: "Cipla", packSize: 15, packPrice: 36.0, perUnit: 2.4, mrp: true, source: BRAND_SOURCE, verified: V2 },
    ],
    aliases: ["thyronorm", "thyrox", "eltroxin", "levothyroxine 50"],
  },
  {
    id: "thyroxine-100", generic: "Levothyroxine", composition: "Levothyroxine 100 mcg",
    salts: ["levothyroxine", "thyroxine"], strength: "100 mcg", strengthValue: 100, strengthUnit: "mcg",
    form: "Tablet", category: "Thyroid & Hormones", rx: true, schedule: "Schedule H",
    usesHint: "Hypothyroidism",
    nlemCeilingPerUnit: 2.48,
    janAushadhi: { packSize: 10, packPrice: 14.0, perUnit: 1.4, drugCode: "JA1102", source: JA_SOURCE, verified: V },
    brands: [
      { brand: "Thyronorm 100", manufacturer: "Abbott", packSize: 15, packPrice: 76.5, perUnit: 5.1, mrp: true, source: BRAND_SOURCE, verified: V2 },
      { brand: "Thyrox 100", manufacturer: "Cipla", packSize: 15, packPrice: 45.0, perUnit: 3.0, mrp: true, source: BRAND_SOURCE, verified: V2 },
    ],
    aliases: ["thyronorm 100", "thyrox 100", "levothyroxine 100"],
  },

  // ── Skin / antifungal ────────────────────────────────────────────────────
  {
    id: "clotrimazole-gel", generic: "Clotrimazole", composition: "Clotrimazole 1% gel / cream",
    salts: ["clotrimazole"], strength: "1%", strengthValue: 1, strengthUnit: "%",
    form: "Gel", category: "Skin & Fungal", rx: false, schedule: "OTC",
    usesHint: "Fungal skin infections — ringworm, athlete's foot",
    nlemCeilingPerUnit: 25.0,
    janAushadhi: { packSize: 15, packPrice: 10.5, perUnit: 0.7, drugCode: "JA1201", source: JA_SOURCE, verified: V },
    brands: [
      { brand: "Canesten 1%", manufacturer: "Bayer", packSize: 30, packPrice: 86.0, perUnit: 2.87, mrp: true, source: BRAND_SOURCE, verified: V2 },
      { brand: "Candid 1%", manufacturer: "Glenmark", packSize: 15, packPrice: 55.5, perUnit: 3.7, mrp: true, source: BRAND_SOURCE, verified: V2 },
    ],
    aliases: ["canesten", "candid cream", "clotrimazole cream"],
  },
  {
    id: "acyclovir-cream", generic: "Acyclovir", composition: "Acyclovir 5% cream",
    salts: ["acyclovir"], strength: "5%", strengthValue: 5, strengthUnit: "%",
    form: "Gel", category: "Skin & Fungal", rx: false, schedule: "OTC",
    usesHint: "Cold sores, herpes skin lesions",
    nlemCeilingPerUnit: null,
    janAushadhi: { packSize: 5, packPrice: 22.0, perUnit: 4.4, drugCode: "JA1205", source: JA_SOURCE, verified: V },
    brands: [
      { brand: "Acivir 5%", manufacturer: "Cipla", packSize: 5, packPrice: 54.0, perUnit: 10.8, mrp: true, source: BRAND_SOURCE, verified: V2 },
    ],
    aliases: ["acivir cream", "acyclovir cream"],
  },

  // ── Cough / throat ───────────────────────────────────────────────────────
  {
    id: "dextromethorphan-syrup", generic: "Dextromethorphan", composition: "Dextromethorphan HBr 15 mg / 5 ml syrup",
    salts: ["dextromethorphan"], strength: "15 mg/5 ml", strengthValue: 15, strengthUnit: "mg",
    form: "Syrup", category: "Cough & Throat", rx: false, schedule: "OTC",
    usesHint: "Dry cough suppressant",
    nlemCeilingPerUnit: null,
    janAushadhi: { packSize: 100, packPrice: 21.0, perUnit: 0.21, drugCode: "JA1301", source: JA_SOURCE, verified: V },
    brands: [
      { brand: "Benadryl DR", manufacturer: "J&J", packSize: 100, packPrice: 105.0, perUnit: 1.05, mrp: true, source: BRAND_SOURCE, verified: V2 },
    ],
    aliases: ["benadryl", "dextromethorphan syrup", "cough syrup"],
  },
  {
    id: "ambroxol-syrup", generic: "Ambroxol", composition: "Ambroxol 30 mg / 5 ml syrup",
    salts: ["ambroxol"], strength: "30 mg/5 ml", strengthValue: 30, strengthUnit: "mg",
    form: "Syrup", category: "Cough & Throat", rx: false, schedule: "OTC",
    usesHint: "Wet/productive cough — loosens mucus",
    nlemCeilingPerUnit: null,
    janAushadhi: { packSize: 100, packPrice: 26.0, perUnit: 0.26, drugCode: "JA1305", source: JA_SOURCE, verified: V },
    brands: [
      { brand: "Ambrolite", manufacturer: "Cipla", packSize: 100, packPrice: 84.0, perUnit: 0.84, mrp: true, source: BRAND_SOURCE, verified: V2 },
      { brand: "Ambrodil", manufacturer: "Cipla", packSize: 100, packPrice: 78.0, perUnit: 0.78, mrp: true, source: BRAND_SOURCE, verified: V2 },
    ],
    aliases: ["ambrolite", "ambrodil", "ambroxol syrup"],
  },

  // ── Anxiety / sleep (Schedule H) ─────────────────────────────────────────
  {
    id: "alprazolam-0.25", generic: "Alprazolam", composition: "Alprazolam 0.25 mg",
    salts: ["alprazolam"], strength: "0.25 mg", strengthValue: 0.25, strengthUnit: "mg",
    form: "Tablet", category: "Anxiety & Sleep", rx: true, schedule: "Schedule H1",
    usesHint: "Anxiety, panic — Schedule H1, tightly controlled; follow your doctor exactly",
    nlemCeilingPerUnit: 1.35,
    janAushadhi: { packSize: 10, packPrice: 5.5, perUnit: 0.55, drugCode: "JA1401", source: JA_SOURCE, verified: V },
    brands: [
      { brand: "Restyl 0.25", manufacturer: "Cipla", packSize: 10, packPrice: 18.0, perUnit: 1.8, mrp: true, source: BRAND_SOURCE, verified: V2 },
      { brand: "Anxit 0.25", manufacturer: "Abbott", packSize: 10, packPrice: 16.5, perUnit: 1.65, mrp: true, source: BRAND_SOURCE, verified: V2 },
    ],
    aliases: ["restyl", "anxit", "alprazolam 0.25"],
  },
  {
    id: "escitalopram-10", generic: "Escitalopram", composition: "Escitalopram 10 mg",
    salts: ["escitalopram"], strength: "10 mg", strengthValue: 10, strengthUnit: "mg",
    form: "Tablet", category: "Anxiety & Sleep", rx: true, schedule: "Schedule H1",
    usesHint: "Depression, anxiety (SSRI) — do not stop abruptly",
    nlemCeilingPerUnit: null,
    janAushadhi: { packSize: 10, packPrice: 15.0, perUnit: 1.5, drugCode: "JA1405", source: JA_SOURCE, verified: V },
    brands: [
      { brand: "Nexito 10", manufacturer: "Sun Pharma", packSize: 15, packPrice: 165.0, perUnit: 11.0, mrp: true, source: BRAND_SOURCE, verified: V2 },
      { brand: "Elicea 10", manufacturer: "Cipla", packSize: 10, packPrice: 110.0, perUnit: 11.0, mrp: true, source: BRAND_SOURCE, verified: V2 },
    ],
    aliases: ["nexito", "elicea", "escitalopram 10"],
  },
];

/** Total rows in the dataset — used by the UI to show coverage. */
export const MEDICINE_COUNT = MEDICINES.length;

/** Distinct categories, for filter chips. */
export const CATEGORIES: string[] = Array.from(new Set(MEDICINES.map((m) => m.category))).sort();
