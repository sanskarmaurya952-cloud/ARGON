import { useEffect, useMemo, useState } from "react";

import { useSearchParams, Link } from "react-router-dom";
import { SearchX, SlidersHorizontal, ScanText, ArrowLeft, Search } from "lucide-react";
import SearchBar from "../components/SearchBar";
import MedicineCard from "../components/MedicineCard";
import { searchMedicines } from "../lib/search";
import { useApp } from "../lib/context";
import { t } from "../lib/i18n";
import { cn } from "../lib/cn";

type FormFilter = "All" | "Tablet" | "Capsule" | "Syrup" | "Inhaler" | "Gel" | "Sachet";

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { lang } = useApp();
  const q = searchParams.get("q") ?? "";
  const [form, setForm] = useState<FormFilter>("All");
  const [pendingQuery, setPendingQuery] = useState<string | null>(null);

  // derived perceptible loading state: true briefly on every new query
  const searching = pendingQuery !== q;
  useEffect(() => {
    const t = setTimeout(() => setPendingQuery(q), 200);
    return () => clearTimeout(t);
  }, [q]);

  const results = useMemo(() => {
    if (!q.trim()) return [];
    const raw = searchMedicines(q, { limit: 24 });
    return form === "All" ? raw : raw.filter((r) => r.medicine.form === form);
  }, [q, form]);

  const doSearch = (query: string) => setSearchParams({ q: query });

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 md:py-8">
      <div className="flex items-center justify-between gap-3">
        <Link to="/" className="focus-ring flex items-center gap-1.5 rounded-lg text-sm font-semibold text-pine-600 hover:text-pine-900">
          <ArrowLeft size={16} /> Home
        </Link>
        <Link to="/scan" className="focus-ring flex items-center gap-1.5 rounded-xl border border-pine-200 bg-cream-50 px-3 py-2 text-xs font-bold text-pine-800 hover:border-marigold-400">
          <ScanText size={14} /> Scan a list instead
        </Link>
      </div>

      <h1 className="font-display mt-4 text-3xl font-semibold text-pine-950">{t("searchResults", lang)}</h1>
      <div className="mt-3 max-w-2xl">
        <SearchBar size="md" initial={q} onSearch={doSearch} />
      </div>

      {/* filters */}
      <div className="mt-4 flex flex-wrap items-center gap-2" role="group" aria-label="Filter by dosage form">
        <SlidersHorizontal size={14} className="text-pine-400" />
        {(["All", "Tablet", "Capsule", "Syrup", "Inhaler", "Gel", "Sachet"] as FormFilter[]).map((f) => (
          <button
            key={f}
            onClick={() => setForm(f)}
            aria-pressed={form === f}
            className={cn(
              "focus-ring min-h-11 rounded-full border px-4 text-xs font-bold transition-all",
              form === f ? "border-pine-800 bg-pine-800 text-cream-50" : "border-pine-200 bg-cream-50 text-pine-700 hover:border-pine-400"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* results */}
      <div className="mt-5" aria-live="polite">
        {searching && q ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="shimmer h-44 rounded-2xl" />
            ))}
          </div>
        ) : q && results.length > 0 ? (
          <>
            <p className="mb-3 text-sm font-semibold text-pine-600">
              {results.length} match{results.length > 1 ? "es" : ""} for “<span className="text-pine-950">{q}</span>” — same ingredient, strength & form only
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {results.map((r) => (
                <MedicineCard key={r.medicine.id} medicine={r.medicine} score={r.score} />
              ))}
            </div>
          </>
        ) : q ? (
          <div className="rounded-3xl border border-dashed border-pine-200 bg-cream-50 px-6 py-14 text-center">
            <SearchX size={40} className="mx-auto text-pine-300" />
            <h2 className="font-display mt-3 text-xl font-semibold text-pine-900">{t("noResults", lang)}</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-pine-600">
              Tip: search the <strong>salt name</strong> (e.g. “atorvastatin”) instead of the brand, or scan your prescription —
              OCR + Gemma 4 will read it for you.
            </p>
            <Link to="/scan" className="focus-ring mt-4 inline-flex h-13 items-center gap-2 rounded-2xl bg-pine-800 px-5 py-3.5 font-bold text-cream-50 hover:bg-pine-700">
              <ScanText size={18} /> Scan Medicine List
            </Link>
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-pine-200 bg-cream-50 px-6 py-14 text-center">
            <Search size={40} className="mx-auto text-pine-300" />
            <h2 className="font-display mt-3 text-xl font-semibold text-pine-900">Search a medicine to compare prices</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-pine-600">Brand, generic or salt — misspellings are fine. Try “dolo 65 0”, “amoxicilin”, “metformn”…</p>
          </div>
        )}
      </div>
    </div>
  );
}
