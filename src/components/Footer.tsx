import { Link } from "react-router-dom";
import { HeartHandshake, ShieldAlert, ExternalLink, Phone } from "lucide-react";
import { KENDRA_HELPLINE, KENDRA_LOCATOR_URL } from "../data/kendras";

export default function Footer() {
  return (
    <footer className="border-t border-pine-800 bg-pine-950 text-cream-100">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <img src="/favicon.svg" alt="" className="h-8 w-8" />
              <span className="font-display text-xl font-semibold text-cream-50">AIMAN</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-pine-100">
              <span className="font-semibold text-marigold-300">AI Medicine Affordability Network.</span> A safety-first
              companion that helps Indian families compare brand vs generic vs Jan Aushadhi prices, scan prescriptions with OCR + Gemma&nbsp;4,
              and find nearby PMBJP Kendras.
            </p>
            <a href={`tel:${KENDRA_HELPLINE}`} className="focus-ring mt-3 inline-flex items-center gap-2 rounded-lg bg-pine-800 px-3 py-2 text-sm font-semibold text-marigold-300 hover:bg-pine-700">
              <Phone size={15} /> Jan Aushadhi helpline: {KENDRA_HELPLINE}
            </a>
          </div>
          <div className="text-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-pine-300">Product</h3>
            <ul className="mt-2 space-y-1.5">
              <li><Link className="focus-ring hover:text-cream-50" to="/">Search medicines</Link></li>
              <li><Link className="focus-ring hover:text-cream-50" to="/scan">Scan medicine list (OCR + Gemma 4)</Link></li>
              <li><Link className="focus-ring hover:text-cream-50" to="/kendras">Nearby Jan Aushadhi Kendras</Link></li>
              <li><Link className="focus-ring hover:text-cream-50" to="/my-list">My medicine list & savings</Link></li>
              <li><Link className="focus-ring hover:text-cream-50" to="/settings">Gemma 4 & voice settings</Link></li>
            </ul>
          </div>
          <div className="text-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-pine-300">Data sources</h3>
            <ul className="mt-2 space-y-1.5 text-pine-100">
              <li>PMBJP Jan Aushadhi MRP list — <a className="focus-ring inline-flex items-center gap-1 text-marigold-300 hover:underline" href={KENDRA_LOCATOR_URL} target="_blank" rel="noreferrer">janaushadhi.gov.in <ExternalLink size={11} /></a></li>
              <li>NPPA / NLEM — DPCO ceiling prices</li>
              <li>Indicative brand MRPs — labelled with verified dates in-app</li>
              <li>Kendra locations — PMBJP directory & OpenStreetMap (live)</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-marigold-700/40 bg-pine-900/60 p-4">
          <p className="flex items-start gap-2 text-xs leading-relaxed text-marigold-200">
            <ShieldAlert size={16} className="mt-0.5 shrink-0" />
            <span>
              AIMAN is an informational affordability tool. It does <strong>not</strong> diagnose, prescribe, or recommend
              substitutions. A generic substitute may only be taken after your doctor or pharmacist confirms it is
              appropriate for you. Prices shown are labelled indicative MRPs with last-verified dates; shelf prices vary.
              Jan Aushadhi stock is never claimed — always call the kendra or {KENDRA_HELPLINE} to confirm availability.
            </span>
          </p>
        </div>

        <div className="mt-6 flex flex-col items-start justify-between gap-3 border-t border-pine-800 pt-4 text-xs text-pine-300 sm:flex-row sm:items-center">
          <p>© 2026 AIMAN · Built for the hackathon · MIT licensed · Open source</p>
          <p className="flex items-center gap-1.5">
            Made with care for India's medicine buyers <HeartHandshake size={13} className="text-marigold-400" />
          </p>
        </div>
      </div>
    </footer>
  );
}
