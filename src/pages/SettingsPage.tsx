import { useState } from "react";
import {
  Cpu, KeyRound, Server, Trash2, CheckCircle2, XCircle, Loader2, ExternalLink,
  Info, Languages, Key, ShieldCheck, Mic,
} from "lucide-react";
import {
  loadGemmaConfig, saveGemmaConfig, clearGemmaConfig, detectRuntime,
  pingGoogleAi, pingOllama, type GemmaConfig,
} from "../lib/gemma";
import { useApp } from "../lib/context";
import { cn } from "../lib/cn";

type TestState = { status: "idle" | "testing" | "ok" | "fail"; detail?: string };

export default function SettingsPage() {
  const { lang, setLang } = useApp();
  const [cfg, setCfg] = useState<GemmaConfig>(() => loadGemmaConfig());
  const [googleTest, setGoogleTest] = useState<TestState>({ status: "idle" });
  const [ollamaTest, setOllamaTest] = useState<TestState>({ status: "idle" });
  const [saved, setSaved] = useState(false);

  const save = () => {
    saveGemmaConfig(cfg);
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  };

  const testGoogle = async () => {
    if (!cfg.googleAiKey?.trim()) { setGoogleTest({ status: "fail", detail: "Enter a Google AI API key first." }); return; }
    setGoogleTest({ status: "testing" });
    const ok = await pingGoogleAi(cfg.googleAiKey.trim(), cfg.googleModel || "gemma-4-31b-it");
    setGoogleTest(ok
      ? { status: "ok", detail: `Connected to ${cfg.googleModel || "gemma-4-31b-it"} on Google AI Studio. Gemma 4 is live for medicine interpretation.` }
      : { status: "fail", detail: "Could not reach Google AI with that key/model. Check the key, enable the Generative Language API, and confirm the model id." });
  };

  const testOllama = async () => {
    const url = (cfg.ollamaUrl || "http://localhost:11434").replace(/\/$/, "");
    setOllamaTest({ status: "testing" });
    const ok = await pingOllama(url);
    setOllamaTest(ok
      ? { status: "ok", detail: `Ollama reachable at ${url}. Model “${cfg.ollamaModel || "gemma4:e4b"}” will be used — make sure you have run: ollama run ${cfg.ollamaModel || "gemma4:e4b"}` }
      : { status: "fail", detail: `Ollama not reachable at ${url}. Start it with: ollama serve` });
  };

  const wipe = () => {
    clearGemmaConfig();
    setCfg({});
    setGoogleTest({ status: "idle" });
    setOllamaTest({ status: "idle" });
  };

  const runtime = detectRuntime(cfg);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 md:py-8">
      <p className="flex items-center gap-2 text-[0.7rem] font-bold uppercase tracking-[0.16em] text-terracotta-500"><Cpu size={12} /> Settings</p>
      <h1 className="font-display mt-1 text-3xl font-semibold text-pine-950">Gemma 4 & preferences</h1>
      <p className="mt-1 max-w-2xl text-sm text-pine-600">
        Gemma 4 is Google DeepMind’s open model family (released 2 April 2026, Apache-2.0). AIMAN uses it <strong>only</strong> to
        structure OCR text from prescriptions — never to diagnose, prescribe, or invent prices.
      </p>

      {/* current runtime status */}
      <div className="mt-4 flex items-center gap-2 rounded-2xl border border-pine-100 bg-white px-4 py-3 text-sm font-semibold text-pine-800">
        <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", runtime.kind === "none" ? "bg-marigold-500" : "bg-leaf-500")} />
        {runtime.kind === "none" && "Gemma 4 not connected — scan uses the labelled local heuristic reader"}
        {runtime.kind === "google-ai" && `Gemma 4 via Google AI Studio — model: ${runtime.model}`}
        {runtime.kind === "ollama" && `Gemma 4 via Ollama at ${runtime.baseUrl} — model: ${runtime.model}`}
      </div>

      {/* language */}
      <section className="mt-5 rounded-3xl border border-pine-100 bg-white p-5 shadow-[0_2px_0_0_rgba(15,45,35,0.08)]">
        <h2 className="font-display flex items-center gap-2 text-lg font-semibold text-pine-950"><Languages size={18} className="text-terracotta-500" /> Language / भाषा</h2>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {([{ code: "en", label: "English" }, { code: "hi", label: "हिन्दी (भारत)" }] as const).map((o) => (
            <button key={o.code} onClick={() => setLang(o.code)} aria-pressed={lang === o.code} className={cn(
              "focus-ring h-14 rounded-2xl border-2 text-base font-extrabold transition-all",
              lang === o.code ? "border-pine-800 bg-pine-800 text-cream-50" : "border-pine-100 bg-cream-50 text-pine-800 hover:border-pine-300"
            )}>{o.label}</button>
          ))}
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-xs text-pine-500"><Mic size={12} /> Voice search language follows this setting (en-IN / hi-IN).</p>
      </section>

      {/* option A: Google AI Studio */}
      <section className="mt-4 rounded-3xl border border-pine-100 bg-white p-5 shadow-[0_2px_0_0_rgba(15,45,35,0.08)]">
        <h2 className="font-display flex items-center gap-2 text-lg font-semibold text-pine-950"><KeyRound size={18} className="text-terracotta-500" /> Option A — Google AI Studio (cloud)</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-[0.82rem] text-pine-700">
          <li>Get a free API key at <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" className="focus-ring inline-flex items-center gap-1 font-bold text-pine-900 underline decoration-marigold-400 underline-offset-2">aistudio.google.com/apikey <ExternalLink size={11} /></a></li>
          <li>Paste it below. The key stays in <em>your browser’s localStorage</em> — it is sent only to Google’s API, never to any AIMAN server (AIMAN has no server).</li>
        </ol>
        <label className="mt-3 block text-xs font-bold uppercase tracking-wide text-pine-500" htmlFor="gkey">Google AI API key</label>
        <div className="relative mt-1">
          <Key size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-pine-400" />
          <input
            id="gkey"
            type="password"
            autoComplete="off"
            spellCheck={false}
            value={cfg.googleAiKey ?? ""}
            onChange={(e) => setCfg({ ...cfg, googleAiKey: e.target.value })}
            placeholder="AIza…"
            className="focus-ring h-13 w-full rounded-xl border border-pine-200 bg-cream-50 py-3 pl-10 pr-4 font-mono text-sm outline-none placeholder:text-pine-300"
          />
        </div>
        <label className="mt-3 block text-xs font-bold uppercase tracking-wide text-pine-500" htmlFor="gmodel">Model ID</label>
        <select id="gmodel" value={cfg.googleModel ?? "gemma-4-31b-it"} onChange={(e) => setCfg({ ...cfg, googleModel: e.target.value })} className="focus-ring mt-1 h-13 w-full rounded-xl border border-pine-200 bg-cream-50 px-3 py-3 text-sm font-medium outline-none">
          <option value="gemma-4-31b-it">gemma-4-31b-it (31B dense, best quality)</option>
          <option value="gemma-4-26b-a4b-it">gemma-4-26b-a4b-it (26B MoE, fast)</option>
          <option value="gemma-4-4b-it">gemma-4-4b-it (edge-class, lowest latency)</option>
        </select>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button onClick={testGoogle} disabled={googleTest.status === "testing"} className="focus-ring flex h-12 items-center gap-2 rounded-xl bg-pine-800 px-4 text-sm font-bold text-cream-50 hover:bg-pine-700 disabled:opacity-60">
            {googleTest.status === "testing" ? <Loader2 size={16} className="animate-spin" /> : <></>} Test connection
          </button>
          {googleTest.status === "ok" && <p className="flex items-center gap-1.5 text-xs font-semibold text-leaf-700"><CheckCircle2 size={14} /> {googleTest.detail}</p>}
          {googleTest.status === "fail" && <p className="flex items-center gap-1.5 text-xs font-semibold text-terracotta-600"><XCircle size={14} /> {googleTest.detail}</p>}
        </div>
      </section>

      {/* option B: Ollama local */}
      <section className="mt-4 rounded-3xl border border-pine-100 bg-white p-5 shadow-[0_2px_0_0_rgba(15,45,35,0.08)]">
        <h2 className="font-display flex items-center gap-2 text-lg font-semibold text-pine-950"><Server size={18} className="text-terracotta-500" /> Option B — Ollama (runs fully offline, free)</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-[0.82rem] text-pine-700">
          <li>Install Ollama from <a href="https://ollama.com" target="_blank" rel="noreferrer" className="focus-ring inline-flex items-center gap-1 font-bold text-pine-900 underline decoration-marigold-400 underline-offset-2">ollama.com <ExternalLink size={11} /></a></li>
          <li>In a terminal: <code className="rounded bg-cream-100 px-1.5 py-0.5 font-mono text-[0.8em]">ollama run gemma4:e4b</code> (edge-class) or <code className="rounded bg-cream-100 px-1.5 py-0.5 font-mono text-[0.8em]">ollama run gemma4:31b</code></li>
        </ol>
        <label className="mt-3 block text-xs font-bold uppercase tracking-wide text-pine-500" htmlFor="ourl">Ollama endpoint</label>
        <input id="ourl" type="url" value={cfg.ollamaUrl ?? "http://localhost:11434"} onChange={(e) => setCfg({ ...cfg, ollamaUrl: e.target.value })} className="focus-ring mt-1 h-13 w-full rounded-xl border border-pine-200 bg-cream-50 px-3 py-3 font-mono text-sm outline-none" />
        <label className="mt-3 block text-xs font-bold uppercase tracking-wide text-pine-500" htmlFor="omodel">Model tag</label>
        <input id="omodel" value={cfg.ollamaModel ?? "gemma4:e4b"} onChange={(e) => setCfg({ ...cfg, ollamaModel: e.target.value })} className="focus-ring mt-1 h-13 w-full rounded-xl border border-pine-200 bg-cream-50 px-3 py-3 font-mono text-sm outline-none" placeholder="gemma4:e4b" />
        <label className="mt-3 flex h-12 cursor-pointer items-center gap-3 rounded-xl border border-pine-100 bg-cream-50 px-4">
          <input type="checkbox" checked={cfg.preferOllama ?? false} onChange={(e) => setCfg({ ...cfg, preferOllama: e.target.checked })} className="h-6 w-6 accent-[#0f2d23]" />
          <span className="text-sm font-semibold text-pine-800">Prefer Ollama over cloud when both are configured</span>
        </label>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button onClick={testOllama} disabled={ollamaTest.status === "testing"} className="focus-ring flex h-12 items-center gap-2 rounded-xl bg-pine-800 px-4 text-sm font-bold text-cream-50 hover:bg-pine-700 disabled:opacity-60">
            {ollamaTest.status === "testing" ? <Loader2 size={16} className="animate-spin" /> : null} Test connection
          </button>
          {ollamaTest.status === "ok" && <p className="flex items-center gap-1.5 text-xs font-semibold text-leaf-700"><CheckCircle2 size={14} /> {ollamaTest.detail}</p>}
          {ollamaTest.status === "fail" && <p className="flex items-center gap-1.5 text-xs font-semibold text-terracotta-600"><XCircle size={14} /> {ollamaTest.detail}</p>}
        </div>
      </section>

      {/* save / wipe */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button onClick={save} className="focus-ring flex h-14 items-center gap-2 rounded-2xl bg-marigold-400 px-6 text-base font-extrabold text-pine-950 shadow-[0_4px_0_0_#7a4a0d] hover:translate-y-0.5 hover:shadow-none">
          {saved ? <CheckCircle2 size={19} /> : null} {saved ? "Saved" : "Save settings"}
        </button>
        <button onClick={wipe} className="focus-ring flex h-14 items-center gap-2 rounded-2xl px-4 text-sm font-bold text-pine-500 hover:text-terracotta-600">
          <Trash2 size={17} /> Forget keys & reset
        </button>
      </div>

      {/* privacy note */}
      <div className="mt-4 flex items-start gap-2 rounded-2xl border border-pine-100 bg-cream-50 p-4 text-[0.78rem] leading-snug text-pine-600">
        <ShieldCheck size={16} className="mt-0.5 shrink-0 text-leaf-600" />
        <span><strong>Privacy by design.</strong> Your API key never leaves your browser except to Google’s API. Prescription images are OCR’d in-page and discarded — AIMAN has no backend, no database and no analytics. “My List” lives in localStorage on this device.</span>
      </div>
      <p className="mt-3 flex items-start gap-2 text-[0.7rem] text-pine-400"><Info size={13} className="mt-0.5 shrink-0" /> Env-var alternative for deployments: set <code className="rounded bg-cream-100 px-1 font-mono">VITE_GEMMA_API_KEY</code> at build time. See README → API configuration.</p>
    </div>
  );
}
