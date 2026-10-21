/**
 * AIMAN — Jan Aushadhi Kendra directory.
 *
 * STOCK DISCLAIMER: AIMAN never claims live availability. Every listing shows
 * "call to confirm availability" plus the PMBJP toll-free helpline 1800-180-8080.
 *
 * Distances are STANDBY values for demo use when the live Overpass lookup is
 * unavailable; when geolocated, users always get live-computed distance
 * (haversine) to directory entries and/or live results.
 *
 * Directory entries were collected from the PMBJP kendra locator
 * (janaushadhi.gov.in) and district administration listings, verified 2026-10-01.
 * Where coordinates are approximate the flag `approxCoords: true` is set and the
 * UI labels directions with "approximate location — confirm on the map".
 */

export interface Kendra {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pin: string;
  lat: number;
  lng: number;
  phone: string | null;
  approxCoords?: boolean;
}

export const KENDRA_HELPLINE = "1800-180-8080";
export const KENDRA_LOCATOR_URL = "https://janaushadhi.gov.in";

export const KENDRAS: Kendra[] = [
  // Delhi NCR
  { id: "k-del-1", name: "PMBJP Jan Aushadhi Kendra, Safdarjung Hospital", address: "Safdarjung Hospital Campus, Outer Ring Road, Ansari Nagar", city: "New Delhi", state: "Delhi", pin: "110029", lat: 28.5672, lng: 77.2064, phone: null },
  { id: "k-del-2", name: "Jan Aushadhi Kendra, DDU Hospital", address: "Ring Road, Hari Nagar, West Delhi", city: "New Delhi", state: "Delhi", pin: "110066", lat: 28.6406, lng: 77.1216, phone: null },
  { id: "k-del-3", name: "PM Jan Aushadhi Kendra, Lok Nayak Hospital", address: "Jawahar Lal Nehru Marg, Delhi Gate", city: "New Delhi", state: "Delhi", pin: "110002", lat: 28.6365, lng: 77.2440, phone: null },
  { id: "k-gur-1", name: "Jan Aushadhi Kendra, Civil Hospital Gurugram", address: "Civil Lines, Gurugram", city: "Gurugram", state: "Haryana", pin: "122001", lat: 28.4516, lng: 77.0275, phone: null },
  { id: "k-noi-1", name: "PMBJP Kendra, Noida District Hospital", address: "Sector-30, Noida", city: "Noida", state: "Uttar Pradesh", pin: "201301", lat: 28.5708, lng: 77.3272, phone: null },
  // Mumbai
  { id: "k-mum-1", name: "Jan Aushadhi Kendra, KEM Hospital", address: "Acharya Donde Marg, Parel", city: "Mumbai", state: "Maharashtra", pin: "400012", lat: 19.0027, lng: 72.8422, phone: null },
  { id: "k-mum-2", name: "PM Jan Aushadhi Kendra, Sion Hospital", address: "Veer Savarkar Marg, Sion", city: "Mumbai", state: "Maharashtra", pin: "400022", lat: 19.0402, lng: 72.8618, phone: null },
  { id: "k-mum-3", name: "Jan Aushadhi Kendra, KB Bhabha Hospital", address: "Bandra West", city: "Mumbai", state: "Maharashtra", pin: "400050", lat: 19.0544, lng: 72.8296, phone: null },
  { id: "k-mum-4", name: "Jan Aushadhi Kendra, Malad (West)", address: "S.V. Road, Malad West", city: "Mumbai", state: "Maharashtra", pin: "400064", lat: 19.1874, lng: 72.8406, phone: null, approxCoords: true },
  // Bengaluru
  { id: "k-blr-1", name: "Jan Aushadhi Kendra, Victoria Hospital", address: "Fort, K.R. Market Road", city: "Bengaluru", state: "Karnataka", pin: "560002", lat: 12.9634, lng: 77.5761, phone: null },
  { id: "k-blr-2", name: "PMBJP Kendra, Bowring & Lady Curzon Hospital", address: "Shivajinagar", city: "Bengaluru", state: "Karnataka", pin: "560001", lat: 12.9822, lng: 77.6036, phone: null },
  { id: "k-blr-3", name: "Jan Aushadhi Kendra, Whitefield", address: "ITPL Main Road, Whitefield", city: "Bengaluru", state: "Karnataka", pin: "560066", lat: 12.9698, lng: 77.7500, phone: null, approxCoords: true },
  // Chennai
  { id: "k-che-1", name: "Jan Aushadhi Kendra, Rajiv Gandhi GH", address: "Park Town, Periyar EVR High Road", city: "Chennai", state: "Tamil Nadu", pin: "600003", lat: 13.0827, lng: 80.2757, phone: null },
  { id: "k-che-2", name: "PMBJP Kendra, Stanley Hospital", address: "Old Jail Road, Old Washermanpet", city: "Chennai", state: "Tamil Nadu", pin: "600001", lat: 13.1117, lng: 80.2876, phone: null },
  // Kolkata
  { id: "k-kol-1", name: "Jan Aushadhi Kendra, SSKM Hospital", address: "244 AJC Bose Road", city: "Kolkata", state: "West Bengal", pin: "700020", lat: 22.5394, lng: 88.3444, phone: null },
  { id: "k-kol-2", name: "PM Jan Aushadhi Kendra, Sealdah", address: "Near Sealdah Railway Station Market", city: "Kolkata", state: "West Bengal", pin: "700007", lat: 22.5653, lng: 88.3707, phone: null, approxCoords: true },
  // Pune
  { id: "k-pun-1", name: "Jan Aushadhi Kendra, Sassoon Hospital", address: "Jai Prakash Narayan Road, Pune Camp", city: "Pune", state: "Maharashtra", pin: "411001", lat: 18.5194, lng: 73.8800, phone: null },
  { id: "k-pun-2", name: "PMBJP Kendra, Aundh", address: "Aundh Road, Aundh", city: "Pune", state: "Maharashtra", pin: "411007", lat: 18.5590, lng: 73.8071, phone: null, approxCoords: true },
  // Hyderabad
  { id: "k-hyd-1", name: "Jan Aushadhi Kendra, Osmania General Hospital", address: "Afzal Gunj", city: "Hyderabad", state: "Telangana", pin: "500012", lat: 17.3766, lng: 78.4747, phone: null },
  { id: "k-hyd-2", name: "PM Jan Aushadhi Kendra, Nampally", address: "Sarojini Devi Road, Nampally", city: "Hyderabad", state: "Telangana", pin: "500001", lat: 17.3928, lng: 78.4700, phone: null, approxCoords: true },
  // Ahmedabad
  { id: "k-ahm-1", name: "Jan Aushadhi Kendra, Civil Hospital (Asarwa)", address: "Asarwa", city: "Ahmedabad", state: "Gujarat", pin: "380016", lat: 23.0500, lng: 72.6007, phone: null },
  // Lucknow
  { id: "k-lko-1", name: "Jan Aushadhi Kendra, Civil Hospital Lucknow", address: "Subhash Marg, Hazratganj", city: "Lucknow", state: "Uttar Pradesh", pin: "226001", lat: 26.8507, lng: 80.9468, phone: null },
  // Patna
  { id: "k-pat-1", name: "Jan Aushadhi Kendra, Patna Medical College & Hospital", address: "Ashok Rajpath, Patna City", city: "Patna", state: "Bihar", pin: "800004", lat: 25.6230, lng: 85.1694, phone: null },
  // Jaipur
  { id: "k-jai-1", name: "Jan Aushadhi Kendra, SMS Hospital", address: "Jawahar Lal Nehru Marg", city: "Jaipur", state: "Rajasthan", pin: "302004", lat: 26.9070, lng: 75.8221, phone: null },
  // Bhopal
  { id: "k-bho-1", name: "Jan Aushadhi Kendra, Hamidia Hospital", address: "Subhash Nagar", city: "Bhopal", state: "Madhya Pradesh", pin: "462001", lat: 23.2603, lng: 77.4002, phone: null },
  // Chandigarh
  { id: "k-chd-1", name: "Jan Aushadhi Kendra, Government Medical College & Hospital", address: "Sector 32-B", city: "Chandigarh", state: "Chandigarh", pin: "160030", lat: 30.7254, lng: 76.7554, phone: null },
  // Thiruvananthapuram
  { id: "k-tvm-1", name: "Jan Aushadhi Kendra, Medical College Hospital", address: "Chalai, Medical College", city: "Thiruvananthapuram", state: "Kerala", pin: "695011", lat: 8.5356, lng: 76.9019, phone: null },
  // Bhubaneswar
  { id: "k-bbs-1", name: "Jan Aushadhi Kendra, SCB Medical College & Hospital (Cuttack)", address: "Manglabag, Cuttack", city: "Cuttack", state: "Odisha", pin: "753007", lat: 20.4686, lng: 85.8797, phone: null },
  // Ranchi
  { id: "k-rnc-1", name: "Jan Aushadhi Kendra, RIMS", address: "Bariatu, RIMS Campus", city: "Ranchi", state: "Jharkhand", pin: "834009", lat: 23.3693, lng: 85.3348, phone: null },
  // Varanasi
  { id: "k-vns-1", name: "Jan Aushadhi Kendra, BHU Sir Sunderlal Hospital", address: "Banaras Hindu University Campus", city: "Varanasi", state: "Uttar Pradesh", pin: "221005", lat: 25.2623, lng: 82.9919, phone: null },
];

/* ---------- geo helpers ---------- */

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export interface KendraWithDistance extends Kendra {
  distanceKm: number;
  source: "directory" | "live-osm";
}

export function withDistance(center: { lat: number; lng: number }, ken: Kendra[]): KendraWithDistance[] {
  return ken
    .map((k) => ({ ...k, distanceKm: haversineKm(center.lat, center.lng, k.lat, k.lng), source: "directory" as const }))
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

/** Live lookup against OpenStreetMap Overpass for pharmacies tagged as Jan Aushadhi (best effort). */
export async function fetchLiveKendras(lat: number, lng: number, radiusKm = 10): Promise<KendraWithDistance[]> {
  const radiusM = Math.round(radiusKm * 1000);
  const query = `[out:json][timeout:15];(nwr["name"~"aushadhi",i](around:${radiusM},${lat},${lng});nwr["healthcare"="pharmacy"]["dispensing"="no"](around:${radiusM},${lat},${lng}););out center 40;`;
  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    body: `data=${encodeURIComponent(query)}`,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  if (!res.ok) throw new Error(`Overpass error ${res.status}`);
  const data = await res.json();
  const out: KendraWithDistance[] = [];
  for (const el of data.elements ?? []) {
    const latE = el.lat ?? el.center?.lat;
    const lngE = el.lon ?? el.center?.lon;
    const name: string = el.tags?.name ?? "";
    if (!latE || !lngE || !/aushadhi/i.test(name)) continue; // keep only Jan Aushadhi matches
    out.push({
      id: `osm-${el.type}-${el.id}`,
      name,
      address: [el.tags?.["addr:housenumber"], el.tags?.["addr:street"], el.tags?.["addr:city"]].filter(Boolean).join(", ") || "Address not listed — verify on map",
      city: el.tags?.["addr:city"] ?? "",
      state: el.tags?.["addr:state"] ?? "",
      pin: el.tags?.["addr:postcode"] ?? "",
      lat: latE,
      lng: lngE,
      phone: el.tags?.phone ?? el.tags?.["contact:phone"] ?? null,
      approxCoords: true,
      distanceKm: haversineKm(lat, lng, latE, lngE),
      source: "live-osm",
    });
  }
  return out.sort((a, b) => a.distanceKm - b.distanceKm);
}

/** Geocode a city name or PIN code via OpenStreetMap Nominatim (no key required). */
export async function geocodePlace(query: string): Promise<{ lat: number; lng: number; label: string } | null> {
  const trimmed = query.trim();
  if (!trimmed) return null;
  const isPin = /^\d{6}$/.test(trimmed);
  const params = new URLSearchParams({ format: "json", limit: "1", countrycodes: "in" });
  if (isPin) params.set("postalcode", trimmed);
  else params.set("q", `${trimmed}, India`);
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;
    const hit = data[0];
    return { lat: parseFloat(hit.lat), lng: parseFloat(hit.lon), label: hit.display_name ?? trimmed };
  } catch {
    return null;
  }
}
