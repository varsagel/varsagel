import fs from "node:fs";
import path from "node:path";
import xlsx from "xlsx";

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function jitter(ms, ratio = 0.25) {
  const base = Math.max(0, Number(ms) || 0);
  const spread = Math.floor(base * ratio);
  return base + Math.floor(Math.random() * (spread + 1));
}

async function fetchWithRetry(url, tries = 3, opts = {}) {
  let last = null;
  for (let i = 0; i < tries; i++) {
    const headers = {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "accept-language": "tr-TR,tr;q=0.9,en;q=0.8",
      ...(opts?.headers || {}),
    };

    const r = await fetch(url, { headers });
    const text = await r.text();
    last = { status: r.status, text };
    if (r.ok) return last;
    const base = r.status === 429 ? 2000 : r.status === 403 ? 1400 : 650;
    await sleep(jitter(base + i * 700));
  }
  return last;
}

function extractTitleFromHtml(html) {
  const m = /<title>([\s\S]*?)<\/title>/i.exec(String(html || ""));
  if (!m) return "";
  return decodeHtmlEntities(String(m[1] || "")).replace(/\s+/g, " ").trim();
}

function decodeHtmlEntities(s) {
  const str = String(s || "");
  const named = str
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
  return named.replace(/&#(\d+);/g, (_, n) => {
    const code = Number(n);
    if (!Number.isFinite(code)) return _;
    try {
      return String.fromCharCode(code);
    } catch {
      return _;
    }
  });
}

function findListingUrls(html, limit = 60) {
  const s = String(html || "");
  const reRel = /\/ilan\/[a-z0-9\-\/]+/gi;
  const rel = s.match(reRel) || [];
  const uniq = Array.from(new Set(rel.map((u) => `https://www.satariz.com${u}`)));
  return uniq.slice(0, Math.max(1, limit));
}

function extractMaxPageNumber(html, hardCap = 120) {
  const s = String(html || "");
  const re = new RegExp("\\\\?page=(\\\\d+)", "gi");
  const matches = Array.from(s.matchAll(re)).map((m) => Number(m[1]) || 0);
  const max = matches.length ? Math.max(...matches) : 1;
  return Math.max(1, Math.min(hardCap, max));
}

function withPage(url, page) {
  const u = new URL(url);
  u.searchParams.set("page", String(page));
  return u.toString();
}

function normalizeToken(s) {
  return String(s || "")
    .toLocaleLowerCase("tr")
    .replace(/[(){}\[\],.!?:;'"`’“”]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const STOPWORDS = new Set(
  [
    "dorse",
    "romork",
    "römork",
    "treyler",
    "tenteli",
    "damperli",
    "frigo",
    "kasa",
    "karoser",
    "ust",
    "üst",
    "yapi",
    "yapı",
    "cekici",
    "çekici",
    "tanker",
    "silobas",
    "lowbed",
    "platform",
    "flatbed",
    "dingil",
    "aks",
    "aksli",
    "aksli̇",
    "genel",
    "satilik",
    "satılık",
    "kiralik",
    "kiralık",
    "sahibinden",
    "sifir",
    "sıfır",
    "ikinci",
    "el",
  ].map(normalizeToken),
);

function extractBrandCandidate(title) {
  const raw = String(title || "")
    .split("|")[0]
    ?.replace(/\s+İlanları\s*$/i, "")
    .trim();
  if (!raw) return null;

  const tokens = raw
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean);
  if (tokens.length === 0) return null;

  const first = tokens[0];
  const isYear = /^\d{4}$/.test(first) && Number(first) >= 1900 && Number(first) <= 2100;
  const candRaw = isYear ? tokens[1] : tokens[0];
  const cand = String(candRaw || "")
    .replace(/[^0-9a-zA-ZçğıöşüÇĞİÖŞÜ\-&]/g, "")
    .replace(/\d+$/g, "")
    .trim();
  const norm = normalizeToken(cand);
  if (!norm) return null;
  if (STOPWORDS.has(norm)) return null;
  if (/^\d+$/.test(norm)) return null;
  if (norm.length < 2) return null;
  return cand;
}

async function collectListingUrls(listUrl, opts) {
  const maxPages = Math.max(1, Number(opts?.pages || 3) || 3);
  const perPageUrls = Math.max(1, Number(opts?.perPageUrls || 80) || 80);
  const out = new Set();

  const page1 = await fetchWithRetry(listUrl, 3, { headers: { referer: "https://www.satariz.com/" } });
  if (!page1?.text) return [];
  const maxFromHtml = extractMaxPageNumber(page1.text, 120);
  const pagesToTry = Math.min(maxPages, maxFromHtml);

  findListingUrls(page1.text, perPageUrls).forEach((u) => out.add(u));
  for (let p = 2; p <= pagesToTry; p++) {
    const url = withPage(listUrl, p);
    const res = await fetchWithRetry(url, 3, { headers: { referer: listUrl } });
    if (res?.text) findListingUrls(res.text, perPageUrls).forEach((u) => out.add(u));
    await sleep(jitter(220));
  }

  return Array.from(out);
}

async function main() {
  const outJsonPath =
    process.env.OUT_JSON || path.join(process.cwd(), "src", "data", "satariz-commercial-brands.json");
  const outXlsxPath =
    process.env.OUT_XLSX || path.join(process.cwd(), "public", "exports", "satariz-ticari-marka-listeleri.xlsx");
  const cachePath =
    process.env.CACHE_JSON ||
    path.join(process.cwd(), "scripts", "satariz", ".cache", "satariz-commercial-brands.partial.json");

  const base = "https://www.satariz.com";
  const subtypes = String(process.env.SUBTYPES || "dorse,romork,karoser-ust-yapi")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const pages = Math.max(1, Number(process.env.PAGES || 3) || 3);
  const perPageUrls = Math.max(1, Number(process.env.PER_PAGE_URLS || 80) || 80);
  const detailLimit = Math.max(1, Number(process.env.DETAIL_LIMIT || 140) || 140);
  const concurrency = Math.max(1, Number(process.env.CONCURRENCY || 4) || 4);
  const force = String(process.env.FORCE || "") === "1";

  let existing = {};
  if (fs.existsSync(cachePath)) {
    try {
      existing = JSON.parse(fs.readFileSync(cachePath, "utf8"));
    } catch {
      existing = {};
    }
  }
  const results = { ...existing };

  const tasks = subtypes.map((st) => {
    const slug =
      st === "dorse"
        ? "vasita-ticari-araclar-dorse"
        : st === "romork"
          ? "vasita-ticari-araclar-romork"
          : st === "karoser-ust-yapi"
            ? "vasita-ticari-araclar-karoser-ust-yapi"
            : st;
    return { subtype: st, slug, url: `${base}/${slug}` };
  });

  let idx = 0;
  const worker = async () => {
    while (idx < tasks.length) {
      const t = tasks[idx];
      idx += 1;
      if (!t) continue;
      if (!force && Array.isArray(results[t.subtype]) && results[t.subtype].length > 0) continue;

      const listingUrls = await collectListingUrls(t.url, { pages, perPageUrls });
      const shuffled = listingUrls
        .slice(0)
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.min(detailLimit, listingUrls.length));

      const counts = new Map();
      for (const u of shuffled) {
        const res = await fetchWithRetry(u, 3, { headers: { referer: t.url } });
        if (!res?.text) continue;
        const title = extractTitleFromHtml(res.text);
        const cand = extractBrandCandidate(title);
        if (!cand) continue;
        const norm = normalizeToken(cand);
        counts.set(norm, (counts.get(norm) || 0) + 1);
        await sleep(jitter(120));
      }

      const sorted = Array.from(counts.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([norm]) => norm)
        .filter((x) => x && !STOPWORDS.has(x));

      const titleCase = (s) =>
        String(s)
          .split(" ")
          .filter(Boolean)
          .map((w) => w[0].toLocaleUpperCase("tr") + w.slice(1))
          .join(" ");

      results[t.subtype] = sorted.map(titleCase);

      ensureDir(path.dirname(cachePath));
      fs.writeFileSync(cachePath, JSON.stringify(results, null, 2), "utf8");
      process.stdout.write(`${t.subtype}\tbrands=${results[t.subtype].length}\n`);
    }
  };

  await Promise.all(Array.from({ length: concurrency }, () => worker()));

  ensureDir(path.dirname(outJsonPath));
  fs.writeFileSync(outJsonPath, JSON.stringify(results, null, 2), "utf8");

  const wb = xlsx.utils.book_new();
  const indexRows = Object.keys(results)
    .sort((a, b) => a.localeCompare(b, "tr"))
    .map((k) => ({ subtype: k, brandCount: Array.isArray(results[k]) ? results[k].length : 0 }));
  xlsx.utils.book_append_sheet(wb, xlsx.utils.json_to_sheet(indexRows), "INDEX");

  for (const subtype of Object.keys(results).sort((a, b) => a.localeCompare(b, "tr"))) {
    const brands = Array.isArray(results[subtype]) ? results[subtype] : [];
    const ws = xlsx.utils.json_to_sheet(brands.map((b) => ({ brand: b })));
    const name = String(subtype).slice(0, 31);
    xlsx.utils.book_append_sheet(wb, ws, name);
  }

  ensureDir(path.dirname(outXlsxPath));
  xlsx.writeFile(wb, outXlsxPath);

  process.stdout.write(`OK\n${outJsonPath}\n${outXlsxPath}\n`);
}

main().catch((e) => {
  process.stderr.write(String(e?.message || e) + "\n");
  process.exit(1);
});
