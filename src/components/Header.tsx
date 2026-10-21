import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { Home, ScanText, MapPin, BookOpen, Settings, ClipboardList, Languages, Menu, X, ShieldCheck } from "lucide-react";
import { useApp } from "../lib/context";
import { t } from "../lib/i18n";
import { cn } from "../lib/cn";

export default function Header() {
  const { lang, setLang, listIds } = useApp();
  const [open, setOpen] = useState(false);

  const nav = [
    { to: "/", label: t("home", lang), icon: Home },
    { to: "/scan", label: t("scanMedicineList", lang), icon: ScanText },
    { to: "/kendras", label: t("nearbyKendras", lang), icon: MapPin },
    { to: "/about", label: "About", icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-pine-100 bg-cream-50/92 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-3 sm:px-5">
        <Link to="/" className="focus-ring flex items-center gap-2.5 rounded-lg" aria-label="AIMAN home">
          <img src="/favicon.svg" alt="AIMAN logo" className="h-9 w-9" />
          <span className="leading-tight">
            <span className="font-display block text-[1.35rem] font-semibold tracking-tight text-pine-900">AIMAN</span>
            <span className="hidden text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-terracotta-500 min-[420px]:block">
              {t("appTagline", lang)}
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                cn(
                  "focus-ring flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-pine-800 transition-colors hover:bg-pine-50",
                  isActive && "bg-pine-800 text-cream-50 hover:bg-pine-800"
                )
              }
            >
              <Icon size={16} strokeWidth={2.2} />
              {label}
            </NavLink>
          ))}
          <NavLink
            to="/my-list"
            className={({ isActive }) =>
              cn(
                "focus-ring relative flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-pine-800 transition-colors hover:bg-pine-50",
                isActive && "bg-pine-800 text-cream-50 hover:bg-pine-800"
              )
            }
          >
            <ClipboardList size={16} strokeWidth={2.2} />
            My List
            {listIds.length > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-marigold-400 px-1 text-[0.65rem] font-bold text-pine-950">
                {listIds.length}
              </span>
            )}
          </NavLink>
          <NavLink
            to="/settings"
            aria-label="Settings"
            className={({ isActive }) =>
              cn(
                "focus-ring rounded-lg p-2.5 text-pine-800 transition-colors hover:bg-pine-50",
                isActive && "bg-pine-800 text-cream-50 hover:bg-pine-800"
              )
            }
          >
            <Settings size={18} />
          </NavLink>
          <button
            onClick={() => setLang(lang === "en" ? "hi" : "en")}
            className="focus-ring ml-1 flex min-h-11 items-center gap-1.5 rounded-lg border border-pine-200 bg-cream-50 px-3 text-sm font-bold text-pine-900 transition-colors hover:border-pine-400"
            aria-label="Switch language between English and Hindi"
          >
            <Languages size={16} />
            {lang === "en" ? "हिं" : "EN"}
          </button>
        </nav>

        <div className="flex items-center gap-1 md:hidden">
          <button
            onClick={() => setLang(lang === "en" ? "hi" : "en")}
            className="focus-ring flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-pine-200 font-bold text-pine-900"
            aria-label="Switch language"
          >
            {lang === "en" ? "हिं" : "EN"}
          </button>
          <Link
            to="/my-list"
            className="focus-ring relative flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-pine-200 text-pine-900"
            aria-label={`My list, ${listIds.length} medicines`}
          >
            <ClipboardList size={19} />
            {listIds.length > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-marigold-400 px-1 text-[0.65rem] font-bold text-pine-950">
                {listIds.length}
              </span>
            )}
          </Link>
          <button
            onClick={() => setOpen((v) => !v)}
            className="focus-ring flex min-h-11 min-w-11 items-center justify-center rounded-lg text-pine-900"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-pine-100 bg-cream-50 md:hidden">
          <nav className="mx-auto grid max-w-6xl grid-cols-2 gap-2 p-4" aria-label="Mobile">
            {[...nav, { to: "/my-list", label: `My List (${listIds.length})`, icon: ClipboardList }, { to: "/settings", label: "Settings", icon: Settings }].map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "focus-ring flex min-h-14 items-center gap-2.5 rounded-xl border border-pine-100 px-4 text-sm font-semibold text-pine-900",
                    isActive ? "border-pine-800 bg-pine-800 text-cream-50" : "bg-cream-50"
                  )
                }
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
          </nav>
          <p className="flex items-center justify-center gap-1.5 border-t border-pine-100 px-4 pb-3 pt-2 text-center text-[0.68rem] text-pine-500">
            <ShieldCheck size={12} /> Informational only — confirm medicines with your doctor or pharmacist.
          </p>
        </div>
      )}
    </header>
  );
}
