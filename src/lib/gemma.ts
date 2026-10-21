/**
 * AIMAN — Gemma 4 integration layer.
 *
 * Gemma 4 (Google DeepMind, released 2 April 2026, Apache 2.0) is used to
 * STRUCTURE medicine text — turning messy OCR output into clean medicine
 * candidates. It is never used to diagnose, prescribe, or invent prices.
 *
 * Runtime support & detection order:
 *   1. Google AI Studio (Gemini API) — model "gemma-4-31b-it" / "gemma-4-26b-it",
 *      enabled when the user supplies a key in Settings (kept in localStorage,
 *      never logged, never sent anywhere else) or VITE_GEMMA_API_KEY is set at
 *      build time. The browser calls the Generative Language API directly with
 *      the user's key.
 *   2. Local Ollama / AI-Edge-style endpoint — e.g. `ollama run gemma4:e4b`,
 *      configured via VITE_GEMMA_OLLAMA_URL (default http://localhost:11434).
 *      Fully offline.
 *   3. Nothing configured → the UI shows "Gemma 4: not connected" honestly and
 *      falls back to the local symbolic interpreter (fuzzy salt/dose matcher),
 *      clearly labelled as a heuristic — NEVER as Gemma.
 *
 * Prompting contract: Gemma is asked to return ONLY strict JSON:
 *   { "medicines": [ { "name": string, "strength": string|null,
 *                       "form": string|null, "confidence": "high"|"low", "note": string|null } ] }
 * "high" = legible & unambiguous; "low" = unclear → user must confirm or edit.
 */

export type GemmaRuntime =
  | { kind: "google-ai"; apiKey: string; model: string }
  | { kind: "ollama"; baseUrl: string; model: string }
  | { kind: "none" };

export interface GemmaMedicineCandidate {
  name: string;
  strength: string | null;
  form: string | null;
  confidence: "high" | "low";
  note: string | null;
}

export interface GemmaInterpretResult {
  runtime: GemmaRuntime["kind"];
  model: string | null;
  medicines: GemmaMedicineCandidate[];
  rawText?: string;
  error?: string;
}

const STORAGE_KEY = "aiman.gemma.config.v1";

export interface GemmaConfig {
  googleAiKey?: string;
  googleModel?: string;
  ollamaUrl?: string;
  ollamaModel?: string;
  preferOllama?: boolean;
}

export function loadGemmaConfig(): GemmaConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const stored: GemmaConfig = raw ? JSON.parse(raw) : {};
    const env = (import.meta as unknown as { env?: Record<string, string> }).env ?? {};
    return {
      googleAiKey: stored.googleAiKey ?? env.VITE_GEMMA_API_KEY ?? "",
      googleModel: stored.googleModel ?? env.VITE_GEMMA_MODEL ?? "gemma-4-31b-it",
      ollamaUrl: stored.ollamaUrl ?? env.VITE_GEMMA_OLLAMA_URL ?? "http://localhost:11434",
      ollamaModel: stored.ollamaModel ?? env.VITE_GEMMA_OLLAMA_MODEL ?? "gemma4:e4b",
      preferOllama: stored.preferOllama ?? false,
    };
  } catch {
    return {};
  }
}

export function saveGemmaConfig(cfg: GemmaConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
}

export function clearGemmaConfig(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function detectRuntime(cfg: GemmaConfig): GemmaRuntime {
  if (cfg.preferOllama && cfg.ollamaUrl) {
    return { kind: "ollama", baseUrl: cfg.ollamaUrl.replace(/\/$/, ""), model: cfg.ollamaModel || "gemma4:e4b" };
  }
  if (cfg.googleAiKey && cfg.googleAiKey.trim().length > 8) {
    return { kind: "google-ai", apiKey: cfg.googleAiKey.trim(), model: cfg.googleModel || "gemma-4-31b-it" };
  }
  if (cfg.ollamaUrl) {
    // only used if reachable — checked lazily in pingOllama
    return { kind: "ollama", baseUrl: cfg.ollamaUrl.replace(/\/$/, ""), model: cfg.ollamaModel || "gemma4:e4b" };
  }
  return { kind: "none" };
}

export async function pingOllama(baseUrl: string, timeoutMs = 3500): Promise<boolean> {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    const res = await fetch(`${baseUrl}/api/tags`, { signal: ctrl.signal });
    clearTimeout(timer);
    return res.ok;
  } catch {
    return false;
  }
}

export async function pingGoogleAi(apiKey: string, model: string, timeoutMs = 5000): Promise<boolean> {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}`,
      { headers: { "x-goog-api-key": apiKey }, signal: ctrl.signal }
    );
    clearTimeout(timer);
    return res.ok;
  } catch {
    return false;
  }
}

/* ---------- prompt + parsing ---------- */

export function buildGemmaPrompt(ocrText: string): string {
  return [
    "You are a careful pharmacy text-structuring assistant for an Indian medicine app.",
    "You will receive RAW OCR TEXT from a prescription or a handwritten medicine list. It may contain spelling errors, broken lines, dosage instructions and doctor's notes.",
    "Extract ONLY the medicines the patient is supposed to take. Ignore doctor's name, hospital, dates, dosage instructions, frequencies, durations and advice — those are not medicines.",
    "Rules:",
    "- Never invent a medicine. If a name is unreadable or ambiguous, still list your best reading but set confidence to \"low\" and add a short note about what is unclear.",
    "- Keep brand names exactly as printed (e.g. 'Dolo 650'). For generics use standard Indian generic names (e.g. 'Paracetamol').",
    "- strength: the dose like '500 mg' / '5 ml' / '100 mcg' if printed, else null.",
    "- form: Tablet / Capsule / Syrup / Injection / Inhaler / Sachet / Drop / Gel if determinable, else null.",
    "- confidence: 'high' only when the name AND strength are both legible and unambiguous; otherwise 'low'.",
    "- Respond with STRICT JSON only — no markdown, no commentary, no code fences.",
    "Schema: {\"medicines\":[{\"name\":\"...\",\"strength\":\"...\"|null,\"form\":\"...\"|null,\"confidence\":\"high\"|\"low\",\"note\":\"...\"|null}]}",
    "",
    "RAW OCR TEXT:",
    "<<<",
    ocrText.slice(0, 6000),
    ">>>",
  ].join("\n");
}

export function parseGemmaJson(text: string): GemmaMedicineCandidate[] {
  // strip code fences if the model added them despite instructions
  let t = text.trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) t = fence[1].trim();
  // find the outermost {...}
  const start = t.indexOf("{");
  const end = t.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) throw new Error("Gemma response did not contain JSON object");
  const parsed = JSON.parse(t.slice(start, end + 1));
  if (!parsed || !Array.isArray(parsed.medicines)) throw new Error("Gemma JSON missing 'medicines' array");
  return parsed.medicines.map((m: Record<string, unknown>) => ({
    name: String(m.name ?? "").trim(),
    strength: m.strength == null ? null : String(m.strength).trim(),
    form: m.form == null ? null : String(m.form).trim(),
    confidence: m.confidence === "high" ? "high" : "low",
    note: m.note == null ? null : String(m.note).trim(),
  })).filter((m: GemmaMedicineCandidate) => m.name.length > 0);
}

/* ---------- interpreters ---------- */

async function interpretWithGoogleAi(cfg: { apiKey: string; model: string }, ocrText: string): Promise<GemmaInterpretResult> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(cfg.model)}:generateContent`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": cfg.apiKey },
    body: JSON.stringify({
      contents: [{ parts: [{ text: buildGemmaPrompt(ocrText) }] }],
      generationConfig: { temperature: 0.1, maxOutputTokens: 1024 },
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Google AI API error ${res.status}: ${body.slice(0, 200)}`);
  }
  const data = await res.json();
  const text: string = data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("") ?? "";
  return { runtime: "google-ai", model: cfg.model, medicines: parseGemmaJson(text), rawText: text };
}

async function interpretWithOllama(cfg: { baseUrl: string; model: string }, ocrText: string): Promise<GemmaInterpretResult> {
  const res = await fetch(`${cfg.baseUrl}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: cfg.model,
      prompt: buildGemmaPrompt(ocrText),
      stream: false,
      options: { temperature: 0.1, num_predict: 1024 },
    }),
  });
  if (!res.ok) {
    throw new Error(`Ollama error ${res.status} — is Gemma 4 running? (ollama run ${cfg.model})`);
  }
  const data = await res.json();
  const text: string = data?.response ?? "";
  return { runtime: "ollama", model: cfg.model, medicines: parseGemmaJson(text), rawText: text };
}

/**
 * Local symbolic fallback — NOT Gemma. Deterministic parser over OCR lines:
 * keeps lines containing a known-ish medicine-ish token or a strength, drops
 * instruction lines. Every output is confidence "low" by construction.
 */
export function symbolicInterpret(ocrText: string): GemmaInterpretResult {
  const INSTRUCTION_RE = /\b(od|bd|tid|qid|hs|sos|prn|daily|twice|thrice|morning|night|empty stomach|after food|before food|x\s?\d+\s?days|tab\s+od|cap\s+od|1-0-0|0-1-0|0-0-1|1-1-1|1-0-1)\b/i;
  const STRENGTH_RE = /(\d+(?:\.\d+)?)\s?(mcg|mg|g|ml|iu|%|lakh|lac|k)\b/i;
  const SKIP_RE = /^(dr\.?|patient|name|age|sex|date|rx|r\/|reg\.?|uhid|abha|phone|mob)\b/i;
  const medicines: GemmaMedicineCandidate[] = [];
  for (const rawLine of ocrText.split(/\n+/)) {
    const line = rawLine.replace(/^[\s\d).\-–—]+/, "").trim(); // strip leading numbering
    if (line.length < 3) continue;
    if (SKIP_RE.test(line)) continue;
    const strengthMatch = line.match(STRENGTH_RE);
    const looksMedicine = !!strengthMatch || /(tab|cap|syp|inj|tablet|capsule)\b/i.test(line);
    if (!looksMedicine) continue;
    // strip common instruction fragments
    let name = line.replace(INSTRUCTION_RE, "").replace(/\s{2,}/g, " ").trim();
    name = name.replace(/\s+$/, "");
    const confidence = "low" as const; // symbolic path never claims certainty
    medicines.push({
      name,
      strength: strengthMatch ? `${strengthMatch[1]} ${strengthMatch[2].toLowerCase()}`.replace("lakh", "lac IU") : null,
      form: /(^|\b)(tab(let)?)\b/i.test(line) ? "Tablet" : /(^|\b)(cap(sule)?)\b/i.test(line) ? "Capsule" : /(syp|syrup)\b/i.test(line) ? "Syrup" : /(inj|injection)\b/i.test(line) ? "Injection" : null,
      confidence,
      note: "Read locally by heuristic (Gemma 4 not connected) — please check every line.",
    });
  }
  return { runtime: "none", model: null, medicines };
}

export type InterpretOutcome =
  | { ok: true; result: GemmaInterpretResult; gemmaUsed: boolean }
  | { ok: false; error: string; fallback: GemmaInterpretResult };

/** Main entry: try Gemma first (per config/reachability), else honest fallback. */
export async function interpretMedicines(ocrText: string, cfg?: GemmaConfig): Promise<InterpretOutcome> {
  const config = cfg ?? loadGemmaConfig();
  const runtime = detectRuntime(config);
  try {
    if (runtime.kind === "google-ai") {
      const result = await interpretWithGoogleAi({ apiKey: runtime.apiKey, model: runtime.model }, ocrText);
      return { ok: true, result, gemmaUsed: true };
    }
    if (runtime.kind === "ollama") {
      const reachable = await pingOllama(runtime.baseUrl);
      if (reachable) {
        const result = await interpretWithOllama({ baseUrl: runtime.baseUrl, model: runtime.model }, ocrText);
        return { ok: true, result, gemmaUsed: true };
      }
      const fb = symbolicInterpret(ocrText);
      return { ok: false, error: `Ollama not reachable at ${runtime.baseUrl} — start it with: ollama run ${runtime.model}`, fallback: fb };
    }
    const fb = symbolicInterpret(ocrText);
    return { ok: false, error: "Gemma 4 is not configured yet — using the local heuristic reader. Add a Google AI key in Settings for real Gemma 4 interpretation.", fallback: fb };
  } catch (err) {
    const fb = symbolicInterpret(ocrText);
    return { ok: false, error: err instanceof Error ? err.message : String(err), fallback: fb };
  }
}
