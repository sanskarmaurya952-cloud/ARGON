import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Camera, Upload, ScanText, Loader2, ShieldCheck, Trash2, Plus, ChevronDown,
  CircleCheck, CircleAlert, Sparkles, Cpu, ChevronRight, ArrowRight, RotateCcw,
} from "lucide-react";
import { runOcr } from "../lib/ocr";
import { interpretMedicines, loadGemmaConfig, type GemmaInterpretResult, type InterpretOutcome } from "../lib/gemma";
import { searchMedicines } from "../lib/search";
import { useApp } from "../lib/context";
import type { Medicine } from "../data/medicines";
import { cn } from "../lib/cn";

type Phase = "upload" | "ocr" | "interpreting" | "review";

interface ReviewItem {
  key: string;
  rawName: string;
  editedName: string;
  strength: string | null;
  form: string | null;
  confidence: "high" | "low";
  note: string | null;
  include: boolean;
}

const MAX_DIM = 1800;

async function downscale(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_DIM / Math.max(bitmap.width, bitmap.height));
  if (scale >= 1) return file;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b!), "image/jpeg", 0.92));
}

function matchFor(name: string, strength: string | null): Medicine | null {
  const query = strength ? `${name} ${strength}` : name;
  const hits = searchMedicines(query, { limit: 1 });
  if (hits.length) return hits[0].medicine;
  const hits2 = searchMedicines(name, { limit: 1 });
  return hits2.length ? hits2[0].medicine : null;
}

export default function ScanPage() {
  const navigate = useNavigate();
  const { addToList } = useApp();
  const [phase, setPhase] = useState<Phase>("upload");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [ocrText, setOcrText] = useState("");
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrStatus, setOcrStatus] = useState("idle");
  const [outcome, setOutcome] = useState<InterpretOutcome | null>(null);
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const cfg = useMemo(() => loadGemmaConfig(), []);

  useEffect(() => () => { if (imageUrl) URL.revokeObjectURL(imageUrl); }, [imageUrl]);

  const startOcr = useCallback(async (file: File) => {
    setError(null);
    setPhase("ocr");
    setOcrProgress(0);
    setOcrStatus("preparing image…");
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    try {
      const blob = await downscale(file);
      const text = await runOcr(blob, (p) => {
        setOcrProgress(p.progress);
        setOcrStatus(p.status);
      });
      setOcrText(text);
      setPhase("interpreting");
      setOcrStatus("interpreting medicines…");
      const oc = await interpretMedicines(text, cfg);
      setOutcome(oc);
      const result: GemmaInterpretResult = oc.ok ? oc.result : oc.fallback;
      setItems(
        result.medicines.map((m, i) => ({
          key: `item-${Date.now()}-${i}`,
          rawName: m.name,
          editedName: m.name,
          strength: m.strength,
          form: m.form,
          confidence: m.confidence,
          note: m.note,
          include: m.confidence === "high", // low-confidence lines start unchecked — must be confirmed
        }))
      );
      setPhase("review");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not read the image. Please try a clearer photo in good light.");
      setPhase("upload");
    }
  }, [cfg]);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) startOcr(file);
    e.target.value = "";
  };

  const updateItem = (key: string, patch: Partial<ReviewItem>) =>
    setItems((prev) => prev.map((it) => (it.key === key ? { ...it, ...patch } : it)));

  const addManualItem = () =>
    setItems((prev) => [
      ...prev,
      { key: `manual-${Date.now()}`, rawName: "", editedName: "", strength: null, form: null, confidence: "low", note: "Added manually — please verify.", include: true },
    ]);

  const removeItem = (key: string) => setItems((prev) => prev.filter((it) => it.key !== key));

  const matches = useMemo(
    () => new Map(items.map((it) => [it.key, matchFor(it.editedName, it.strength)])),
    [items]
  );

  const included = items.filter((it) => it.include && it.editedName.trim().length > 1);
  const matchedCount = included.filter((it) => matches.get(it.key)).length;
  const highCount = included.filter((it) => it.confidence === "high").length;

  const confirmAll = () => {
    const ids = new Set<string>();
    for (const it of included) {
      const m = matches.get(it.key);
      if (m) ids.add(m.id);
    }
    ids.forEach((id) => addToList(id));
    navigate("/my-list");
  };

  const gemmaUsed = outcome ? (outcome.ok ? outcome.gemmaUsed : false) : false;
  const modelLabel = outcome?.ok ? outcome.result.model : outcome?.fallback.model;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 md:py-8">
      {/* heading */}
      <p className="flex items-center gap-2 text-[0.7rem] font-bold uppercase tracking-[0.16em] text-terracotta-500">
        <Sparkles size={12} /> OCR + Gemma 4
      </p>
      <h1 className="font-display mt-1 text-3xl font-semibold text-pine-950">Scan Medicine List</h1>
      <p className="mt-1 max-w-2xl text-sm text-pine-600">
        Photograph your prescription or the medicine strip list. AIMAN reads it locally, extracts only the medicines,
        then asks you to <strong>review and confirm every line</strong>. Nothing is added without your say-so.
      </p>

      {/* privacy strip */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-2xl border border-leaf-600/30 bg-leaf-600/5 px-4 py-2.5 text-[0.75rem] font-medium text-leaf-700">
        <span className="flex items-center gap-1.5"><ShieldCheck size={14} /> Image is processed in your browser — it is never uploaded</span>
        <span className="flex items-center gap-1.5"><ShieldCheck size={14} /> Stored only on your device</span>
        <span className="flex items-center gap-1.5"><ShieldCheck size={14} /> No diagnosis, no auto-substitution</span>
      </div>

      {/* ── PHASE: upload ─────────────────────────────────────── */}
      {phase === "upload" && (
        <div className="mt-5">
          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-2xl border border-terracotta-500/40 bg-terracotta-500/10 px-4 py-3 text-sm font-medium text-terracotta-600" role="alert">
              <CircleAlert size={17} className="mt-0.5 shrink-0" /> {error}
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <button
              onClick={() => cameraRef.current?.click()}
              className="focus-ring group flex min-h-56 flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-pine-300 bg-cream-50 px-6 py-10 text-center transition-all hover:border-marigold-400 hover:bg-marigold-100/40"
            >
              <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-pine-800 text-cream-50 transition-transform group-hover:scale-105">
                <Camera size={34} />
              </span>
              <span className="font-display text-xl font-semibold text-pine-950">Take a photo</span>
              <span className="max-w-52 text-xs text-pine-600">Open the camera — keep the list flat, fill the frame, good light</span>
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              className="focus-ring group flex min-h-56 flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-pine-300 bg-cream-50 px-6 py-10 text-center transition-all hover:border-marigold-400 hover:bg-marigold-100/40"
            >
              <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-marigold-400 text-pine-950 transition-transform group-hover:scale-105">
                <Upload size={34} />
              </span>
              <span className="font-display text-xl font-semibold text-pine-950">Upload from gallery</span>
              <span className="max-w-52 text-xs text-pine-600">JPG, PNG or WebP — photo of a prescription, strip list or medicine bills</span>
            </button>
          </div>
          <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onFile} aria-label="Take a photo of the medicine list" />
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} aria-label="Upload a photo of the medicine list" />

          {/* what Gemma is connected right now */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-pine-100 bg-white px-4 py-3">
            <p className="flex items-center gap-2 text-xs font-semibold text-pine-700">
              <Cpu size={15} className="text-terracotta-500" />
              {gemmaStatusLabel(cfg)}
            </p>
            <button onClick={() => navigate("/settings")} className="focus-ring flex items-center gap-1 text-xs font-bold text-pine-800 underline decoration-marigold-400 decoration-2 underline-offset-2 hover:text-pine-950">
              Configure Gemma 4 <ChevronRight size={13} />
            </button>
          </div>

          <ul className="mt-5 grid gap-2 text-[0.78rem] text-pine-600 sm:grid-cols-3">
            {[
              ["1", "OCR (Tesseract) reads Latin + Devanagari script locally"],
              ["2", "Gemma 4 structures the messy text into medicine candidates"],
              ["3", "You confirm or fix every line before it touches your list"],
            ].map(([n, s]) => (
              <li key={n} className="flex items-start gap-2 rounded-xl bg-cream-50 p-3"><span className="font-display font-bold text-marigold-600">{n}.</span>{s}</li>
            ))}
          </ul>
        </div>
      )}

      {/* ── PHASE: OCR / interpreting ─────────────────────────── */}
      {(phase === "ocr" || phase === "interpreting") && (
        <div className="mt-5 grid gap-5 md:grid-cols-[1fr_1.2fr]">
          {imageUrl && (
            <img src={imageUrl} alt="Uploaded prescription — preview" className="max-h-80 w-full rounded-2xl border border-pine-100 object-contain bg-pine-950/5" />
          )}
          <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-pine-100 bg-white p-8 text-center">
            <Loader2 size={40} className="animate-spin text-marigold-600" />
            <p className="font-display text-xl font-semibold capitalize text-pine-950">{ocrStatus}</p>
            <div className="h-3 w-full max-w-xs overflow-hidden rounded-full bg-cream-200" role="progressbar" aria-valuenow={Math.round(ocrProgress * 100)} aria-valuemin={0} aria-valuemax={100}>
              <div className="h-full rounded-full bg-gradient-to-r from-marigold-400 to-terracotta-500 transition-all duration-200" style={{ width: `${Math.max(4, ocrProgress * 100)}%` }} />
            </div>
            <p className="text-xs text-pine-500">{Math.round(ocrProgress * 100)}% — {phase === "interpreting" ? "Gemma 4 / heuristic is structuring medicine names" : "first run downloads the OCR engine (~4 MB, one time)"}</p>
          </div>
        </div>
      )}

      {/* ── PHASE: review ─────────────────────────────────────── */}
      {phase === "review" && (
        <div className="mt-5">
          {/* interpretation provenance banner */}
          <div className={cn(
            "flex flex-wrap items-center justify-between gap-2 rounded-2xl border px-4 py-2.5 text-xs font-semibold",
            gemmaUsed ? "border-leaf-600/40 bg-leaf-600/10 text-leaf-700" : "border-marigold-300 bg-marigold-100 text-marigold-700"
          )}>
            <span className="flex items-center gap-1.5">
              {gemmaUsed ? <CircleCheck size={15} /> : <CircleAlert size={15} />}
              {gemmaUsed
                ? `Interpreted by Gemma 4 (${modelLabel}). ${highCount} high-confidence, ${items.length - highCount} need your check.`
                : outcome && !outcome.ok ? outcome.error : "Gemma 4 not connected — local heuristic read. Please verify every line carefully."}
            </span>
            <button onClick={() => { setPhase("upload"); setItems([]); setOcrText(""); setOutcome(null); }} className="focus-ring flex items-center gap-1 rounded-lg border border-current/30 px-2.5 py-1.5 font-bold hover:opacity-80">
              <RotateCcw size={12} /> Start over
            </button>
          </div>

          {/* raw OCR (collapsed) */}
          <details className="mt-3 rounded-2xl border border-pine-100 bg-white">
            <summary className="cursor-pointer select-none px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-pine-500">Raw OCR text (what the scanner saw)</summary>
            <textarea value={ocrText} onChange={(e) => setOcrText(e.target.value)} rows={5} aria-label="Raw OCR text — you may correct it" className="w-full resize-y border-t border-pine-100 bg-cream-50 p-3 font-mono text-xs text-pine-900 outline-none focus:bg-white" />
            <div className="border-t border-pine-100 px-4 py-2">
              <button className="focus-ring text-xs font-bold text-pine-800 underline decoration-marigold-400 decoration-2 underline-offset-2" onClick={async () => { setPhase("interpreting"); setOcrStatus("re-interpreting…"); const oc = await interpretMedicines(ocrText, cfg); setOutcome(oc); const res = oc.ok ? oc.result : oc.fallback; setItems(res.medicines.map((m, i) => ({ key: `item-${Date.now()}-${i}`, rawName: m.name, editedName: m.name, strength: m.strength, form: m.form, confidence: m.confidence, note: m.note, include: m.confidence === "high" }))); setPhase("review"); }}>
                Re-run interpretation on edited text
              </button>
            </div>
          </details>

          {/* items */}
          <div className="mt-4 space-y-3">
            {items.length === 0 && (
              <p className="rounded-2xl border border-dashed border-pine-200 bg-cream-50 p-6 text-center text-sm text-pine-600">
                No medicine-like lines were found. Lighting or handwriting may be too unclear — retake the photo, or add medicines manually below.
              </p>
            )}
            {items.map((it) => {
              const match = matches.get(it.key) ?? null;
              const isOpen = expanded === it.key;
              const alternatives = it.editedName.trim().length > 2 ? searchMedicines(`${it.editedName} ${it.strength ?? ""}`, { limit: 3 }).map((r) => r.medicine) : [];
              return (
                <div key={it.key} className={cn("rounded-2xl border bg-white p-3 shadow-sm transition-colors", it.include ? "border-pine-200" : "border-dashed border-pine-100 opacity-75")}>
                  <div className="flex items-start gap-3">
                    <button
                      role="checkbox"
                      aria-checked={it.include}
                      aria-label={`Include ${it.editedName || "this line"} in my list`}
                      onClick={() => updateItem(it.key, { include: !it.include })}
                      className={cn("focus-ring mt-1.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 transition-colors", it.include ? "border-leaf-600 bg-leaf-600 text-white" : "border-pine-200 bg-cream-50")}
                    >
                      {it.include && <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M2.5 8l4 4 6-9" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          value={it.editedName}
                          onChange={(e) => updateItem(it.key, { editedName: e.target.value })}
                          placeholder="Medicine name as printed…"
                          aria-label="Medicine name — correct if the OCR misread it"
                          className="focus-ring h-11 min-w-0 flex-1 rounded-xl border border-pine-100 bg-cream-50 px-3 text-[0.95rem] font-bold text-pine-950 outline-none placeholder:font-normal placeholder:text-pine-400 focus:border-marigold-400"
                        />
                        <span className={cn(
                          "flex h-8 items-center gap-1 rounded-full px-2.5 text-[0.68rem] font-extrabold uppercase tracking-wide",
                          it.confidence === "high" ? "bg-leaf-600/15 text-leaf-700" : "bg-marigold-300/50 text-marigold-700"
                        )}>
                          {it.confidence === "high" ? <CircleCheck size={12} /> : <CircleAlert size={12} />}
                          {it.confidence === "high" ? "High" : "Check me"}
                        </span>
                        <button onClick={() => removeItem(it.key)} className="focus-ring rounded-lg p-2 text-pine-400 hover:bg-cream-100 hover:text-terracotta-600" aria-label="Remove this line">
                          <Trash2 size={17} />
                        </button>
                      </div>
                      {it.note && <p className="mt-1.5 text-[0.72rem] italic text-pine-500">⚠ {it.note}</p>}
                      {/* matched catalog product */}
                      {match ? (
                        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.75rem]">
                          <span className="font-semibold text-pine-500">Matched:</span>
                          <button onClick={() => setExpanded(isOpen ? null : it.key)} className="focus-ring flex items-center gap-1 rounded-md font-bold text-pine-900 hover:text-terracotta-600">
                            {match.composition} <ChevronDown size={13} className={cn("transition-transform", isOpen && "rotate-180")} />
                          </button>
                          <span className="text-pine-400">·</span>
                          <span className="font-semibold text-leaf-700">{match.janAushadhi ? `Jan Aushadhi ₹${match.janAushadhi.perUnit}/unit` : "JA price N/A"}</span>
                        </div>
                      ) : (
                        <p className="mt-1.5 text-[0.75rem] font-medium text-terracotta-600">Not found in catalogue — edit the spelling or check with your pharmacist. Won’t be added.</p>
                      )}
                      {/* alternatives */}
                      {isOpen && alternatives.length > 0 && (
                        <div className="mt-2 rounded-xl border border-pine-100 bg-cream-50 p-2">
                          <p className="px-1 text-[0.65rem] font-bold uppercase tracking-wide text-pine-400">Which one did the doctor mean?</p>
                          {alternatives.map((alt) => (
                            <button key={alt.id} onClick={() => { const q = match ? `${alt.generic} ${it.strength ?? ""}` : alt.composition; void q; updateItem(it.key, { editedName: alt.generic, strength: alt.strength }); setExpanded(null); }} className="focus-ring mt-1 flex w-full items-center justify-between gap-2 rounded-lg bg-white px-2.5 py-2 text-left text-[0.8rem] font-semibold text-pine-900 hover:bg-marigold-100">
                              <span>{alt.composition} <span className="font-normal text-pine-500">· {alt.form}</span></span>
                              <ArrowRight size={13} className="shrink-0" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button onClick={addManualItem} className="focus-ring mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-pine-200 text-sm font-bold text-pine-600 hover:border-marigold-400 hover:text-pine-900">
            <Plus size={17} /> Add a medicine the scanner missed
          </button>

          {/* confirm bar */}
          <div className="sticky bottom-3 z-20 mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-pine-800 bg-pine-900/95 px-4 py-3 shadow-2xl backdrop-blur">
            <p className="text-xs font-semibold text-cream-100">
              <span className="font-display text-lg font-bold text-marigold-300">{matchedCount}</span> of {included.length} included medicines matched in catalogue
              {matchedCount < included.length && <span className="block text-[0.7rem] font-normal text-pine-200">Unmatched lines won’t be added automatically</span>}
            </p>
            <button
              onClick={confirmAll}
              disabled={matchedCount === 0}
              className="focus-ring flex h-14 items-center gap-2 rounded-2xl bg-marigold-400 px-6 text-base font-extrabold text-pine-950 transition-all enabled:hover:translate-y-0.5 enabled:hover:shadow-none enabled:shadow-[0_4px_0_0_#7a4a0d] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ScanText size={20} /> Confirm & compare <ArrowRight size={17} />
            </button>
          </div>
        </div>
      )}

      {/* footnote */}
      <p className="mt-6 text-[0.7rem] leading-snug text-pine-400">
        OCR: tesseract.js (eng+hin), runs in-browser. Interpretation: {gemmaStatusLabel(cfg)}. Gemma 4 is Google’s open
        (Apache-2.0) model released 2 Apr 2026 — see Settings → Gemma 4. AIMAN never diagnoses, prescribes or substitutes;
        every medicine stays exactly what your doctor wrote until a licensed professional agrees to a change.
      </p>
    </div>
  );
}

function gemmaStatusLabel(cfg: ReturnType<typeof loadGemmaConfig>): string {
  const parts: string[] = [];
  if (cfg.preferOllama) parts.push(`Ollama at ${cfg.ollamaUrl} (model ${cfg.ollamaModel})`);
  else if (cfg.googleAiKey) parts.push(`Google AI Studio · ${cfg.googleModel}`);
  else parts.push("not connected — heuristic mode");
  return `Gemma 4: ${parts.join("")}`;
}
