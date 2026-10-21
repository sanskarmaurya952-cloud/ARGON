/**
 * AIMAN — app context: language, saved medicine basket ("My List").
 * Provider component lives in ../components/AppProvider.tsx so this file holds
 * only hooks/types (keeps React fast-refresh happy).
 */
import { createContext, useContext } from "react";
import type { Lang } from "./i18n";
import type { Medicine } from "../data/medicines.ts";

export interface AppContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  listIds: string[];
  addToList: (id: string) => void;
  removeFromList: (id: string) => void;
  clearList: () => void;
  inList: (id: string) => boolean;
  list: Medicine[];
}

export const AppContext = createContext<AppContextValue | null>(null);

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
}
