import { Link } from "react-router-dom";
import {
  ShieldCheck, Search, ScanText, Store, Languages, Database, Cpu, FlaskConical,
  BadgeCheck, CircleAlert, ArrowRight, XCircle,
} from "lucide-react";

const QA = [
  {
    icon: Search, q: "How does fuzzy search avoid wrong medicines?", a: "AIMAN normalises your text (typos, µ/mcg, tab/tablet), then runs token-level trigram + Damerau-Levenshtein similarity. Strength and dosage form are hard filters — a query for “Paracetamol 500” can never return the 650 mg tablet, and a one-salt query is penalised when shown a combination. You always see the exact composition before tapping through.",
  },
  {
    icon: ScanText, q: "What does Gemma 4 actually do?", a: "Only one job: read the raw OCR text of a prescription and return structured medicine candidates (name, strength, form, confidence). It never diagnoses, never suggests switches, never invents prices. When Gemma 4 isn’t configured, a clearly-labelled deterministic heuristic does the same job — weaker, and honestly labelled as such.",
  },
  {
    icon: Database, q: "Where do prices come from?", a: "Jan Aushadhi MRPs from the PMBJP product list (janaushadhi.gov.in); NLEM/DPCO ceiling prices from the National Pharmaceutical Pricing Authority; brand prices are indicative retail MRPs each tagged with a source and a verified date. Real shelf prices vary by city and pharmacy — the app tells you this wherever a price appears.",
  },
  {
    icon: Store, q: "Why doesn’t AIMAN show kendra stock?", a: "Because public, machine-readable live inventory for 20,000+ Kendras does not exist. Any app claiming real-time kendra stock is fabricating it. AIMAN shows verified locations, map links and the PMBJP helpline (1800-180-8080) so you can confirm stock in one phone call.",
  },
  {
    icon: Languages, q: "हिन्दी support?", a: "The interface toggle (हिं/EN) switches UI copy and your voice-search language (hi-IN / en-IN). The OCR engine reads Devanagari script too (eng+hin). Medicine names stay in their printed form, as doctors write them.",
  },
  {
    icon: FlaskConical, q: "Is AIMAN a pharmacy?", a: "No. AIMAN sells nothing, stores nothing you type, and has no backend. It is an information layer between prescriptions and prices. Buy only through a PMBJP kendra or a licensed pharmacy, after your doctor or pharmacist confirms any change.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 md:py-8">
      <p className="flex items-center gap-2 text-[0.7rem] font-bold uppercase tracking-[0.16em] text-terracotta-500"><BadgeCheck size={12} /> About AIMAN</p>
      <h1 className="font-display mt-1 text-3xl font-semibold leading-tight text-pine-950">India buys 70% of its medicines out-of-pocket.<br />AIMAN makes sure nobody overpays.</h1>

      <p className="mt-4 max-w-2xl text-[0.95rem] leading-relaxed text-pine-800">
        India’s out-of-pocket health spending is among the highest in the world, and a large slice of it is the <em>price gap</em> between
        branded and generic medicines. The Jan Aushadhi network exists to close that gap — 20,000+ Kendras selling quality-tested generics at
        50–90% less. The problem was never policy. The problem was <strong>information</strong>: which salt is my “Dolo 650”, what does the kendra
        charge for it, and where is the nearest one? AIMAN answers all three questions in under ten seconds.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {[
          { icon: Search, stat: "46", label: "formulations with source-tagged prices, strength-matched" },
          { icon: Cpu, stat: "Gemma 4", label: "open (Apache-2.0) model reading prescriptions — 2 Apr 2026 release" },
          { icon: ShieldCheck, stat: "Zero", label: "accounts, ads, servers or fabricated prices in this app" },
        ].map((s, i) => (
          <div key={i} className="rounded-2xl border border-pine-100 bg-white p-4 text-center shadow-sm">
            <s.icon size={22} className="mx-auto text-terracotta-500" />
            <p className="font-display mt-2 text-2xl font-semibold text-pine-950">{s.stat}</p>
            <p className="mt-1 text-[0.72rem] leading-snug text-pine-600">{s.label}</p>
          </div>
        ))}
      </div>

      <h2 className="font-display mt-8 text-2xl font-semibold text-pine-950">How it works — honestly</h2>
      <div className="mt-3 space-y-2">
        {QA.map((item, i) => (
          <details key={i} className="group rounded-2xl border border-pine-100 bg-white open:border-pine-300">
            <summary className="flex cursor-pointer select-none items-center gap-3 px-4 py-4 font-bold text-pine-950">
              <item.icon size={19} className="shrink-0 text-pine-500 transition-colors group-open:text-terracotta-500" />
              {item.q}
              <ArrowRight size={16} className="ml-auto shrink-0 rotate-90 text-pine-400 transition-transform group-open:rotate-[-90deg]" />
            </summary>
            <div className="border-t border-pine-100 px-4 py-3 text-[0.85rem] leading-relaxed text-pine-700">{item.a}</div>
          </details>
        ))}
      </div>

      <h2 className="font-display mt-8 flex items-center gap-2 text-2xl font-semibold text-pine-950"><XCircle size={20} className="text-terracotta-500" /> What AIMAN will never do</h2>
      <ul className="mt-3 grid gap-2 text-[0.85rem] text-pine-800 sm:grid-cols-2">
        {[
          "Diagnose an illness or interpret symptoms",
          "Tell you to stop or switch a prescribed medicine",
          "Invent a price, a discount, or a saving %",
          "Claim live kendra stock without an inventory feed",
          "Store your prescription or phone number on a server",
          "Pretend Gemma 4 is connected when it isn’t — Settings always shows the true runtime",
        ].map((s, i) => (
          <li key={i} className="flex items-start gap-2 rounded-xl border border-marigold-300 bg-marigold-100/50 p-3"><CircleAlert size={15} className="mt-0.5 shrink-0 text-marigold-700" />{s}</li>
        ))}
      </ul>

      <h2 className="font-display mt-8 text-2xl font-semibold text-pine-950">Sources & references</h2>
      <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[0.85rem] text-pine-800">
        <li>Pradhan Mantri Bhartiya Janaushadhi Pariyojana (PMBJP) — product MRP list & Kendra locator, janaushadhi.gov.in (accessed Oct 2026)</li>
        <li>National Pharmaceutical Pricing Authority — ceiling prices of scheduled formulations (Drugs Price Control Order)</li>
        <li>NLEM 2022 — National List of Essential Medicines</li>
        <li>Gemma 4 Technical Report & model cards — ai.google.dev/gemma (Google DeepMind, April 2026)</li>
        <li>OpenStreetMap contributors + Nominatim/Overpass APIs for live kendra discovery</li>
      </ul>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/scan" className="focus-ring flex h-14 items-center gap-2 rounded-2xl bg-marigold-400 px-6 font-extrabold text-pine-950 shadow-[0_4px_0_0_#7a4a0d] hover:translate-y-0.5 hover:shadow-none"><ScanText size={19} /> Try the prescription scanner</Link>
        <Link to="/kendras" className="focus-ring flex h-14 items-center gap-2 rounded-2xl border-2 border-pine-800 px-6 font-extrabold text-pine-900 hover:bg-pine-50"><Store size={19} /> Find a Jan Aushadhi Kendra</Link>
      </div>
    </div>
  );
}
