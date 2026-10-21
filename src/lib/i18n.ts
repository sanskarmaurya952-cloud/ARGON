/**
 * AIMAN — tiny English / Hindi i18n dictionary (typed).
 * Hindi strings written in Devanagari with Mukta being Devanagari-friendly.
 * Only UI chrome is translated — medical terms stay verbatim.
 */

export type Lang = "en" | "hi";

const dict = {
  appTagline: { en: "AI Medicine Affordability Network", hi: "एआई दवा किफ़ायत नेटवर्क" },
  searchPlaceholder: { en: "Search medicine, brand or salt — e.g. Dolo 650, Metformin…", hi: "दवा, ब्रांड या सॉल्ट खोजें — जैसे Dolo 650, Metformin…" },
  search: { en: "Search", hi: "खोजें" },
  scanMedicineList: { en: "Scan Medicine List", hi: "दवाई सूची स्कैन करें" },
  nearbyKendras: { en: "Nearby Jan Aushadhi Kendras", hi: "नज़दीकी जन औषधि केंद्र" },
  savings: { en: "Savings", hi: "बचत" },
  home: { en: "Home", hi: "होम" },
  howItWorks: { en: "How it works", hi: "कैसे काम करता है" },
  medicine: { en: "Medicine", hi: "दवा" },
  perMonth: { en: "per month", hi: "प्रति माह" },
  consultDoctor: { en: "Always consult a doctor or pharmacist before changing any medicine.", hi: "दवा बदलने से पहले हमेशा डॉक्टर या फार्मासिस्ट से सलाह लें।" },
  verified: { en: "Last verified", hi: "अंतिम सत्यापन" },
  brand: { en: "Brand", hi: "ब्रांड" },
  janAushadhi: { en: "Jan Aushadhi", hi: "जन औषधि" },
  voiceSearch: { en: "Voice search", hi: "आवाज़ से खोजें" },
  searchResults: { en: "Search results", hi: "खोज परिणाम" },
  noResults: { en: "No medicine matched. Check the spelling, or try the generic (salt) name.", hi: "कोई दवा नहीं मिली। वर्तनी जाँचें, या जेनेरिक (सॉल्ट) नाम आज़माएँ।" },
} as const;

export type DictKey = keyof typeof dict;

export function t(key: DictKey, lang: Lang): string {
  return dict[key][lang];
}
