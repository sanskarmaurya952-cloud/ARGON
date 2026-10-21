/** Comparable alternatives by therapeutic category — same category only, NOT substitutes. */
import { MEDICINES, type Medicine } from "../data/medicines.ts";

export function comparableAlternatives(med: Medicine): Medicine[] {
  return MEDICINES.filter((m) => m.id !== med.id && m.category === med.category).slice(0, 4);
}
