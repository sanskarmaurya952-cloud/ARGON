/**
 * AIMAN — OCR text utilities.
 * Wraps tesseract.js (dynamic import so the ~2 MB worker only loads on demand)
 * and cleans raw OCR output before handing it to the interpreter.
 */

export interface OcrProgress {
  status: string;
  progress: number; // 0..1
}

/** Run OCR on an image File/Blob. Hindi+English both supported via eng+hin. */
export async function runOcr(
  image: File | Blob,
  onProgress?: (p: OcrProgress) => void,
  langs: "eng" | "eng+hin" = "eng+hin"
): Promise<string> {
  const Tesseract = await import("tesseract.js");
  const result = await Tesseract.recognize(image, langs, {
    logger: (m: { status: string; progress?: number }) => {
      if (onProgress && typeof m.progress === "number") {
        onProgress({ status: m.status, progress: m.progress });
      }
    },
  });
  return cleanOcrText(result.data.text);
}

/** Clean raw OCR text: unify quotes/dashes, collapse noise, keep line structure. */
export function cleanOcrText(raw: string): string {
  return raw
    .replace(/\r/g, "\n")
    .replace(/[“”„‟]/g, '"')
    .replace(/[‘’‚‛]/g, "'")
    .replace(/[–—]/g, "-")
    .replace(/[|]/g, "l")
    .replace(/\t/g, " ")
    .replace(/[^\S\n]+/g, " ")
    .replace(/ {2,}/g, " ")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .join("\n");
}

/** Very rough per-line confidence used to flag lines the user MUST review. */
export function lineNeedsReview(line: string): boolean {
  const weird = (line.match(/[^A-Za-z0-9\s\-+.()%/µ]/g) || []).length;
  if (weird > Math.max(2, line.length * 0.12)) return true;
  if (/\d/.test(line) && !/[A-Za-z]{3,}/.test(line)) return true; // digits but almost no letters
  return false;
}
