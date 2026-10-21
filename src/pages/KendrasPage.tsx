import { useCallback, useEffect, useMemo, useState } from "react";
import {
  MapPin, Navigation, Search, Loader2, Phone, ExternalLink, Store, CircleAlert,
  LocateFixed, ArrowRight, Info, ShieldAlert,
} from "lucide-react";
import {
  KENDRAS, withDistance, fetchLiveKendras, geocodePlace,
  KENDRA_HELPLINE, KENDRA_LOCATOR_URL, type KendraWithDistance,
} from "../data/kendras";

const ALL_INDIA_CENTER = { lat: 22.9, lng: 79.6 }; // Nagpur-ish, centre of India

export default function KendrasPage() {
  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [placeQuery, setPlaceQuery] = useState("");
  const [placeLoading, setPlaceLoading] = useState(false);
  const [placeError, setPlaceError] = useState<string | null>(null);
  const [placeLabel, setPlaceLabel] = useState<string | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [liveResults, setLiveResults] = useState<KendraWithDistance[]>([]);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState<string | null>(null);

  const sorted = useMemo(() => {
    if (center) return withDistance(center, KENDRAS);
    return withDistance(ALL_INDIA_CENTER, KENDRAS).map((k) => ({ ...k, distanceKm: NaN }));
  }, [center]);
  const shown = useMemo(() => {
    const dir = center ? sorted.filter((k) => k.distanceKm <= 500).slice(0, 14) : sorted.slice(0, 30);
    const live = liveResults.filter((l) => !dir.some((d) => haversineish(d, l) < 0.2));
    return [...live, ...dir].slice(0, 16);
  }, [center, sorted, liveResults]);

  const tryLive = useCallback(async (lat: number, lng: number) => {
    setLiveLoading(true);
    setLiveError(null);
    try {
      const res = await fetchLiveKendras(lat, lng, 8);
      setLiveResults(res);
      if (res.length === 0) setLiveError("No kendra found via live OpenStreetMap data within 8 km — showing verified directory instead.");
    } catch {
      setLiveError("Live lookup unavailable right now — showing the verified PMBJP directory instead.");
    } finally {
      setLiveLoading(false);
    }
  }, []);

  const geolocate = useCallback(() => {
    setGeoError(null);
    if (!("geolocation" in navigator)) {
      setGeoError("Geolocation is not supported by this browser — enter your city or PIN code instead.");
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCenter(c);
        setPlaceLabel("your location");
        setGeoLoading(false);
        tryLive(c.lat, c.lng);
      },
      (err) => {
        setGeoLoading(false);
        setGeoError(err.code === err.PERMISSION_DENIED
          ? "Location permission denied. Type your city or 6-digit PIN code instead."
          : "Could not get your location. Type your city or PIN code instead.");
      },
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 600000 }
    );
  }, [tryLive]);

  const searchPlace = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!placeQuery.trim()) return;
    setPlaceLoading(true);
    setPlaceError(null);
    const hit = await geocodePlace(placeQuery);
    setPlaceLoading(false);
    if (!hit) {
      setPlaceError("Could not find that place. Check the spelling, or try a 6-digit PIN code.");
      return;
    }
    const c = { lat: hit.lat, lng: hit.lng };
    setCenter(c);
    setPlaceLabel(hit.label.split(",").slice(0, 2).join(","));
    tryLive(c.lat, c.lng);
  }, [placeQuery, tryLive]);

  // auto-geolocate once on mount (desktop users get directory view until they opt in)
  useEffect(() => { /* intentionally not auto-prompting: permission prompts on load hurt trust */ }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 md:py-8">
      <p className="flex items-center gap-2 text-[0.7rem] font-bold uppercase tracking-[0.16em] text-terracotta-500"><Store size={12} /> PMBJP network · 20,149+ Kendras nationwide</p>
      <h1 className="font-display mt-1 text-3xl font-semibold text-pine-950">Nearby Jan Aushadhi Kendras</h1>
      <p className="mt-1 max-w-2xl text-sm text-pine-600">
        Jan Aushadhi Kendras sell the same generic medicines at 50–90% less than brand MRPs. Find one near you — then
        <strong> call ahead</strong>: stock depends on the kendra, and AIMAN never claims live inventory.
      </p>

      {/* helpline banner */}
      <a href={`tel:${KENDRA_HELPLINE}`} className="focus-ring mt-4 flex h-16 items-center justify-between gap-3 rounded-2xl border-2 border-marigold-400 bg-marigold-100 px-4 sm:px-6">
        <span className="flex items-center gap-3">
          <Phone size={24} className="shrink-0 text-marigold-700" />
          <span className="leading-tight">
            <span className="block text-[0.68rem] font-bold uppercase tracking-wider text-marigold-700">PMBJP toll-free helpline</span>
            <span className="font-display text-xl font-bold tabular-nums text-pine-950">{KENDRA_HELPLINE}</span>
          </span>
        </span>
        <ArrowRight size={20} className="shrink-0 text-marigold-700" />
      </a>

      {/* location controls */}
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <button
          onClick={geolocate}
          disabled={geoLoading}
          className="focus-ring flex h-16 items-center justify-center gap-2 rounded-2xl bg-pine-800 px-4 text-base font-extrabold text-cream-50 transition-colors hover:bg-pine-700 disabled:opacity-60"
        >
          {geoLoading ? <Loader2 size={20} className="animate-spin" /> : <LocateFixed size={20} />}
          {geoLoading ? "Locating…" : "Use my location"}
        </button>
        <form onSubmit={searchPlace} className="flex h-16 items-center overflow-hidden rounded-2xl border-2 border-pine-800 bg-white shadow-[0_3px_0_0_#0f2d23] focus-within:shadow-[0_3px_0_0_#0f2d23,0_0_0_4px_rgba(237,170,63,0.45)]">
          <Search size={20} className="ml-4 shrink-0 text-pine-600" />
          <input
            value={placeQuery}
            onChange={(e) => setPlaceQuery(e.target.value)}
            placeholder="City or PIN code — e.g. 400001, Patna"
            aria-label="City or PIN code"
            className="h-full min-w-0 flex-1 bg-transparent px-3 text-base font-medium outline-none placeholder:text-pine-400"
          />
          <button type="submit" disabled={placeLoading} className="focus-ring mr-2 flex h-12 items-center gap-1.5 rounded-xl bg-marigold-400 px-4 text-sm font-extrabold text-pine-950 hover:bg-marigold-300 disabled:opacity-60">
            {placeLoading ? <Loader2 size={16} className="animate-spin" /> : "Find"}
          </button>
        </form>
      </div>
      {(geoError || placeError) && (
        <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-terracotta-600" role="alert">
          <CircleAlert size={13} /> {geoError ?? placeError}
        </p>
      )}

      {/* status line */}
      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-pine-600">
        {placeLabel && <span className="flex items-center gap-1.5 rounded-full bg-pine-50 px-3 py-1.5 font-semibold text-pine-800"><MapPin size={12} /> Showing kendra near: {placeLabel}</span>}
        {liveLoading && <span className="flex items-center gap-1.5"><Loader2 size={13} className="animate-spin" /> Checking live kendra data near you…</span>}
        {liveError && <span className="flex items-center gap-1.5 text-marigold-700"><Info size={13} /> {liveError}</span>}
        {liveResults.length > 0 && <span className="flex items-center gap-1.5 font-semibold text-leaf-700"><Navigation size={12} /> {liveResults.length} live kendra match{liveResults.length > 1 ? "es" : ""} from OpenStreetMap</span>}
      </div>

      {/* list */}
      <ul className="mt-3 grid gap-3 sm:grid-cols-2">
        {shown.map((k) => (
          <li key={k.id} className="flex flex-col rounded-2xl border border-pine-100 bg-white p-4 shadow-[0_2px_0_0_rgba(15,45,35,0.08)]">
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-sm font-bold leading-snug text-pine-950">{k.name}</h2>
              {!Number.isNaN(k.distanceKm) && (
                <span className="shrink-0 rounded-full bg-pine-800 px-2.5 py-1 text-[0.7rem] font-extrabold tabular-nums text-cream-50">
                  {k.distanceKm.toFixed(1)} km
                </span>
              )}
            </div>
            <p className="mt-1.5 text-xs leading-snug text-pine-600">{k.address}{k.pin ? ` — ${k.pin}` : ""}</p>
            <p className="mt-0.5 text-[0.7rem] font-medium text-pine-400">{[k.city, k.state].filter(Boolean).join(", ")}{k.approxCoords && " · location approximate"}{k.source === "live-osm" && " · via OpenStreetMap (live)"}</p>
            <div className="mt-auto flex flex-wrap items-center gap-2 pt-3">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${k.lat},${k.lng}`}
                target="_blank" rel="noreferrer"
                className="focus-ring flex h-11 items-center gap-1.5 rounded-xl bg-pine-800 px-3.5 text-xs font-bold text-cream-50 hover:bg-pine-700"
              >
                <MapPin size={14} /> Map
              </a>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${k.lat},${k.lng}`}
                target="_blank" rel="noreferrer"
                className="focus-ring flex h-11 items-center gap-1.5 rounded-xl border border-pine-200 px-3.5 text-xs font-bold text-pine-800 hover:border-pine-500"
              >
                <Navigation size={14} /> Directions
              </a>
              {k.phone ? (
                <a href={`tel:${k.phone}`} className="focus-ring flex h-11 items-center gap-1.5 rounded-xl border border-pine-200 px-3.5 text-xs font-bold text-pine-800 hover:border-pine-500">
                  <Phone size={14} /> Call {k.phone}
                </a>
              ) : (
                <a href={`tel:${KENDRA_HELPLINE}`} className="focus-ring flex h-11 items-center gap-1.5 rounded-xl border border-marigold-400 bg-marigold-100 px-3.5 text-xs font-bold text-marigold-700 hover:bg-marigold-200">
                  <Phone size={14} /> Call helpline
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>

      {/* disclaimers */}
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <p className="flex items-start gap-2 rounded-2xl border border-marigold-300 bg-marigold-100/60 p-4 text-[0.78rem] leading-snug text-marigold-700">
          <ShieldAlert size={16} className="mt-0.5 shrink-0" />
          AIMAN never claims a medicine is in stock at a kendra. Prices and stock change daily — always phone first
          ({KENDRA_HELPLINE} or the kendra directly) and ask before you travel.
        </p>
        <p className="flex items-start gap-2 rounded-2xl border border-pine-100 bg-white p-4 text-[0.78rem] leading-snug text-pine-600">
          <Info size={16} className="mt-0.5 shrink-0 text-pine-400" />
          Directory verified 1 Oct 2026 from PMBJP listings; coordinates marked “approximate” may be off a street or two —
          use the map link. Live OpenStreetMap results appear when available. Official locator:{" "}
          <a href={KENDRA_LOCATOR_URL} target="_blank" rel="noreferrer" className="focus-ring inline-flex items-center gap-1 font-bold text-pine-800 underline underline-offset-2">janaushadhi.gov.in <ExternalLink size={11} /></a>
        </p>
      </div>
    </div>
  );
}

function haversineish(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  // rough proximity check for dedupe (in degrees)
  return Math.abs(a.lat - b.lat) + Math.abs(a.lng - b.lng);
}
