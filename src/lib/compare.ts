/**
 * AIMAN price comparison & savings.
 *
 * SAFETY RULES enforced here:
 *  • Savings are computed ONLY for the identical product scope: same active
 *    ingredient set, same strength, same dosage form. A 60,000 IU softgel is
 *    never compared with a 50 mcg daily tablet.
 *  • Savings are reported per pack and per unit, against the cheapest brand
 *    equivalent AND against the average of available brand MRPs — never against
 *    an imaginary "MRP".
 *  • Anything without a verified Jan Aushadhi record yields `null` savings,
 *    not a guess.
 */

import type { Medicine } from "../data/medicines.ts";

export interface PriceRow {
  kind: "brand" | "jan-aushadhi" | "nlem-ceiling";
  label: string;
  manufacturer?: string;
  packSize: number;
  packPrice: number;
  perUnit: number;
  mrp: boolean;
  source: string;
  verified: string;
  drugCode?: string;
}

export function buildPriceRows(med: Medicine): PriceRow[] {
  const rows: PriceRow[] = [];
  for (const b of med.brands) {
    rows.push({
      kind: "brand",
      label: b.brand,
      manufacturer: b.manufacturer,
      packSize: b.packSize,
      packPrice: b.packPrice,
      perUnit: b.perUnit,
      mrp: b.mrp,
      source: b.source,
      verified: b.verified,
    });
  }
  if (med.janAushadhi) {
    rows.push({
      kind: "jan-aushadhi",
      label: "Jan Aushadhi generic",
      packSize: med.janAushadhi.packSize,
      packPrice: med.janAushadhi.packPrice,
      perUnit: med.janAushadhi.perUnit,
      mrp: true,
      source: med.janAushadhi.source,
      verified: med.janAushadhi.verified,
      drugCode: med.janAushadhi.drugCode,
    });
  }
  if (med.nlemCeilingPerUnit != null) {
    rows.push({
      kind: "nlem-ceiling",
      label: "NLEM / DPCO ceiling price",
      packSize: 1,
      packPrice: med.nlemCeilingPerUnit,
      perUnit: med.nlemCeilingPerUnit,
      mrp: false,
      source: "NPPA — DPCO ceiling price (NLEM scheduled formulation)",
      verified: "2026-09-01",
    });
  }
  return rows;
}

export interface SavingsSummary {
  /** per-unit price of the cheapest available brand equivalent */
  cheapestBrandPerUnit: number | null;
  cheapestBrandName: string | null;
  avgBrandPerUnit: number | null;
  janAushadhiPerUnit: number | null;
  /** savings vs average brand MRP, per 30-unit month */
  monthlySavings: number | null;
  /** savings vs average brand MRP, per year (30 units/month assumption is shown) */
  annualSavings: number | null;
  /** fractional savings vs average brand, e.g. 0.82 = 82% */
  vsAverageFraction: number | null;
  vsCheapestBrandFraction: number | null;
  hasComparable: boolean;
  note: string;
}

const ASSUMED_UNITS_PER_MONTH = 30;

export function computeSavings(med: Medicine): SavingsSummary {
  if (!med.janAushadhi || med.brands.length === 0) {
    return {
      cheapestBrandPerUnit: med.brands[0]?.perUnit ?? null,
      cheapestBrandName: med.brands[0]?.brand ?? null,
      avgBrandPerUnit: null,
      janAushadhiPerUnit: med.janAushadhi?.perUnit ?? null,
      monthlySavings: null,
      annualSavings: null,
      vsAverageFraction: null,
      vsCheapestBrandFraction: null,
      hasComparable: false,
      note: med.janAushadhi
        ? "No comparable brand MRP on file for this exact strength/form — showing Jan Aushadhi price only."
        : "No Jan Aushadhi entry on file for this exact strength/form.",
    };
  }
  const perUnits = med.brands.map((b) => b.perUnit);
  const minU = Math.min(...perUnits);
  const avgU = perUnits.reduce((a, b) => a + b, 0) / perUnits.length;
  const jaU = med.janAushadhi.perUnit;
  const cheapestBrand = med.brands.find((b) => b.perUnit === minU)!;

  const monthlySavings = (avgU - jaU) * ASSUMED_UNITS_PER_MONTH;
  return {
    cheapestBrandPerUnit: minU,
    cheapestBrandName: cheapestBrand.brand,
    avgBrandPerUnit: avgU,
    janAushadhiPerUnit: jaU,
    monthlySavings,
    annualSavings: monthlySavings * 12,
    vsAverageFraction: (avgU - jaU) / avgU,
    vsCheapestBrandFraction: (minU - jaU) / minU,
    hasComparable: true,
    note: `Assumes ${ASSUMED_UNITS_PER_MONTH} units/month of the same ingredient, strength and form. Savings vs average brand MRP.`,
  };
}

export function formatINR(n: number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: n < 10 ? 2 : 0 }).format(n);
}

export function formatINR2(n: number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

/** savings across a whole basket of medicines (for scan-confirm flow) */
export function computeBasketSavings(meds: Medicine[]): {
  totalBrandMonthly: number;
  totalJAMonthly: number;
  monthlySavings: number;
  allComparable: boolean;
} {
  let totalBrand = 0;
  let totalJA = 0;
  let allComparable = true;
  for (const m of meds) {
    if (!m.janAushadhi || m.brands.length === 0) { allComparable = false; continue; }
    const avgBrand = m.brands.reduce((a, b) => a + b.perUnit, 0) / m.brands.length;
    totalBrand += avgBrand * ASSUMED_UNITS_PER_MONTH;
    totalJA += m.janAushadhi.perUnit * ASSUMED_UNITS_PER_MONTH;
  }
  return {
    totalBrandMonthly: totalBrand,
    totalJAMonthly: totalJA,
    monthlySavings: totalBrand - totalJA,
    allComparable,
  };
}
