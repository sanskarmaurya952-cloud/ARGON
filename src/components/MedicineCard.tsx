import { Link } from "react-router-dom";
import { Pill, Plus, Check, Sparkles, AlertCircle } from "lucide-react";
import type { Medicine } from "../data/medicines";
import { computeSavings, formatINR, formatINR2 } from "../lib/compare";
import { useApp } from "../lib/context";
import { cn } from "../lib/cn";

export default function MedicineCard({ medicine, score }: { medicine: Medicine; score?: number }) {
  const { inList, addToList, removeFromList } = useApp();
  const savings = computeSavings(medicine);
  const added = inList(medicine.id);
  const brandMin = medicine.brands.reduce((a, b) => Math.min(a, b.perUnit), Infinity);

  return (
    <article className="group rounded-2xl border border-pine-100 bg-white p-4 shadow-[0_2px_0_0_rgba(15,45,35,0.08)] transition-all hover:-translate-y-0.5 hover:border-pine-300 hover:shadow-[0_10px_30px_-12px_rgba(15,45,35,0.35)] sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <Link to={`/medicine/${medicine.id}`} className="focus-ring min-w-0 rounded-lg">
          <h3 className="font-display text-lg font-semibold leading-snug text-pine-950">{medicine.composition}</h3>
          <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-pine-500">
            {medicine.form} · {medicine.category}
            {medicine.rx && <span className="ml-2 rounded bg-terracotta-500/10 px-1.5 py-0.5 text-[0.65rem] font-bold text-terracotta-600">Rx</span>}
          </p>
        </Link>
        <button
          onClick={() => (added ? removeFromList(medicine.id) : addToList(medicine.id))}
          className={cn(
            "focus-ring flex min-h-11 shrink-0 items-center gap-1.5 rounded-xl px-3 text-sm font-bold transition-all",
            added
              ? "bg-leaf-600 text-cream-50"
              : "border-2 border-pine-800 bg-cream-50 text-pine-900 hover:bg-pine-50"
          )}
          aria-pressed={added}
          aria-label={added ? "Remove from my list" : "Add to my list"}
        >
          {added ? <Check size={16} strokeWidth={3} /> : <Plus size={16} strokeWidth={3} />}
          <span className="hidden sm:inline">{added ? "In my list" : "Add to list"}</span>
        </button>
      </div>

      {/* price duel */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-pine-100 bg-cream-50 p-2.5">
          <p className="text-[0.62rem] font-bold uppercase tracking-wider text-pine-500">Cheapest brand MRP</p>
          <p className="text-base font-extrabold text-pine-950">{medicine.brands.length ? formatINR2(brandMin) + " /unit" : "—"}</p>
          <p className="truncate text-[0.65rem] text-pine-400">{medicine.brands[0] ? medicine.brands.map((b) => b.brand).slice(0, 2).join(", ") : "not listed"}</p>
        </div>
        <div className="relative rounded-xl border-2 border-leaf-600 bg-leaf-600/5 p-2.5">
          <p className="flex items-center gap-1 text-[0.62rem] font-bold uppercase tracking-wider text-leaf-700">
            <Pill size={10} /> Jan Aushadhi
          </p>
          <p className="text-base font-extrabold text-leaf-700">
            {medicine.janAushadhi ? `${formatINR2(medicine.janAushadhi.perUnit)} /unit` : "—"}
          </p>
          <p className="text-[0.65rem] text-leaf-700/80">
            {medicine.janAushadhi ? `${formatINR(medicine.janAushadhi.packPrice)} / ${medicine.janAushadhi.packSize} units · code ${medicine.janAushadhi.drugCode}` : "not listed"}
          </p>
        </div>
      </div>

      {savings.hasComparable && savings.vsAverageFraction != null ? (
        <p className="mt-3 flex flex-wrap items-center gap-1.5 text-xs font-semibold text-leaf-700">
          <Sparkles size={13} className="text-marigold-500" />
          Save up to {Math.round(savings.vsAverageFraction * 100)}% vs brand MRPs
          <span className="font-medium text-pine-500">≈ {formatINR(savings.monthlySavings ?? 0)}/month · check stock at your kendra</span>
        </p>
      ) : (
        <p className="mt-3 flex items-center gap-1.5 text-[0.7rem] text-pine-500">
          <AlertCircle size={12} /> Only same strength/form compared — savings shown on the detail page when verifiable.
        </p>
      )}
      {score != null && (
        <p className="mt-1.5 text-[0.65rem] font-medium uppercase tracking-wider text-pine-300">match relevance {Math.round(score * 100)}%</p>
      )}
    </article>
  );
}
