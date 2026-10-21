import { useMemo } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import {
  ArrowLeft, Plus, Check, ShieldAlert, Info, Store, FileText, BadgeCheck, BadgeIndianRupee, FlaskConical, ArrowRight,
} from "lucide-react";
import { MEDICINES } from "../data/medicines";
import PriceTable from "../components/PriceTable";
import { comparableAlternatives } from "../lib/catalog";
import { computeSavings, formatINR } from "../lib/compare";
import { useApp } from "../lib/context";
import { cn } from "../lib/cn";

export default function MedicineDetail() {
  const { id } = useParams<{ id: string }>();
  const { inList, addToList, removeFromList } = useApp();
  const medicine = useMemo(() => MEDICINES.find((m) => m.id === id), [id]);

  if (!medicine) return <Navigate to="/search" replace />;
  const added = inList(medicine.id);
  const savings = computeSavings(medicine);
  const alternatives = comparableAlternatives(medicine);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 md:py-8">
      <Link to="/search" className="focus-ring inline-flex items-center gap-1.5 rounded-lg text-sm font-semibold text-pine-600 hover:text-pine-900">
        <ArrowLeft size={16} /> Back to search
      </Link>

      {/* ── header card ─────────────────────────────────────── */}
      <div className="mt-4 rounded-3xl border border-pine-100 bg-white p-5 shadow-[0_2px_0_0_rgba(15,45,35,0.08)] sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-semibold leading-tight text-pine-950 sm:text-3xl">{medicine.composition}</h1>
            <p className="mt-1.5 text-sm font-medium text-pine-600">{medicine.usesHint}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <span className="rounded-full bg-pine-100 px-3 py-1 text-[0.7rem] font-bold text-pine-800">{medicine.form}</span>
              <span className="rounded-full bg-pine-100 px-3 py-1 text-[0.7rem] font-bold text-pine-800">{medicine.strength}</span>
              <span className="rounded-full bg-pine-100 px-3 py-1 text-[0.7rem] font-bold text-pine-800">{medicine.category}</span>
              <span className={cn(
                "rounded-full px-3 py-1 text-[0.7rem] font-bold",
                medicine.rx ? "bg-terracotta-500/15 text-terracotta-600" : "bg-leaf-600/15 text-leaf-700"
              )}>
                {medicine.rx ? `${medicine.schedule} — prescription needed` : "OTC — no prescription needed"}
              </span>
            </div>
          </div>
          <button
            onClick={() => (added ? removeFromList(medicine.id) : addToList(medicine.id))}
            className={cn(
              "focus-ring flex h-14 shrink-0 items-center gap-2 rounded-2xl px-5 text-base font-extrabold transition-all",
              added ? "bg-leaf-600 text-cream-50" : "bg-marigold-400 text-pine-950 shadow-[0_4px_0_0_#7a4a0d] hover:translate-y-0.5 hover:shadow-none"
            )}
            aria-pressed={added}
          >
            {added ? <Check size={20} strokeWidth={3} /> : <Plus size={20} strokeWidth={3} />}
            {added ? "In my list" : "Add to my list"}
          </button>
        </div>

        {/* brand names cheat-sheet */}
        {medicine.brands.length > 0 && (
          <p className="mt-4 border-t border-pine-50 pt-4 text-sm text-pine-700">
            <span className="font-bold text-pine-900">Sold as: </span>
            {medicine.brands.map((b) => b.brand).join(" · ")}
            {medicine.aliases.length > 0 && <span className="text-pine-400"> (also: {medicine.aliases.slice(0, 4).join(", ")})</span>}
          </p>
        )}

        {savings.hasComparable && savings.annualSavings != null && (
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-leaf-600/30 bg-leaf-600/5 px-4 py-3">
            <BadgeIndianRupee size={22} className="shrink-0 text-leaf-700" />
            <p className="text-sm font-semibold text-leaf-700">
              Potential yearly saving vs average brand MRPs: <span className="font-display text-lg">{formatINR(savings.annualSavings)}</span>
              <span className="block text-[0.7rem] font-medium text-leaf-600">{savings.note}</span>
            </p>
            <Link to="/kendras" className="focus-ring ml-auto inline-flex h-11 items-center gap-1.5 rounded-xl bg-leaf-600 px-4 text-sm font-bold text-cream-50 hover:bg-leaf-700">
              <Store size={16} /> Find kendra <ArrowRight size={14} />
            </Link>
          </div>
        )}
      </div>

      {/* ── price comparison ────────────────────────────────── */}
      <div className="mt-5">
        <PriceTable medicine={medicine} />
      </div>

      {/* ── safety box ──────────────────────────────────────── */}
      <div className="mt-5 grid gap-4 md:grid-cols-5">
        <div className="rounded-2xl border border-marigold-300 bg-marigold-100/60 p-4 md:col-span-3">
          <p className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-marigold-700">
            <ShieldAlert size={17} /> Before you switch — please read
          </p>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[0.82rem] leading-snug text-marigold-700/95">
            <li>Jan Aushadhi generics contain the <strong>same active ingredient in the same strength</strong> and are quality-tested by PMBI, but switching any prescribed medicine is a decision for <strong>your doctor or pharmacist</strong> — not an app.</li>
            <li>Never stop a heart, BP, diabetes, thyroid, seizure or psychiatric medicine on your own.</li>
            <li>If prices differ between what you see here and the shop shelf, the shelf MRP wins — report errors to PMBI helpline 1800-180-8080.</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-pine-100 bg-white p-4 md:col-span-2">
          <p className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-pine-700">
            <FileText size={16} /> How to read this page
          </p>
          <ul className="mt-2 space-y-1.5 text-[0.8rem] text-pine-700">
            <li className="flex items-start gap-1.5"><BadgeCheck size={14} className="mt-0.5 shrink-0 text-leaf-600" /><span><strong>₹/unit</strong> = price of one tablet/capsule/sachet — the fairest way to compare packs of different sizes.</span></li>
            <li className="flex items-start gap-1.5"><FlaskConical size={14} className="mt-0.5 shrink-0 text-pine-500" /><span>Rows compare only identical ingredient + strength + form. Different strength = different product.</span></li>
            <li className="flex items-start gap-1.5"><Info size={14} className="mt-0.5 shrink-0 text-pine-400" /><span>“Verified” is the date this price was checked against its source.</span></li>
          </ul>
        </div>
      </div>

      {/* ── alternatives in same category ─────────────────────── */}
      {alternatives.length > 0 && (
        <div className="mt-6">
          <h2 className="font-display text-lg font-semibold text-pine-950">Other medicines in {medicine.category}</h2>
          <p className="text-[0.75rem] text-pine-500">Different formulations — not substitutes for this prescription.</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {alternatives.map((a) => (
              <Link key={a.id} to={`/medicine/${a.id}`} className="focus-ring rounded-xl border border-pine-100 bg-white px-3 py-2 text-[0.8rem] font-semibold text-pine-800 shadow-sm hover:border-pine-300">
                {a.composition}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
