import { Store, ShieldCheck, FlaskConical, Info, BadgeIndianRupee } from "lucide-react";
import type { Medicine } from "../data/medicines";
import { buildPriceRows, computeSavings, formatINR, formatINR2, type PriceRow } from "../lib/compare";
import { cn } from "../lib/cn";

function Row({ row }: { row: PriceRow }) {
  const isJA = row.kind === "jan-aushadhi";
  const isCeiling = row.kind === "nlem-ceiling";
  return (
    <tr className={cn("border-b border-pine-50 last:border-0", isJA && "bg-leaf-600/[0.06]")}>
      <td className="py-2.5 pl-3 pr-2 align-top sm:pl-4">
        <span className="flex items-center gap-1.5 text-sm font-semibold text-pine-950">
          {isJA && <Store size={14} className="shrink-0 text-leaf-700" />}
          {isCeiling && <ShieldCheck size={14} className="shrink-0 text-pine-500" />}
          {!isJA && !isCeiling && <FlaskConical size={14} className="shrink-0 text-pine-400" />}
          {row.label}
        </span>
        {row.manufacturer && <span className="ml-5 block text-[0.7rem] text-pine-500">{row.manufacturer}</span>}
        {row.drugCode && <span className="ml-5 block text-[0.7rem] text-leaf-700">Jan Aushadhi drug code {row.drugCode}</span>}
      </td>
      <td className="whitespace-nowrap py-2.5 pr-2 align-top text-sm text-pine-800">{row.packSize} × {row.kind === "nlem-ceiling" ? "unit" : "units"}</td>
      <td className="whitespace-nowrap py-2.5 pr-2 align-top text-right text-sm font-bold tabular-nums text-pine-950">{formatINR2(row.perUnit)}</td>
      <td className="whitespace-nowrap py-2.5 pr-2 align-top text-right text-sm tabular-nums text-pine-800 max-sm:hidden">{formatINR(row.packPrice)}</td>
      <td className="py-2.5 pr-3 align-top text-right sm:pr-4">
        <span className="block text-[0.68rem] font-medium text-pine-500">{row.verified}</span>
      </td>
    </tr>
  );
}

export default function PriceTable({ medicine }: { medicine: Medicine }) {
  const rows = buildPriceRows(medicine);
  const savings = computeSavings(medicine);
  const brandRows = rows.filter((r) => r.kind === "brand");
  const jaRow = rows.find((r) => r.kind === "jan-aushadhi");
  const maxBrand = Math.max(...brandRows.map((r) => r.perUnit), 0);

  return (
    <section aria-labelledby="price-compare-heading" className="overflow-hidden rounded-2xl border border-pine-100 bg-white shadow-[0_2px_0_0_rgba(15,45,35,0.08)]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-pine-100 bg-pine-50/60 px-4 py-3">
        <h2 id="price-compare-heading" className="font-display flex items-center gap-2 text-base font-semibold text-pine-950">
          <BadgeIndianRupee size={18} className="text-marigold-600" /> Price comparison — same ingredient, strength & form
        </h2>
        <span className="text-[0.68rem] font-semibold uppercase tracking-wide text-pine-500">{medicine.strength} {medicine.form}</span>
      </div>

      {/* Savings hero */}
      {savings.hasComparable && savings.vsAverageFraction != null ? (
        <div className="grid grid-cols-2 gap-px bg-pine-100 sm:grid-cols-4">
          <div className="bg-cream-50 px-4 py-3">
            <p className="text-[0.62rem] font-bold uppercase tracking-wider text-pine-500">Avg brand MRP / unit</p>
            <p className="mt-0.5 text-lg font-extrabold tabular-nums text-pine-950">{formatINR2(savings.avgBrandPerUnit!)}</p>
          </div>
          <div className="bg-leaf-600 px-4 py-3">
            <p className="text-[0.62rem] font-bold uppercase tracking-wider text-leaf-100">Jan Aushadhi / unit</p>
            <p className="mt-0.5 text-lg font-extrabold tabular-nums text-white">{formatINR2(savings.janAushadhiPerUnit!)}</p>
          </div>
          <div className="bg-cream-50 px-4 py-3">
            <p className="text-[0.62rem] font-bold uppercase tracking-wider text-pine-500">You save / unit</p>
            <p className="mt-0.5 text-lg font-extrabold tabular-nums text-leaf-700">
              {formatINR2((savings.avgBrandPerUnit ?? 0) - (savings.janAushadhiPerUnit ?? 0))}
              <span className="ml-1 align-middle text-[0.68rem] font-bold text-leaf-600">−{Math.round(savings.vsAverageFraction * 100)}%</span>
            </p>
          </div>
          <div className="bg-cream-50 px-4 py-3">
            <p className="text-[0.62rem] font-bold uppercase tracking-wider text-pine-500">Est. / month*</p>
            <p className="mt-0.5 text-lg font-extrabold tabular-nums text-marigold-700">{formatINR(savings.monthlySavings!)}</p>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-2 bg-cream-100 px-4 py-3 text-xs text-pine-600">
          <Info size={14} className="mt-0.5 shrink-0" /> {savings.note}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-left">
          <thead>
            <tr className="border-b border-pine-100 text-[0.65rem] font-bold uppercase tracking-wider text-pine-500">
              <th className="py-2 pl-3 pr-2 sm:pl-4">Product</th>
              <th className="py-2 pr-2">Pack</th>
              <th className="py-2 pr-2 text-right">₹ / unit</th>
              <th className="py-2 pr-2 text-right max-sm:hidden">₹ / pack</th>
              <th className="py-2 pr-3 text-right sm:pr-4">Verified</th>
            </tr>
          </thead>
          <tbody>
            {brandRows.map((row) => <Row key={row.label} row={row} />)}
            {jaRow && <Row row={jaRow} />}
            {rows.filter((r) => r.kind === "nlem-ceiling").map((row) => <Row key={row.label} row={row} />)}
          </tbody>
        </table>
      </div>

      {/* visual bars */}
      {jaRow && brandRows.length > 0 && (
        <div className="border-t border-pine-100 px-4 py-4">
          {[...brandRows.slice(0, 4)].map((row) => (
            <div key={row.label} className="mb-1.5 flex items-center gap-2">
              <span className="w-28 truncate text-right text-[0.68rem] font-medium text-pine-600">{row.label}</span>
              <div className="h-4 flex-1 overflow-hidden rounded-full bg-cream-200">
                <div className="h-full rounded-full bg-terracotta-500/80" style={{ width: `${maxBrand ? (row.perUnit / maxBrand) * 100 : 0}%` }} />
              </div>
              <span className="w-14 text-[0.68rem] tabular-nums text-pine-500">{formatINR2(row.perUnit)}</span>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <span className="w-28 text-right text-[0.68rem] font-bold text-leaf-700">Jan Aushadhi</span>
            <div className="h-4 flex-1 overflow-hidden rounded-full bg-cream-200">
              <div className="h-full rounded-full bg-leaf-600" style={{ width: `${maxBrand ? Math.max((jaRow.perUnit / maxBrand) * 100, 3) : 3}%` }} />
            </div>
            <span className="w-14 text-[0.68rem] font-bold tabular-nums text-leaf-700">{formatINR2(jaRow.perUnit)}</span>
          </div>
        </div>
      )}

      <div className="border-t border-pine-100 bg-cream-100 px-4 py-2.5 text-[0.68rem] leading-snug text-pine-500">
        <p>*Monthly estimate assumes 30 units/month of the identical formulation. Brand prices are indicative MRPs (labelled); actual shelf prices vary by pharmacy and city — confirm at purchase. NLEM/DPCO ceiling shown where this formulation is scheduled. Jan Aushadhi availability varies by kendra.</p>
        <p className="mt-1">Sources: PMBJP Jan Aushadhi list (janaushadhi.gov.in), NPPA DPCO ceiling prices, and labelled retail MRPs. AIMAN never substitutes — switch only after your doctor/pharmacist agrees.</p>
      </div>
    </section>
  );
}
