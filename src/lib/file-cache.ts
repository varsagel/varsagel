import fs from "node:fs";
import path from "node:path";

type CacheEntry<T> = {
  value: T;
  expiresAt: number;
  mtimeMs: number;
  size: number;
};

function getStore(): Map<string, CacheEntry<any>> {
  const g = globalThis as any;
  if (!g.__varsagel_file_cache) g.__varsagel_file_cache = new Map<string, CacheEntry<any>>();
  return g.__varsagel_file_cache;
}

function getStatSafe(fp: string): { mtimeMs: number; size: number } | null {
  try {
    const st = fs.statSync(fp);
    return { mtimeMs: st.mtimeMs, size: st.size };
  } catch {
    return null;
  }
}

export function readJsonFileCached<T>(
  fp: string,
  fallback: T,
  ttlMs: number
): T {
  const store = getStore();
  const st = getStatSafe(fp);
  if (!st) return fallback;

  const cached = store.get(fp);
  if (
    cached &&
    cached.expiresAt > Date.now() &&
    cached.mtimeMs === st.mtimeMs &&
    cached.size === st.size
  ) {
    return cached.value as T;
  }

  try {
    const raw = fs.readFileSync(fp, "utf-8");
    const parsed = JSON.parse(raw || "null");
    const value = (parsed ?? fallback) as T;
    store.set(fp, { value, expiresAt: Date.now() + ttlMs, mtimeMs: st.mtimeMs, size: st.size });
    return value;
  } catch {
    return fallback;
  }
}

export function readTextTailCached(
  fp: string,
  tailLines: number,
  ttlMs: number
): string[] {
  const store = getStore();
  const st = getStatSafe(fp);
  if (!st) return [];

  const key = `${fp}::tail:${tailLines}`;
  const cached = store.get(key);
  if (
    cached &&
    cached.expiresAt > Date.now() &&
    cached.mtimeMs === st.mtimeMs &&
    cached.size === st.size
  ) {
    return cached.value as string[];
  }

  try {
    const raw = fs.readFileSync(fp, "utf-8");
    const lines = raw.split(/\r?\n/).slice(-tailLines);
    store.set(key, { value: lines, expiresAt: Date.now() + ttlMs, mtimeMs: st.mtimeMs, size: st.size });
    return lines;
  } catch {
    return [];
  }
}

export function listDirCached(
  dir: string,
  opts: { ext?: string; limit?: number; ttlMs: number }
): string[] {
  const store = getStore();
  const st = getStatSafe(dir);
  if (!st) return [];

  const key = `${dir}::dir:${opts.ext || ""}:${opts.limit || ""}`;
  const cached = store.get(key);
  if (
    cached &&
    cached.expiresAt > Date.now() &&
    cached.mtimeMs === st.mtimeMs &&
    cached.size === st.size
  ) {
    return cached.value as string[];
  }

  try {
    const ext = (opts.ext || "").toLowerCase();
    const files = fs.readdirSync(dir).filter((f) => (ext ? f.toLowerCase().endsWith(ext) : true));
    const withMtime = files.map((f) => ({
      name: f,
      mtime: getStatSafe(path.join(dir, f))?.mtimeMs || 0,
    }));
    withMtime.sort((a, b) => b.mtime - a.mtime);
    const out = (opts.limit ? withMtime.slice(0, opts.limit) : withMtime).map((f) => f.name);
    store.set(key, { value: out, expiresAt: Date.now() + opts.ttlMs, mtimeMs: st.mtimeMs, size: st.size });
    return out;
  } catch {
    return [];
  }
}

export function readCsvRowsCached(
  fp: string,
  ttlMs: number,
  maxRows: number
): { header: string; rows: Array<{ category: string; brand: string; model: string; series: string; trim: string }> } {
  const store = getStore();
  const st = getStatSafe(fp);
  if (!st) return { header: "", rows: [] };

  const key = `${fp}::csv:${maxRows}`;
  const cached = store.get(key);
  if (
    cached &&
    cached.expiresAt > Date.now() &&
    cached.mtimeMs === st.mtimeMs &&
    cached.size === st.size
  ) {
    return cached.value as any;
  }

  try {
    const raw = fs.readFileSync(fp, "utf-8");
    const lines = raw.split(/\r?\n/).filter(Boolean);
    const header = lines.shift() || "";
    const out: Array<{ category: string; brand: string; model: string; series: string; trim: string }> = [];
    for (const line of lines) {
      if (out.length >= maxRows) break;
      const parts = line.split(",").map((s) => s.trim());
      const [cat, b, m, s, t] = [parts[0] || "", parts[1] || "", parts[2] || "", parts[3] || "", parts[4] || ""];
      if (!cat || !b) continue;
      out.push({ category: cat, brand: b, model: m, series: s, trim: t });
    }
    const value = { header, rows: out };
    store.set(key, { value, expiresAt: Date.now() + ttlMs, mtimeMs: st.mtimeMs, size: st.size });
    return value;
  } catch {
    return { header: "", rows: [] };
  }
}

