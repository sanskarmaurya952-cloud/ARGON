/**
 * AIMAN — core engine tests (node:test, zero dependencies).
 * Run: npm test
 * Covers the safety-critical behaviour: fuzzy matching WITHOUT strength/form confusion.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { searchMedicines, suggest, normalize, parseQuery, similarity, trigramDice } from "../src/lib/search.ts";
import { computeSavings, computeBasketSavings, buildPriceRows, formatINR2 } from "../src/lib/compare.ts";
import { MEDICINES } from "../src/data/medicines.ts";
import { parseGemmaJson, buildGemmaPrompt, symbolicInterpret } from "../src/lib/gemma.ts";
import { haversineKm } from "../src/data/kendras.ts";

const byId = (id: string) => MEDICINES.find((m) => m.id === id)!;

/* ---------- normalization & similarity primitives ---------- */

test("normalize handles units, separators and diacritics", () => {
  assert.equal(normalize("Dolo-650"), "dolo 650");
  assert.equal(normalize("Vitamin B (B1, B6)"), "vitamin b b1 b6");
  assert.equal(normalize("Asthalin  100 µg"), "asthalin 100 mcg");
  assert.equal(normalize("  Pantocid-DSR  "), "pantocid dsr");
});

test("similarity & trigram score near-equal strings high", () => {
  assert.ok(similarity("amoxicillin", "amoxicilin") > 0.85);
  assert.ok(similarity("metformin", "methformin") > 0.8);
  assert.ok(trigramDice("pantoprazole", "pantoprazol") > 0.7);
  assert.ok(similarity("paracetamol", "aspirin") < 0.4);
});

test("parseQuery extracts strengths and units", () => {
  const q = parseQuery("dolo 650 tablet");
  assert.equal(q.strengths[0].value, 650);
  assert.deepEqual(q.forms, ["tablet"]);
  const q2 = parseQuery("vitamin d3 60000 iu");
  assert.equal(q2.strengths[0].value, 60000);
  assert.equal(q2.strengths[0].unit, "iu");
});

/* ---------- search: misspellings OK, wrong strength NEVER ---------- */

test("exact brand search finds the product first", () => {
  const hits = searchMedicines("Dolo 650");
  assert.ok(hits.length > 0);
  assert.equal(hits[0].medicine.id, "paracetamol-650");
});

test("misspelling still finds the right medicine", () => {
  const hits = searchMedicines("amoxicilin 500");
  assert.ok(hits.length > 0, "typo should still match");
  assert.equal(hits[0].medicine.id, "amoxicillin-500");
});

test("typo on brand name finds it", () => {
  const hits = searchMedicines("metformn");
  assert.ok(hits.some((h) => h.medicine.generic === "Metformin"));
});

test("SAFETY: strength mismatch is a hard filter", () => {
  const hits = searchMedicines("paracetamol 325");
  assert.equal(hits.length, 0, "650 must never be returned for a 325 query");
  const hits2 = searchMedicines("amlodipine 5");
  assert.ok(hits2.length > 0);
  assert.ok(hits2.every((h) => h.medicine.strengthValue === 5), "5 mg query must not return 10 mg");
});

test("SAFETY: single-salt query does not float a combination above singles", () => {
  const hits = searchMedicines("pantoprazole 40");
  const firstSingle = hits.findIndex((h) => h.medicine.id === "pantoprazole-40");
  const firstCombo = hits.findIndex((h) => h.medicine.id === "pantoprazole-domperidone");
  assert.ok(firstSingle !== -1, "plain pantoprazole must appear");
  if (firstCombo !== -1) assert.ok(firstSingle < firstCombo, "plain salt must rank above combination");
});

test("combination query finds the combination", () => {
  const hits = searchMedicines("pan d");
  assert.ok(hits.some((h) => h.medicine.id === "pantoprazole-domperidone"));
  const hits2 = searchMedicines("glimepiride metformin");
  assert.ok(hits2.some((h) => h.medicine.id === "glimepiride-metformin"));
});

test("suggest() returns prefix suggestions", () => {
  const s = suggest("dolo");
  assert.ok(s.length > 0);
  assert.ok(s.some((x) => /dolo/i.test(x.label)));
});

test("every suggestion and result medicine is fully formed", () => {
  const hits = searchMedicines("vitamin");
  for (const h of hits) {
    assert.ok(h.medicine.composition.length > 3);
    assert.ok(h.medicine.brands.length >= 1);
    assert.ok(h.score > 0 && h.score <= 1);
  }
});

/* ---------- savings math ---------- */

test("computeSavings compares identical scope and is sane", () => {
  const med = byId("paracetamol-650");
  const s = computeSavings(med);
  assert.ok(s.hasComparable);
  assert.ok(s.vsAverageFraction! > 0 && s.vsAverageFraction! < 1);
  const avgBrand = med.brands.reduce((a, b) => a + b.perUnit, 0) / med.brands.length;
  const expected = (avgBrand - med.janAushadhi!.perUnit) * 30;
  assert.ok(Math.abs(s.monthlySavings! - expected) < 0.01);
  assert.ok(Math.abs(s.annualSavings! - expected * 12) < 0.01);
});

test("savings never exceed brand price (no negative nonsense)", () => {
  for (const m of MEDICINES) {
    const s = computeSavings(m);
    if (!s.hasComparable) continue;
    assert.ok(s.janAushadhiPerUnit! < s.avgBrandPerUnit!, `${m.id}: JA should be cheaper than avg brand`);
  }
});

test("basket totals add up and flag incomparable entries", () => {
  const basket = computeBasketSavings([byId("paracetamol-500"), byId("pantoprazole-40")]);
  assert.ok(basket.monthlySavings > 0);
  assert.ok(basket.allComparable);
  assert.ok(basket.totalJAMonthly < basket.totalBrandMonthly);
});

test("buildPriceRows emits JA row with drug code and the number of pack units", () => {
  const rows = buildPriceRows(byId("metformin-500"));
  const ja = rows.find((r) => r.kind === "jan-aushadhi")!;
  assert.equal(ja.drugCode, "JA7001");
  assert.ok(ja.packSize > 0);
  assert.ok(rows.some((r) => r.kind === "nlem-ceiling"), "metformin is NLEM scheduled");
});

test("every medicine in dataset is internally consistent", () => {
  for (const m of MEDICINES) {
    assert.ok(m.brands.length >= 1, `${m.id} needs at least one brand price`);
    for (const b of m.brands) {
      assert.ok(Math.abs(b.perUnit * b.packSize - b.packPrice) < 1.5, `${m.id}/${b.brand}: perUnit × pack ≈ packPrice`);
      assert.match(b.verified, /^2026-/);
      assert.ok(b.source.length > 5);
    }
    if (m.janAushadhi) {
      assert.ok(Math.abs(m.janAushadhi.perUnit * m.janAushadhi.packSize - m.janAushadhi.packPrice) < 1.5, `${m.id}: JA pack math`);
      assert.match(m.janAushadhi.verified, /^2026-/);
    }
  }
});

/* ---------- Gemma 4 helpers ---------- */

test("parseGemmaJson handles clean strict JSON", () => {
  const out = parseGemmaJson('{"medicines":[{"name":"Dolo 650","strength":"650 mg","form":"Tablet","confidence":"high","note":null}]}');
  assert.equal(out.length, 1);
  assert.equal(out[0].name, "Dolo 650");
  assert.equal(out[0].confidence, "high");
});

test("parseGemmaJson strips markdown fences and surrounding chatter", () => {
  const text = 'Sure! Here is the result:\n```json\n{"medicines":[{"name":"Pan-D","strength":"40 mg","form":"Capsule","confidence":"low","note":"unclear dose line"}]}\n```\nHope this helps.';
  const out = parseGemmaJson(text);
  assert.equal(out.length, 1);
  assert.equal(out[0].confidence, "low");
  assert.equal(out[0].strength, "40 mg");
});

test("parseGemmaJson drops empty names and forces confidence to low unless high", () => {
  const out = parseGemmaJson('{"medicines":[{"name":"","confidence":"high"},{"name":"Telma 40","confidence":"maybe"}]}');
  assert.equal(out.length, 1);
  assert.equal(out[0].confidence, "low", "unrecognised confidence must degrade to low");
});

test("parseGemmaJson throws on non-JSON honestly", () => {
  assert.throws(() => parseGemmaJson("I cannot read this image"), /JSON/);
});

test("buildGemmaPrompt forbids invention and demands strict JSON", () => {
  const p = buildGemmaPrompt("Tab Dolo 650\n1-0-1 x 5 days");
  assert.match(p, /Never invent/);
  assert.match(p, /STRICT JSON/);
  assert.match(p, /Tab Dolo 650/);
});

test("symbolicInterpret keeps medicine lines, drops instruction-only noise, marks all low-confidence", () => {
  const ocr = "Tab Dolo 650 1-0-1 x 5 days\nBD\nCap Pan-D 1-0-0 before food\nDr. A. K. Sharma\nage 45";
  const out = symbolicInterpret(ocr);
  assert.ok(out.medicines.some((m) => /dolo/i.test(m.name)), "keeps the Dolo line");
  assert.ok(out.medicines.some((m) => /pan/i.test(m.name)), "keeps the Pan-D line");
  assert.ok(out.medicines.every((m) => m.confidence === "low"), "heuristic path can never claim high confidence");
  assert.equal(out.runtime, "none");
});

/* ---------- geography ---------- */

test("haversineKm Delhi↔Mumbai is roughly 1100–1200 km", () => {
  const d = haversineKm(28.6139, 77.209, 19.076, 72.8777);
  assert.ok(d > 1050 && d < 1250, `got ${d}`);
});

test("formatters emit Indian grouping", () => {
  assert.equal(formatINR2(12.5), "₹12.50");
});
