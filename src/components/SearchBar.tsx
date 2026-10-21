import { useEffect, useId, useMemo, useRef, useState } from "react";

import { useNavigate } from "react-router-dom";
import { Search, Mic, MicOff, Loader2, Pill, Sparkles } from "lucide-react";
import { suggest, type Suggestion } from "../lib/search";
import { useApp } from "../lib/context";
import { t } from "../lib/i18n";
import { cn } from "../lib/cn";

type SpeechRecognitionCtor = new () => {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
};

export default function SearchBar({
  autoFocus = false,
  size = "lg",
  onSearch,
  initial = "",
}: {
  autoFocus?: boolean;
  size?: "lg" | "md";
  onSearch?: (query: string) => void;
  initial?: string;
}) {
  const { lang } = useApp();
  const navigate = useNavigate();
  const [value, setValue] = useState(initial);
  const [focused, setFocused] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const [listening, setListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const boxId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const suggestions = useMemo(() => suggest(value, 7), [value]);
  const showDropdown = focused && suggestions.length > 0 && value.trim().length >= 2;

  // reset highlight whenever the suggestion list changes (derived-state reset during render)
  const [lastValue, setLastValue] = useState(value);
  if (lastValue !== value) {
    setLastValue(value);
    setHighlight(-1);
  }

  // close dropdown on outside click
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setFocused(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const doSearch = (q: string) => {
    const query = q.trim();
    if (!query) return;
    setFocused(false);
    if (onSearch) onSearch(query);
    else navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  const pickSuggestion = (s: Suggestion) => {
    setValue(s.label);
    setFocused(false);
    navigate(`/medicine/${s.medicineId}`);
  };

  const startVoice = () => {
    setVoiceError(null);
    const w = window as unknown as { SpeechRecognition?: SpeechRecognitionCtor; webkitSpeechRecognition?: SpeechRecognitionCtor };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) {
      setVoiceError("Voice search isn't supported in this browser. Try Chrome on Android, or type the name.");
      return;
    }
    try {
      const rec = new Ctor();
      rec.lang = lang === "hi" ? "hi-IN" : "en-IN";
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      rec.onresult = (e) => {
        const transcript = e.results?.[0]?.[0]?.transcript ?? "";
        if (transcript) {
          setValue(transcript);
          doSearch(transcript);
        }
      };
      rec.onend = () => setListening(false);
      rec.onerror = () => {
        setListening(false);
        setVoiceError("Couldn't hear clearly — please try again or type the name.");
      };
      setListening(true);
      rec.start();
    } catch {
      setListening(false);
      setVoiceError("Microphone unavailable. Check permissions and try again.");
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          doSearch(value);
        }}
        className={cn(
          "flex w-full items-center overflow-hidden rounded-2xl border-2 border-pine-800 bg-white shadow-[0_4px_0_0_#0f2d23] transition-shadow focus-within:shadow-[0_6px_0_0_#0f2d23,0_0_0_4px_rgba(237,170,63,0.5)]",
          size === "lg" ? "h-16" : "h-13"
        )}
      >
        <span className="flex h-full items-center pl-4 text-pine-700">
          {listening ? <Loader2 size={22} className="animate-spin" /> : <Search size={size === "lg" ? 24 : 20} strokeWidth={2.4} />}
        </span>
        <input
          ref={inputRef}
          autoFocus={autoFocus}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onKeyDown={(e) => {
            if (!showDropdown) return;
            if (e.key === "ArrowDown") { e.preventDefault(); setHighlight((h) => Math.min(h + 1, suggestions.length - 1)); }
            else if (e.key === "ArrowUp") { e.preventDefault(); setHighlight((h) => Math.max(h - 1, -1)); }
            else if (e.key === "Enter" && highlight >= 0) { e.preventDefault(); pickSuggestion(suggestions[highlight]); }
            else if (e.key === "Escape") setFocused(false);
          }}
          type="text"
          inputMode="search"
          enterKeyHint="search"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls={`${boxId}-listbox`}
          aria-autocomplete="list"
          aria-label="Medicine search"
          placeholder={t("searchPlaceholder", lang)}
          className="h-full min-w-0 flex-1 bg-transparent px-3 text-base font-medium text-pine-950 placeholder-pine-400 outline-none sm:text-lg"
        />
        <button
          type="button"
          onClick={startVoice}
          className={cn(
            "focus-ring mr-2 flex min-h-11 min-w-11 items-center justify-center rounded-xl transition-colors",
            listening ? "bg-terracotta-500 text-white" : "text-pine-700 hover:bg-pine-50"
          )}
          aria-label={listening ? "Stop listening" : t("voiceSearch", lang)}
          aria-pressed={listening}
        >
          {listening ? <MicOff size={20} /> : <Mic size={20} />}
        </button>
        <button
          type="submit"
          className="focus-ring mr-2 hidden h-11 items-center gap-1.5 rounded-xl bg-marigold-400 px-4 text-sm font-extrabold uppercase tracking-wide text-pine-950 transition-colors hover:bg-marigold-300 sm:flex"
        >
          {t("search", lang)}
        </button>
      </form>

      {voiceError && <p className="mt-2 text-xs font-medium text-terracotta-600">{voiceError}</p>}

      {showDropdown && (
        <div
          id={`${boxId}-listbox`}
          role="listbox"
          aria-label="Medicine suggestions"
          className="nice-scroll absolute z-30 mt-2 max-h-96 w-full overflow-y-auto rounded-2xl border border-pine-100 bg-white p-2 shadow-2xl shadow-pine-950/15"
        >
          <p className="flex items-center gap-1.5 px-3 pb-1 pt-1.5 text-[0.65rem] font-bold uppercase tracking-wider text-pine-400">
            <Sparkles size={11} /> Suggestions — fuzzy match handles typos
          </p>
          {suggestions.map((s, i) => (
            <button
              key={`${s.medicineId}-${s.label}-${i}`}
              role="option"
              aria-selected={i === highlight}
              onMouseEnter={() => setHighlight(i)}
              onClick={() => pickSuggestion(s)}
              className={cn(
                "focus-ring flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                i === highlight ? "bg-marigold-100" : "hover:bg-cream-100"
              )}
            >
              <Pill size={16} className="shrink-0 text-pine-500" />
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-pine-950">{s.label}</span>
                <span className="text-[0.7rem] uppercase tracking-wide text-pine-400">{s.kind}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
