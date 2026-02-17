"use client";

import { Search, X, Hash, Loader2, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CATEGORIES } from "@/data/categories";

type SearchMode = "full" | "icon";

type ListingSuggestion = {
  id: string;
  title: string;
  city?: string;
  district?: string;
};

type TalepMatch = {
  id: string;
  title: string;
  code: string;
};

const SEARCH_PLACEHOLDER = "Kelime veya Talep No (6/9 hane) ile ara…";

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

function normalizeQuery(input: string) {
  return String(input || "").trim().replace(/\s+/g, " ");
}

function parseTalepNoCandidate(input: string) {
  let s = normalizeQuery(input);
  if (!s) return { digits: null as string | null, exact: false };
  if (s.startsWith("#")) s = s.slice(1);
  if (/^t\d+$/i.test(s)) s = s.slice(1);
  if (!/^\d{1,9}$/.test(s)) return { digits: null as string | null, exact: false };
  return { digits: s, exact: s.length === 6 || s.length === 9 };
}

function renderHighlighted(text: string, needle: string) {
  const t = String(text || "");
  const n = String(needle || "").trim();
  if (!t || !n) return t;

  const lowerT = t.toLowerCase();
  const lowerN = n.toLowerCase();
  const out: ReactNode[] = [];
  let i = 0;
  let k = 0;
  while (true) {
    const idx = lowerT.indexOf(lowerN, i);
    if (idx < 0) break;
    if (idx > i) out.push(t.slice(i, idx));
    const part = t.slice(idx, idx + n.length);
    out.push(
      <span key={`h:${k}`} className="text-cyan-700 font-extrabold">
        {part}
      </span>
    );
    k += 1;
    i = idx + n.length;
  }
  if (i < t.length) out.push(t.slice(i));
  return out;
}

function readRecent(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem("headerSearchRecent");
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map(String).filter(Boolean) : [];
  } catch {
    return [];
  }
}

function writeRecent(next: string[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem("headerSearchRecent", JSON.stringify(next.slice(0, 8)));
  } catch {}
}

export default function HeaderSearch({ mode = "full" }: { mode?: SearchMode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const initialQ = useMemo(() => normalizeQuery(searchParams.get("q") || ""), [searchParams]);

  const [query, setQuery] = useState(initialQ);
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [listings, setListings] = useState<ListingSuggestion[]>([]);
  const [talepMatch, setTalepMatch] = useState<TalepMatch | null>(null);
  const [talepNotFound, setTalepNotFound] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recent, setRecent] = useState<string[]>([]);
  const defaultCategorySlug = CATEGORIES[0]?.slug || "";

  const rootRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listingCacheRef = useRef(new Map<string, ListingSuggestion[]>());
  const talepCacheRef = useRef(new Map<string, TalepMatch | null>());

  const debounced = useDebouncedValue(query, 220);
  const normalized = useMemo(() => normalizeQuery(debounced), [debounced]);
  const talepCandidate = useMemo(() => parseTalepNoCandidate(normalized), [normalized]);
  const showTalepNo = useMemo(() => !!talepCandidate.digits, [talepCandidate.digits]);
  const exactTalepNo = useMemo(() => !!talepCandidate.digits && talepCandidate.exact, [talepCandidate.digits, talepCandidate.exact]);

  useEffect(() => {
    setRecent(readRecent());
  }, []);


  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node | null;
      if (!t) return;
      if (!rootRef.current?.contains(t)) {
        setOpen(false);
        setSelectedIndex(-1);
      }
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [open]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const t = setTimeout(() => inputRef.current?.focus(), 0);
    return () => clearTimeout(t);
  }, [mobileOpen]);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    async function run() {
      setTalepMatch(null);
      setTalepNotFound(false);
      setListings([]);
      if (!open) return;
      if (!normalized) return;

      if (exactTalepNo && talepCandidate.digits) {
        const cached = talepCacheRef.current.get(talepCandidate.digits);
        if (cached !== undefined) {
          setTalepMatch(cached);
          setTalepNotFound(cached === null);
          return;
        }

        setLoading(true);
        try {
          const res = await fetch(`/api/talep?id=${encodeURIComponent(talepCandidate.digits)}`, {
            cache: "no-store",
            signal: controller.signal,
          });
          if (!res.ok) {
            talepCacheRef.current.set(talepCandidate.digits, null);
            if (!cancelled) setTalepNotFound(true);
            return;
          }
          const data = await res.json();
          if (cancelled) return;
          if (data?.id) {
            const match = {
              id: String(data.id),
              title: String(data.title || "Talep"),
              code: talepCandidate.digits,
            };
            talepCacheRef.current.set(talepCandidate.digits, match);
            setTalepMatch(match);
            setTalepNotFound(false);
          } else {
            talepCacheRef.current.set(talepCandidate.digits, null);
            setTalepNotFound(true);
          }
        } finally {
          if (!cancelled) setLoading(false);
        }
        return;
      }

      if (normalized.length < 2) return;

      const cachedListings = listingCacheRef.current.get(normalized);
      if (cachedListings !== undefined) {
        setListings(cachedListings);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(
          `/api/listings?q=${encodeURIComponent(normalized)}&limit=6&page=1`,
          { cache: "no-store", signal: controller.signal }
        );
        if (!res.ok) return;
        const json = await res.json();
        if (cancelled) return;
        const data = Array.isArray(json?.data) ? json.data : [];
        const mapped: ListingSuggestion[] = data
          .map((l: any) => ({
            id: String(l?.id || ""),
            title: String(l?.title || ""),
            city: String(l?.location?.city || ""),
            district: String(l?.location?.district || ""),
          }))
          .filter((x: any) => x.id && x.title);
        listingCacheRef.current.set(normalized, mapped);
        setListings(mapped);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      controller.abort();
      cancelled = true;
    };
  }, [normalized, exactTalepNo, open, talepCandidate.digits]);

  const items = useMemo(() => {
    const out: Array<
      | { kind: "section"; label: string; action?: "clearRecent" }
      | { kind: "hint"; label: string }
      | { kind: "action"; label: string; q: string }
      | { kind: "talepMatch"; id: string; title: string; code: string }
      | { kind: "talepNo"; code: string }
      | { kind: "listing"; id: string; title: string; subtitle: string }
      | { kind: "recent"; q: string }
    > = [];

    if (normalized) {
      out.push({ kind: "action", label: "Arama yap", q: normalized });
    }

    if (exactTalepNo && talepCandidate.digits) {
      out.push({ kind: "section", label: "Talep No" });
      if (talepMatch) out.push({ kind: "talepMatch", ...talepMatch });
      if (!talepMatch && talepNotFound) out.push({ kind: "hint", label: "Talep bulunamadı. Kelime ile arama yapabilirsiniz." });
      if (!talepMatch && !talepNotFound) out.push({ kind: "talepNo", code: talepCandidate.digits });
    } else if (showTalepNo && talepCandidate.digits) {
      out.push({ kind: "section", label: "Talep No" });
      out.push({ kind: "hint", label: "Talep No için 6 veya 9 hane girin (örn. 123456789)." });
    }

    if (!exactTalepNo && listings.length > 0) {
      out.push({ kind: "section", label: "Talepler" });
      listings.forEach((l) => {
        const loc = [l.city, l.district].filter(Boolean).join(" / ");
        out.push({ kind: "listing", id: l.id, title: l.title, subtitle: loc });
      });
    }

    if (!normalized) {
      if (recent.length > 0) {
        out.push({ kind: "section", label: "Son aramalar", action: "clearRecent" });
        recent.slice(0, 6).forEach((q) => out.push({ kind: "recent", q }));
      } else {
        out.push({ kind: "hint", label: "Kelime veya 6/9 haneli Talep No yazın." });
      }
    }

    if (normalized && normalized.length < 2 && !showTalepNo) {
      out.push({ kind: "hint", label: "Daha iyi sonuçlar için en az 2 karakter yazın." });
    }

    if (normalized && !loading && !exactTalepNo && listings.length === 0 && normalized.length >= 2) {
      out.push({ kind: "hint", label: "Öneri bulunamadı. Enter ile arama yapabilirsiniz." });
    }

    return out;
  }, [exactTalepNo, listings, loading, normalized, recent, showTalepNo, talepCandidate.digits, talepMatch, talepNotFound]);

  const isSelectable = (it: any) => it.kind !== "section" && it.kind !== "hint";

  const nextSelectableIndex = (from: number, dir: 1 | -1) => {
    if (items.length === 0) return -1;
    let i = from;
    for (let step = 0; step < items.length; step += 1) {
      i += dir;
      if (i < 0) i = items.length - 1;
      if (i >= items.length) i = 0;
      if (isSelectable(items[i])) return i;
    }
    return -1;
  };

  const goSearch = async (raw: string) => {
    const q = normalizeQuery(raw);
    if (!q) return;

    const nextRecent = [q, ...recent.filter((r) => r !== q)].slice(0, 8);
    setRecent(nextRecent);
    writeRecent(nextRecent);

    const talep = parseTalepNoCandidate(q);
    if (talep.exact && talep.digits) {
      setLoading(true);
      try {
        const res = await fetch(`/api/talep?id=${encodeURIComponent(talep.digits)}`, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data?.id) {
            router.push(`/talep/${encodeURIComponent(String(data.id))}`);
            setOpen(false);
            setSelectedIndex(-1);
            setMobileOpen(false);
            return;
          }
        }
      } finally {
        setLoading(false);
      }
    }

    const fallbackCategoryPath = defaultCategorySlug ? `/kategori/${defaultCategorySlug}` : "/";
    const basePath = pathname.startsWith("/kategori/") && pathname.length > 9
      ? pathname
      : pathname === "/"
        ? fallbackCategoryPath
        : "/";
    const params = new URLSearchParams();
    params.set("q", q);
    const url = params.toString() ? `${basePath}?${params.toString()}` : basePath;
    router.push(url);
    setOpen(false);
    setSelectedIndex(-1);
    setMobileOpen(false);
  };

  const onKeyDown = async (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setOpen(false);
      setSelectedIndex(-1);
      setMobileOpen(false);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = nextSelectableIndex(selectedIndex < 0 ? -1 : selectedIndex, 1);
      setSelectedIndex(next);
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      const next = nextSelectableIndex(selectedIndex < 0 ? 0 : selectedIndex, -1);
      setSelectedIndex(next);
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      const picked = items[selectedIndex];
      if (picked) {
        if (picked.kind === "talepMatch") return goSearch(picked.code);
        if (picked.kind === "talepNo") return goSearch(picked.code);
        if (picked.kind === "listing") {
          router.push(`/talep/${encodeURIComponent(picked.id)}`);
          setOpen(false);
          setSelectedIndex(-1);
          setMobileOpen(false);
          return;
        }
        if (picked.kind === "recent") return goSearch(picked.q);
        if (picked.kind === "action") return goSearch(picked.q);
      }
      return goSearch(query);
    }
  };

  const fullInput = (
    <div ref={rootRef} className="relative w-full">
      <div
        className={[
          "flex items-center gap-2 rounded-2xl border bg-white shadow-sm transition-colors",
          open ? "border-cyan-300 ring-2 ring-cyan-100" : "border-gray-200 hover:border-gray-300",
        ].join(" ")}
      >
        <div className="pl-3 text-gray-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            setOpen(true);
            setSelectedIndex(-1);
          }}
          onKeyDown={onKeyDown}
          placeholder={SEARCH_PLACEHOLDER}
          suppressHydrationWarning
          className="w-full h-10 bg-transparent outline-none text-sm text-gray-800 placeholder:text-gray-400 pr-2"
          inputMode={showTalepNo ? "numeric" : "text"}
        />
        <div className="mr-2 flex items-center gap-2">
          {loading && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
          {query.trim() ? (
            <button
              type="button"
                  onClick={() => {
                setQuery("");
                setTalepMatch(null);
                setTalepNotFound(false);
                setListings([]);
                setSelectedIndex(-1);
                inputRef.current?.focus();
              }}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Temizle"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => goSearch(query)}
              className="px-3 h-8 rounded-xl bg-cyan-600 text-white text-xs font-semibold hover:bg-cyan-700 transition-colors"
            >
              Ara
            </button>
          )}
        </div>
      </div>

      {open && items.length > 0 && (
        <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden">
          <div className="py-2">
            {items.map((it, idx) => {
              const active = idx === selectedIndex;
              const base =
                "w-full text-left px-4 py-2.5 hover:bg-cyan-50 transition-colors flex items-center gap-3";
              const cls = active ? `${base} bg-cyan-50` : base;

              if (it.kind === "section") {
                return (
                  <div key={`section:${it.label}:${idx}`} className="px-4 py-2 flex items-center justify-between">
                    <div className="text-[11px] font-extrabold uppercase tracking-wide text-gray-500">
                      {it.label}
                    </div>
                    {it.action === "clearRecent" && (
                      <button
                        type="button"
                        onClick={() => {
                          setRecent([]);
                          try {
                            window.localStorage.removeItem("headerSearchRecent");
                          } catch {}
                          setSelectedIndex(-1);
                        }}
                        className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-bold text-gray-600 hover:bg-gray-100"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Temizle
                      </button>
                    )}
                  </div>
                );
              }

              if (it.kind === "hint") {
                return (
                  <div key={`hint:${idx}`} className="px-4 py-2 text-xs font-semibold text-gray-500">
                    {it.label}
                  </div>
                );
              }

              if (it.kind === "action") {
                return (
                  <button
                    key={`action:${it.q}`}
                    type="button"
                    onMouseEnter={() => setSelectedIndex(idx)}
                    onClick={() => goSearch(it.q)}
                    className={cls}
                  >
                    <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center border border-cyan-100">
                      <Search className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-gray-900 truncate">
                        {renderHighlighted(`“${it.q}” için ara`, it.q)}
                      </div>
                      <div className="text-xs text-gray-500">Enter ile de arayabilirsiniz</div>
                    </div>
                  </button>
                );
              }

              if (it.kind === "talepMatch") {
                return (
                  <button
                    key={`talepMatch:${it.id}`}
                    type="button"
                    onMouseEnter={() => setSelectedIndex(idx)}
                    onClick={() => goSearch(it.code)}
                    className={cls}
                  >
                    <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center border border-cyan-100">
                      <Hash className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-gray-900 truncate">{renderHighlighted(it.title, normalized)}</div>
                      <div className="text-xs text-gray-500">Talep No: {it.code}</div>
                    </div>
                  </button>
                );
              }

              if (it.kind === "talepNo") {
                return (
                  <button
                    key={`talepNo:${it.code}`}
                    type="button"
                    onMouseEnter={() => setSelectedIndex(idx)}
                    onClick={() => goSearch(it.code)}
                    className={cls}
                  >
                    <div className="w-8 h-8 rounded-xl bg-gray-50 text-gray-700 flex items-center justify-center border border-gray-200">
                      <Hash className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-gray-900 truncate">Talep No ile ara</div>
                      <div className="text-xs text-gray-500">{it.code}</div>
                    </div>
                  </button>
                );
              }

              if (it.kind === "listing") {
                return (
                  <button
                    key={`listing:${it.id}`}
                    type="button"
                    onMouseEnter={() => setSelectedIndex(idx)}
                    onClick={() => {
                      router.push(`/talep/${encodeURIComponent(it.id)}`);
                      setOpen(false);
                      setSelectedIndex(-1);
                      setMobileOpen(false);
                    }}
                    className={cls}
                  >
                    <div className="w-8 h-8 rounded-xl bg-gray-50 text-gray-700 flex items-center justify-center border border-gray-200">
                      <Search className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-gray-900 truncate">{renderHighlighted(it.title, normalized)}</div>
                      <div className="text-xs text-gray-500 truncate">{it.subtitle || "Talep"}</div>
                    </div>
                  </button>
                );
              }

              return (
                <button
                  key={`recent:${it.q}`}
                  type="button"
                  onMouseEnter={() => setSelectedIndex(idx)}
                  onClick={() => goSearch(it.q)}
                  className={cls}
                >
                  <div className="w-8 h-8 rounded-xl bg-gray-50 text-gray-700 flex items-center justify-center border border-gray-200">
                    <Search className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-gray-900 truncate">{renderHighlighted(it.q, normalized)}</div>
                    <div className="text-xs text-gray-500">Son aramalar</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  if (mode === "icon") {
    return (
      <>
        <button
          type="button"
          onClick={() => {
            setMobileOpen(true);
            setOpen(true);
            setSelectedIndex(-1);
          }}
          className="p-2.5 text-gray-500 hover:text-cyan-600 hover:bg-cyan-50 rounded-xl transition-all"
          aria-label="Ara"
          title="Ara"
        >
          <Search className="w-5 h-5" />
        </button>

        {mobileOpen && (
          <div className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm">
            <div className="mx-auto max-w-2xl px-4 pt-5">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl p-3">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="text-sm font-bold text-gray-900">Arama</div>
                  <button
                    type="button"
                    onClick={() => setMobileOpen(false)}
                    className="p-2 rounded-xl hover:bg-gray-100 text-gray-500"
                    aria-label="Kapat"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                {fullInput}
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return fullInput;
}
