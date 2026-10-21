import { Link } from "react-router-dom";
import {
  ScanText, ShieldCheck, Sparkles, Search,
  PiggyBank, BadgePercent, Store, ArrowRight, HeartPulse, Mic,
} from "lucide-react";
import SearchBar from "../components/SearchBar";
import { CATEGORIES, MEDICINE_COUNT } from "../data/medicines";
const QUICK_CHIPS = ["Dolo 650", "Glycomet", "Pan-D", "Atorvastatin", "shelcal", "Ecosprin 75"];

export default function Home() {

  return (
    <div>
      {/* ── trust ticker ─────────────────────────────────────────── */}
      <div className="overflow-hidden border-b border-pine-800 bg-pine-900 py-1.5 text-[0.7rem] font-semibold text-marigold-200" aria-hidden="true">
        <div className="animate-ticker flex w-max whitespace-nowrap">
          {[0, 1].map((n) => (
            <span key={n} className="flex">
              {[
                "20,149+ Jan Aushadhi Kendras across India (June 2026)",
                "Same medicine, up to 90% less — Jan Aushadhi generics",
                "Helpline 1800-180-8080 · janaushadhi.gov.in",
                "Every price in AIMAN carries a source + verified date",
                "OCR + Gemma 4: scan a prescription, confirm every line",
              ].map((s, i) => (
                <span key={i} className="mx-6">✦&nbsp; {s}</span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ── hero ─────────────────────────────────────────────────── */}
      <section className="texture-paper relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-6 px-4 pb-10 pt-8 sm:px-6 md:grid-cols-[1.05fr_1fr] md:gap-10 md:pb-16 md:pt-14">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-pine-200 bg-cream-50 py-1 pl-1 pr-3 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-pine-800 shadow-sm">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-marigold-400 text-[0.6rem] text-pine-950">AI</span>
              Made for India · Hackathon 2026
            </p>
            <h1 className="font-display mt-4 text-4xl font-semibold leading-[1.08] tracking-tight text-pine-950 sm:text-5xl xl:text-[3.6rem]">
              Same medicine.<br />
              <span className="relative inline-block text-pine-800">
                Honest price.
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 14" fill="none" aria-hidden="true">
                  <path d="M2 10c60-6 140-8 296-2" stroke="#edaa3f" strokeWidth="5" strokeLinecap="round" opacity="0.9"/>
                </svg>
              </span>
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-pine-700 sm:text-lg">
              Search any brand, generic or salt — compare pharmacy MRP with{" "}
              <strong className="text-leaf-700">Jan Aushadhi generics</strong>, scan your prescription with OCR +{" "}
              <strong>Gemma&nbsp;4</strong>, and find the nearest kendra.
            </p>

            <div className="mt-6 max-w-xl">
              <SearchBar size="lg" autoFocus />
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <span className="flex items-center gap-1 text-xs font-semibold text-pine-500"><Mic size={12} /> Try:</span>
                {QUICK_CHIPS.map((c) => (
                  <Link key={c} to={`/search?q=${encodeURIComponent(c)}`} className="focus-ring rounded-full border border-pine-200 bg-cream-50 px-2.5 py-1 text-xs font-semibold text-pine-800 transition-colors hover:border-marigold-400 hover:text-pine-950">
                    {c}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* hero artwork */}
          <div className="relative mx-auto w-full max-w-md md:max-w-none">
            <div className="absolute -left-3 -top-3 h-full w-full rounded-3xl border-2 border-marigold-400/60" aria-hidden="true" />
            <img
              src="/images/hero-pharmacy.png"
              alt="Illustration of an Indian Jan Aushadhi pharmacist helping a customer at the counter"
              className="relative aspect-[4/3] w-full rounded-3xl border border-pine-100 object-cover shadow-xl"
            />
            <div className="absolute -bottom-4 right-3 flex items-center gap-2 rounded-2xl border border-pine-100 bg-cream-50 py-2 pl-2 pr-4 shadow-lg">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-leaf-600/15">
                <PiggyBank size={20} className="text-leaf-700" />
              </span>
              <span className="text-left leading-tight">
                <span className="block text-[0.65rem] font-bold uppercase tracking-wide text-pine-500">Avg. saving</span>
                <span className="text-sm font-extrabold text-leaf-700">₹600–900 / month*</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── stats band ───────────────────────────────────────────── */}
      <section className="texture-pine border-y border-pine-800">
        <div className="mx-auto grid max-w-6xl grid-cols-2 divide-x divide-pine-800 px-4 sm:px-6 md:grid-cols-4">
          {[
            { v: "20,149+", l: "Jan Aushadhi Kendras (June 2026)" },
            { v: `${MEDICINE_COUNT}`, l: "Formulations compared in-app" },
            { v: "50–90%", l: "Typical generic vs brand saving" },
            { v: "0", l: "Accounts, ads or data selling" },
          ].map((s) => (
            <div key={s.l} className="px-3 py-5 text-center sm:px-6">
              <p className="font-display text-2xl font-semibold text-marigold-300 sm:text-3xl">{s.v}</p>
              <p className="mt-1 text-[0.68rem] font-medium uppercase tracking-wide text-pine-100 sm:text-[0.72rem]">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── action cards ─────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-semibold text-pine-950 sm:text-3xl">Three steps to a fair price</h2>
            <p className="mt-1 text-sm text-pine-600">Built for first-time smartphone users — big buttons, plain language, English & हिन्दी.</p>
          </div>
          <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-pine-400"><HeartPulse size={14} /> Works offline for catalogue search</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { n: "1", icon: Search, title: "Search or scan", body: "Type a brand (“Dolo 650”), a salt (“cetirizine”), or photograph the whole list — fuzzy search fixes typos safely.", to: "/search", cta: "Search now" },
            { n: "2", icon: BadgePercent, title: "Compare prices", body: "See brand MRP vs Jan Aushadhi generic for the exact strength & form, with sources and verified dates.", to: "/search?q=paracetamol", cta: "See an example" },
            { n: "3", icon: Store, title: "Find a kendra", body: "Locate the nearest Jan Aushadhi Kendra on the map. Call ahead — stock is never guaranteed by the app.", to: "/kendras", cta: "Locate kendra" },
          ].map((s) => (
            <Link key={s.n} to={s.to} className="focus-ring group relative overflow-hidden rounded-2xl border border-pine-100 bg-white p-5 shadow-[0_2px_0_0_rgba(15,45,35,0.08)] transition-all hover:-translate-y-1 hover:shadow-[0_16px_38px_-16px_rgba(15,45,35,0.4)]">
              <span className="font-display absolute -right-2 -top-4 text-[4.5rem] font-bold leading-none text-pine-50 transition-colors group-hover:text-marigold-100">{s.n}</span>
              <s.icon size={30} className="relative text-terracotta-500" strokeWidth={2} />
              <h3 className="font-display relative mt-3 text-xl font-semibold text-pine-950">{s.title}</h3>
              <p className="relative mt-1.5 text-sm leading-snug text-pine-700">{s.body}</p>
              <span className="relative mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-pine-800 group-hover:text-terracotta-600">{s.cta} <ArrowRight size={15} /></span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── scan feature spotlight ───────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 pb-10 sm:px-6 md:pb-14">
        <div className="grid overflow-hidden rounded-3xl border border-pine-800 bg-pine-900 shadow-xl md:grid-cols-2">
          <div className="halftone p-6 sm:p-8">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-marigold-300"><Sparkles size={13} /> New · AI feature</p>
            <h2 className="font-display mt-3 text-2xl font-semibold leading-tight text-cream-50 sm:text-3xl">Scan your prescription.<br />Check every line.</h2>
            <ul className="mt-4 space-y-2 text-sm text-pine-100">
              {[
                "In-browser OCR (Tesseract) reads English + Hindi prescriptions — image never leaves your phone until you confirm",
                "Gemma 4 (Google AI Studio or local Ollama) interprets messy handwriting into clean medicine candidates",
                "You review, edit and confirm every medicine — AIMAN never guesses a dose silently",
              ].map((s, i) => (
                <li key={i} className="flex items-start gap-2"><span className="mt-1 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-marigold-400 text-[0.6rem] font-black text-pine-950">{i + 1}</span>{s}</li>
              ))}
            </ul>
            <Link to="/scan" className="focus-ring mt-5 inline-flex h-14 items-center gap-2 rounded-2xl bg-marigold-400 px-6 text-base font-extrabold text-pine-950 shadow-[0_4px_0_0_#7a4a0d] transition-all hover:translate-y-0.5 hover:shadow-none">
              <ScanText size={20} /> Scan Medicine List
            </Link>
          </div>
          <div className="relative min-h-52">
            <img src="/images/pharmacy-stock.jpg" alt="Shelves of medicines at an Indian pharmacy" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-pine-900 via-pine-900/25 to-transparent md:bg-gradient-to-r" />
          </div>
        </div>
      </section>

      {/* ── popular categories ───────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
        <h2 className="font-display text-xl font-semibold text-pine-950">Browse by category</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <Link key={c} to={`/search?q=${encodeURIComponent(c.split(" &")[0])}`} className="focus-ring rounded-full border border-pine-200 bg-cream-50 px-4 py-2 text-sm font-semibold text-pine-800 transition-colors hover:border-pine-500 hover:bg-pine-50">
              {c}
            </Link>
          ))}
        </div>
        <p className="mt-6 flex max-w-2xl items-start gap-2 rounded-2xl border border-marigold-300 bg-marigold-100/60 p-4 text-xs leading-relaxed text-marigold-700">
          <ShieldCheck size={16} className="mt-0.5 shrink-0" />
          <span>
            <strong>Safety promise:</strong> AIMAN shows prices for the <em>exact same</em> ingredient, strength and form — never a
            “close enough” medicine. It cannot diagnose you, and it will never tell you to stop or switch a prescribed
            medicine. Only your doctor or pharmacist can do that. *Savings illustration: a family buying Dolo 650, Pan-D,
            Shelcal and Trypsin-class combinations monthly.
          </span>
        </p>
      </section>
    </div>
  );
}
