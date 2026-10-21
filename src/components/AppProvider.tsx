import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AppContext, type AppContextValue } from "../lib/context";
import type { Lang } from "../lib/i18n";
import { MEDICINES, type Medicine } from "../data/medicines.ts";

const LANG_KEY = "aiman.lang";
const LIST_KEY = "aiman.list.v1";

/** Language + medicine-list state, persisted on-device only (localStorage). */
export default function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    try {
      return (localStorage.getItem(LANG_KEY) as Lang) || "en";
    } catch {
      return "en";
    }
  });
  const [listIds, setListIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(LIST_KEY);
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch { /* ignore quota/private-mode errors */ }
  }, [lang]);
  useEffect(() => {
    try {
      localStorage.setItem(LIST_KEY, JSON.stringify(listIds));
    } catch { /* ignore quota/private-mode errors */ }
  }, [listIds]);

  const value = useMemo<AppContextValue>(() => {
    const list = listIds
      .map((id) => MEDICINES.find((m) => m.id === id))
      .filter((m): m is Medicine => Boolean(m));
    return {
      lang,
      setLang: setLangState,
      listIds,
      addToList: (id) => setListIds((prev) => (prev.includes(id) ? prev : [...prev, id])),
      removeFromList: (id) => setListIds((prev) => prev.filter((x) => x !== id)),
      clearList: () => setListIds([]),
      inList: (id) => listIds.includes(id),
      list,
    };
  }, [lang, listIds]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
