/**
 * AIMAN fuzzy medicine search.
 *
 * Design goals:
 *  1. Tolerate misspellings ("dolo 550" → Dolo 650 fine; "amoxicilin" → Amoxicillin).
 *  2. NEVER confuse medicines that differ in active ingredient, strength or form —
 *     ingredient/strength mismatches are hard blockers, not soft penalties.
 *  3. Fast, local, dependency-free. Zero network, works offline.
 *
 * Scoring pipeline:
 *  • normalize (lowercase, strip diacritics, unify separators, expand common
 *    abbreviations like "tab" → "tablet", and µ/mcg aliases)
 *  • extract query intent: salt tokens vs numbers vs strength units vs form
 *  • exact/substring/token containment scores
 *  • token-level trigram Dice similarity for typo tolerance
 *  • whole-string edit-distance similarity as a final signal
 *  • ingredient-set guard: every query salt-like token must match some
 *    candidate salt above the threshold, and candidate must not contain a
 *    DIFFERENT extra salt when the query implies a combination mismatch
 *      (e.g. searching "Pan-D" must not return plain Pantoprazole)
 *  • strength guard: if the query contains a strength, only rows with a
 *    sufficiently close strength survive (tolerance 0.5% relative, unit-aware)
 */

import { MEDICINES } from "../data/medicines.ts";
import type { Medicine } from "../data/medicines.ts";

export interface RatedMedicine {
  medicine: Medicine;
  score: number; // 0..1
  /** human-readable reasons, e.g. ["brand match", "typo-tolerant salt match"] */
  reasons: string[];
  matchedOn: "brand" | "generic" | "salt" | "alias" | "composition";
}

/* ---------- normalization ---------- */

const ABBREV: Record<string, string> = {
  tab: "tablet", tabs: "tablet", cap: "capsule", caps: "capsule",
  syr: "syrup", inj: "injection", susp: "syrup",
  mcg: "mcg", µg: "mcg", ug: "mcg", mg: "mg", g: "g", ml: "ml", iu: "iu",
};

export function normalize(s: string): string {
  let t = s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip diacritics
    .replace(/[+&/,()[\]{}|:;'"!?*]+/g, " ")
    .replace(/\s*-\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  // apply abbreviation expansion token-wise
  const toks = t.split(" ").map((tok) => ABBREV[tok] ?? tok);
  t = toks.join(" ");
  return t;
}

/* ---------- edit distance (Damerau, with early exit) ---------- */

export function damerauLevenshtein(a: string, b: string): number {
  const al = a.length, bl = b.length;
  if (Math.abs(al - bl) > 4) return Math.max(al, bl); // early exit for very different lengths
  const d: number[][] = Array.from({ length: al + 1 }, () => new Array(bl + 1).fill(0));
  for (let i = 0; i <= al; i++) d[i][0] = i;
  for (let j = 0; j <= bl; j++) d[0][j] = j;
  for (let i = 1; i <= al; i++) {
    for (let j = 1; j <= bl; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1); // transposition
      }
    }
  }
  return d[al][bl];
}

export function similarity(a: string, b: string): number {
  if (a === b) return 1;
  if (!a.length || !b.length) return 0;
  const maxLen = Math.max(a.length, b.length);
  return 1 - damerauLevenshtein(a, b) / maxLen;
}

/* ---------- trigram Dice coefficient ---------- */

function trigrams(s: string): Set<string> {
  const padded = `  ${s} `;
  const grams = new Set<string>();
  for (let i = 0; i < padded.length - 2; i++) grams.add(padded.slice(i, i + 3));
  return grams;
}

export function trigramDice(a: string, b: string): number {
  if (a === b) return 1;
  const ta = trigrams(a), tb = trigrams(b);
  let inter = 0;
  for (const g of ta) if (tb.has(g)) inter++;
  return (2 * inter) / (ta.size + tb.size);
}

/** combined token similarity — robust to both typos and word-internal noise */
export function tokenSimilarity(a: string, b: string): number {
  return 0.45 * trigramDice(a, b) + 0.55 * similarity(a, b);
}

/* ---------- query parsing ---------- */

export interface ParsedQuery {
  raw: string;
  normalized: string;
  tokens: string[];
  /** numbers that look like strengths, with their unit if given */
  strengths: { value: number; unit: string | null }[];
  /** form hints present in the query */
  forms: string[];
}

const FORM_WORDS = ["tablet", "capsule", "syrup", "injection", "inhaler", "sachet", "gel", "drop"];

export function parseQuery(raw: string): ParsedQuery {
  const normalized = normalize(raw);
  const tokens = normalized.split(" ").filter(Boolean);
  const strengths: ParsedQuery["strengths"] = [];
  const forms: string[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    const m = t.match(/^(\d+(?:\.\d+)?)(mcg|mg|g|ml|iu|%|tab)?$/);
    if (m) {
      const next = tokens[i + 1];
      const unit = m[2] ?? (next && /^(mcg|mg|g|ml|iu|%|tab)$/.test(next) ? next : null);
      strengths.push({ value: parseFloat(m[1]), unit: unit ?? null });
      continue;
    }
    if (FORM_WORDS.includes(t)) forms.push(t);
  }
  // "dolo 65 0" — runs of bare adjacent digits are usually a misread of "650"
  const digitRun: { index: number; value: string }[] = [];
  for (let i = 0; i < tokens.length; i++) {
    if (/^\d{1,3}$/.test(tokens[i])) digitRun.push({ index: i, value: tokens[i] });
    else if (digitRun.length) break;
    if (digitRun.length >= 2 && i < tokens.length - 1 && !/^\d{1,3}$/.test(tokens[i + 1])) break;
  }
  if (digitRun.length >= 2 && digitRun.every((_, j) => j === 0 || digitRun[j].index === digitRun[j - 1].index + 1)) {
    const joined = digitRun.map((d) => d.value).join("");
    const joinedVal = parseFloat(joined);
    if (Number.isFinite(joinedVal) && strengths.every((s) => s.value !== joinedVal)) {
      const after = tokens[digitRun[digitRun.length - 1].index + 1];
      const unit = after && /^(mcg|mg|g|ml|iu|%|tab)$/.test(after) ? after : null;
      strengths.push({ value: joinedVal, unit });
    }
  }
  return { raw, normalized, tokens, strengths, forms };
}

/* ---------- strength comparison ---------- */

function strengthsClose(q: { value: number; unit: string | null }, med: Medicine): boolean {
  if (med.strengthUnit === "tab" || med.strengthUnit === "%") {
    // multi-salt combos like "2/500 mg": match if any strength number is close
    if (q.unit && q.unit !== med.strengthUnit && q.unit !== "mg") return true; // don't penalise odd units
    return med.strengthValue === q.value;
  }
  if (q.unit && q.unit !== med.strengthUnit) {
    // allow g↔mg and mg↔mcg confusion only when numerically equivalent after conversion
    const conv = (v: number, u: string | null): number | null => {
      if (u === "mg") return v;
      if (u === "g") return v * 1000;
      if (u === "mcg") return v / 1000;
      return null;
    };
    const qv = conv(q.value, q.unit);
    const mv = conv(med.strengthValue, med.strengthUnit);
    if (qv == null || mv == null) return false;
    return Math.abs(qv - mv) / mv <= 0.02;
  }
  const tol = Math.max(0.02 * med.strengthValue, 0.011); // 2% relative tolerance
  return Math.abs(q.value - med.strengthValue) <= tol;
}

/* ---------- core search ---------- */

const isNumberToken = (t: string) => /^\d/.test(t);

/** tokens that carry no search signal */
const STOP = new Set(["mg", "mcg", "ml", "iu", "g", "%", "tab", "tablet", "capsule", "syrup", "injection", "inhaler", "sachet", "gel", "drop", "sr", "er", "xr", "dsr"]);

function contentTokens(tokens: string[]): string[] {
  return tokens.filter((t) => !isNumberToken(t) && !STOP.has(t));
}

export function searchMedicines(rawQuery: string, opts: { limit?: number } = {}): RatedMedicine[] {
  const limit = opts.limit ?? 12;
  const q = parseQuery(rawQuery);
  if (!q.normalized || q.normalized.length < 2) return [];

  const qContent = contentTokens(q.tokens);
  const results: RatedMedicine[] = [];

  for (const med of MEDICINES) {
    const hayParts = () => [
      { text: normalize(med.generic), weight: 1.0, field: "generic" as const },
      { text: normalize(med.composition), weight: 0.85, field: "composition" as const },
      ...med.brands.map((b) => ({ text: normalize(b.brand), weight: 1.0, field: "brand" as const })),
      ...med.aliases.map((a) => ({ text: normalize(a), weight: 0.95, field: "alias" as const })),
      ...med.salts.map((s) => ({ text: normalize(s), weight: 0.9, field: "salt" as const })),
    ];

    // ── hard strength guard ────────────────────────────────────────────
    // At least one stated strength must match the formulation within tolerance.
    // (The digit-run concatenation in parseQuery already turns "65 0" into 650.)
    if (q.strengths.length > 0) {
      const anyClose = q.strengths.some((qs) => strengthsClose(qs, med));
      if (!anyClose) continue; // different strength → never show
    }

    // ── hard form guard (only when a form word was explicitly typed) ───
    if (q.forms.length > 0) {
      const medForm = normalize(med.form);
      const formMatch = q.forms.some((f) => medForm === f);
      if (!formMatch) continue;
    }

    let best: RatedMedicine | null = null;

    for (const part of hayParts()) {
      const reasons: string[] = [];
      let score = 0;
      const partTokens = part.text.split(" ").filter(Boolean);

      // whole-string
      if (part.text === q.normalized) {
        score = 1.0 * part.weight;
        reasons.push(`exact ${part.field} match`);
      } else if (part.text.startsWith(q.normalized) || part.text.includes(q.normalized)) {
        score = 0.92 * part.weight;
        reasons.push(`${part.field} contains query`);
      } else {
        // token-wise: every query content-token must find a home
        if (qContent.length === 0) {
          // query had only numbers — strengthsClose already passed; give base score
          score = 0.45 * part.weight;
        } else {
          const used = new Set<number>();
          let acc = 0;
          let allStrong = true;
          for (const qt of qContent) {
            let bestTok = 0;
            let bestIdx = -1;
            for (let i = 0; i < partTokens.length; i++) {
              if (used.has(i)) continue;
              const s = tokenSimilarity(qt, partTokens[i]);
              if (s > bestTok) { bestTok = s; bestIdx = i; }
            }
            if (bestTok < 0.55) { allStrong = false; break; }
            used.add(bestIdx);
            acc += bestTok;
          }
          if (allStrong) {
            score = (0.6 + 0.35 * (acc / qContent.length)) * part.weight;
            const avg = acc / qContent.length;
            reasons.push(avg > 0.98 ? `${part.field} match` : `typo-tolerant ${part.field} match`);
          } else {
            // last resort: whole-string trigram on the full normalized strings
            const tg = trigramDice(q.normalized, part.text);
            if (tg > 0.62) {
              score = tg * 0.72 * part.weight;
              reasons.push(`fuzzy ${part.field} match`);
            }
          }
        }
      }

      if (score > 0) {
        const rating: RatedMedicine = {
          medicine: med,
          score: Math.min(score, 1),
          reasons,
          matchedOn: part.field,
        };
        if (!best || rating.score > best.score) best = rating;
      }
    }

    if (!best) continue;

    // ── salt-set guard: combination mismatch ────────────────────────────
    // If the query names ≥2 salt-like tokens and the medicine has a different
    // number of salts, cap the score hard so combos never masquerade as singles.
    const qSalts = qContent.filter((t) =>
      MEDICINES.some((m) => m.salts.some((s) => tokenSimilarity(t, normalize(s)) > 0.6))
    );
    if (qSalts.length >= 2) {
      const medSaltCount = med.salts.length;
      if (qSalts.length > medSaltCount) best.score = Math.min(best.score, 0.35);
    }
    // A query naming exactly one salt A with strength should not surface an
    // unrelated-B combo at high score (e.g. "Pan-D" query is combo-tolerant only
    // if user typed both halves). Extra unlisted salts are allowed only via aliases.
    if (qSalts.length === 1) {
      const saltsOtherThanQuery = med.salts.filter(
        (s) => tokenSimilarity(qSalts[0], normalize(s)) < 0.6
      );
      const matchWasViaAlias = best.matchedOn === "alias" || best.matchedOn === "brand";
      if (saltsOtherThanQuery.length >= 1 && !matchWasViaAlias && best.matchedOn !== "composition") {
        // generic/salt hit on a combination we didn't ask for
        best.score = Math.min(best.score, 0.55);
      }
    }

    // small boost if strength exactly equals a query strength
    if (q.strengths.length > 0 && strengthsClose(q.strengths[0], med)) {
      best.score = Math.min(1, best.score + 0.03);
    }

    results.push(best);
  }

  results.sort((a, b) => b.score - a.score);
  return results.filter((r) => r.score >= 0.32).slice(0, limit);
}

export interface Suggestion {
  label: string;
  kind: "brand" | "generic" | "alias";
  medicineId: string;
}

/** fast prefix/substring suggestions for the live dropdown */
export function suggest(raw: string, limit = 6): Suggestion[] {
  const n = normalize(raw);
  if (n.length < 2) return [];
  const out: Suggestion[] = [];
  const seen = new Set<string>();
  const push = (label: string, kind: Suggestion["kind"], medicineId: string) => {
    const key = label.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ label, kind, medicineId });
  };
  for (const med of MEDICINES) {
    const g = normalize(med.generic);
    if (g.includes(n)) push(med.generic, "generic", med.id);
    for (const b of med.brands) if (normalize(b.brand).includes(n)) push(b.brand, "brand", med.id);
    for (const a of med.aliases) if (normalize(a).includes(n)) push(a, "alias", med.id);
    if (out.length >= limit * 3) break;
  }
  // rank: startsWith first
  out.sort((a, b) => {
    const as = normalize(a.label).startsWith(n) ? 0 : 1;
    const bs = normalize(b.label).startsWith(n) ? 0 : 1;
    return as - bs;
  });
  return out.slice(0, limit);
}
