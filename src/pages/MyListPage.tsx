import { Link, useNavigate } from "react-router-dom";
import {
  ClipboardList, Trash2, Printer, Store, PiggyBank, ArrowRight, ShieldCheck, SearchX, Pill,
} from "lucide-react";
import { useApp } from "../lib/context";
import { computeBasketSavings, computeSavings, formatINR, formatINR2 } from "../lib/compare";

export default function MyListPage() {
  const { list, removeFromList, clearList } = useApp();
  const navigate = useNavigate();
  const basket = computeBasketSavings(list);

  const printList = () => window.print();

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 md:py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-[0.7rem] font-bold uppercase tracking-[0.16em] text-terracotta-500"><ClipboardList size={12} /> My medicine list</p>
          <h1 className="font-display mt-1 text-3xl font-semibold text-pine-950">Your savings basket</h1>
          <p className="mt-1 text-sm text-pine-600">Saved on this device only — show this page at the kendra counter or print it.</p>
        </div>
        {list.length > 0 && (
          <button onClick={printList} className="focus-ring flex h-12 items-center gap-2 rounded-2xl border-2 border-pine-800 px-4 text-sm font-extrabold text-pine-900 hover:bg-pine-50">
            <Printer size={18} /> Print / Save PDF
          </button>
        )}
      </div>

      {/* savings hero */}
      {list.length > 0 && (
        <div className="mt-5 grid gap-4 overflow-hidden rounded-3xl border border-leaf-700 bg-leaf-700 text-cream-50 sm:grid-cols-3">
          <div className="p-5">
            <p className="text-[0.68rem] font-bold uppercase tracking-wider text-leaf-200">Brand basket / month*</p>
            <p className="font-display mt-1 text-2xl font-semibold tabular-nums">{formatINR(basket.totalBrandMonthly)}</p>
          </div>
          <div className="border-t border-leaf-600 p-5 sm:border-l sm:border-t-0">
            <p className="text-[0.68rem] font-bold uppercase tracking-wider text-leaf-200">Jan Aushadhi basket*</p>
            <p className="font-display mt-1 text-2xl font-semibold tabular-nums">{formatINR(basket.totalJAMonthly)}</p>
          </div>
          <div className="border-t border-leaf-600 bg-leaf-800 p-5 sm:border-l sm:border-t-0">
            <p className="flex items-center gap-1.5 text-[0.68rem] font-bold uppercase tracking-wider text-marigold-300"><PiggyBank size={13} /> You could save / month</p>
            <p className="font-display mt-1 text-3xl font-bold tabular-nums text-marigold-300">{formatINR(basket.monthlySavings)}</p>
          </div>
        </div>
      )}

      {/* items */}
      {list.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-pine-200 bg-cream-50 px-6 py-16 text-center">
          <SearchX size={42} className="mx-auto text-pine-300" />
          <h2 className="font-display mt-3 text-xl font-semibold text-pine-900">Your list is empty</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-pine-600">Search a medicine or scan your prescription — confirmed medicines land here with Jan Aushadhi pricing.</p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <button onClick={() => navigate("/search")} className="focus-ring flex h-12 items-center gap-2 rounded-2xl bg-pine-800 px-5 font-bold text-cream-50 hover:bg-pine-700">Search medicines <ArrowRight size={16} /></button>
            <button onClick={() => navigate("/scan")} className="focus-ring flex h-12 items-center gap-2 rounded-2xl border-2 border-pine-800 px-5 font-bold text-pine-900 hover:bg-pine-50">Scan list <ArrowRight size={16} /></button>
          </div>
        </div>
      ) : (
        <>
          <ul className="mt-5 divide-y divide-pine-100 overflow-hidden rounded-3xl border border-pine-100 bg-white shadow-[0_2px_0_0_rgba(15,45,35,0.08)]">
            {list.map((m) => {
              const s = computeSavings(m);
              return (
                <li key={m.id} className="flex items-center gap-3 p-4">
                  <Pill size={20} className="shrink-0 text-pine-400" />
                  <div className="min-w-0 flex-1">
                    <Link to={`/medicine/${m.id}`} className="focus-ring block rounded font-bold text-pine-950 hover:text-terracotta-600">{m.composition}</Link>
                    <p className="text-[0.7rem] text-pine-500">
                      {m.form} · {m.rx ? m.schedule : "OTC"} ·{" "}
                      {m.janAushadhi ? <span className="font-semibold text-leaf-700">JA {formatINR2(m.janAushadhi.perUnit)}/unit · code {m.janAushadhi.drugCode}</span> : <span className="text-pine-400">no JA price on file</span>}
                      {s.vsAverageFraction != null && <span className="font-semibold text-leaf-700"> · save {Math.round(s.vsAverageFraction * 100)}%</span>}
                    </p>
                  </div>
                  <button onClick={() => removeFromList(m.id)} className="focus-ring shrink-0 rounded-xl p-3 text-pine-400 hover:bg-cream-100 hover:text-terracotta-600" aria-label={`Remove ${m.composition} from list`}>
                    <Trash2 size={19} />
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="max-w-md text-[0.72rem] leading-snug text-pine-500">
              *Assumes 30 units per medicine per month of the identical formulation, compared with the average brand MRP on file.
              {!basket.allComparable && " Some entries lack a comparable JA price and are excluded from totals."} Confirm switching with your doctor/pharmacist.
            </p>
            <button onClick={clearList} className="focus-ring flex h-11 items-center gap-1.5 rounded-xl px-3 text-xs font-bold text-pine-500 hover:text-terracotta-600">
              <Trash2 size={14} /> Clear list
            </button>
          </div>

          <Link to="/kendras" className="focus-ring mt-4 flex h-16 items-center justify-center gap-2 rounded-2xl bg-pine-800 text-base font-extrabold text-cream-50 shadow-[0_4px_0_0_#071f16] hover:translate-y-0.5 hover:shadow-none">
            <Store size={21} /> Find your nearest Jan Aushadhi Kendra <ArrowRight size={18} />
          </Link>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[0.72rem] font-medium text-pine-500"><ShieldCheck size={13} /> Prices verified as of dates shown on each medicine page — confirm at the counter.</p>
        </>
      )}
    </div>
  );
}
