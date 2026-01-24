import fs from "node:fs";
import path from "node:path";

const ORIGIN = "https://satariz.com";

function argValue(name, fallback = null) {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx === -1) return fallback;
  const v = process.argv[idx + 1];
  if (!v || v.startsWith("--")) return fallback;
  return v;
}

function argFlag(name) {
  return process.argv.includes(`--${name}`);
}

function decodeUnicodeEscapes(input) {
  return input.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

function extractListingUrls(html) {
  const out = new Set();
  const re = /href="(\/ilan\/[^"]+)"/g;
  let m;
  while ((m = re.exec(html))) {
    const rel = m[1];
    if (!rel.startsWith("/ilan/vasita")) continue;
    out.add(new URL(rel, ORIGIN).toString());
  }
  return [...out];
}

function extractCategoryString(html) {
  const patterns = [
    /\\\\+"category\\\\+":\\\\+"([^\\\\"]+)\\\\+"/,
    /"category"\s*:\s*"([^"]+)"/,
    /\\\"category\\\":\\\"([^\\\"]+)\\\"/,
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1]) return decodeUnicodeEscapes(m[1]);
  }
  return null;
}

function toTupleFromCategory(category) {
  const parts = String(category)
    .split(" / ")
    .map((x) => x.trim())
    .filter(Boolean);

  if (parts.length < 2) return null;

  let tail = parts.slice();
  const p0 = (tail[0] || "").toLowerCase();
  if (p0 === "vasıta" || p0 === "vasita") tail = tail.slice(1);

  const p1 = (tail[0] || "").toLowerCase();
  const typeSet = new Set([
    "araç",
    "arac",
    "motosiklet",
    "deniz araçları",
    "deniz araclari",
    "karavan",
    "hava araçları",
    "hava araclari",
    "ticari araçlar",
    "ticari araclar",
    "hasarlı araçlar",
    "hasarli araclar",
    "kiralık araçlar",
    "kiralik araclar",
    "klasik araçlar",
    "klasik araclar",
  ]);
  if (typeSet.has(p1)) tail = tail.slice(1);

  const brand = tail[0] || "";
  const model = tail[1] || "";
  const series = tail[2] || "";
  const trim = tail[3] || "";

  if (!brand || !model) return null;
  return { brand, model, series, trim };
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; VarsagelScraper/1.0; +https://varsagel.com)",
      "Accept": "text/html,application/xhtml+xml",
    },
    redirect: "follow",
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${url} ${t.slice(0, 200)}`);
  }
  return await res.text();
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function csvEscape(v) {
  const s = String(v ?? "");
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

async function main() {
  const pages = Number(argValue("pages", "20"));
  const startPage = Number(argValue("startPage", "1"));
  const delayMs = Number(argValue("delayMs", "150"));
  const outDir = argValue("outDir", "data");
  const dryRun = argFlag("dryRun");

  if (!Number.isFinite(pages) || pages < 1) throw new Error("--pages >= 1 olmalı");
  if (!Number.isFinite(startPage) || startPage < 1) throw new Error("--startPage >= 1 olmalı");
  if (!Number.isFinite(delayMs) || delayMs < 0) throw new Error("--delayMs >= 0 olmalı");

  const outAbs = path.resolve(process.cwd(), outDir);
  fs.mkdirSync(outAbs, { recursive: true });

  const tuples = new Map();
  const listingSeen = new Set();

  for (let p = startPage; p < startPage + pages; p++) {
    const listUrl = `${ORIGIN}/vasita?page=${p}`;
    const html = await fetchText(listUrl);
    const listingUrls = extractListingUrls(html);
    if (listingUrls.length === 0) break;

    for (const u of listingUrls) {
      if (listingSeen.has(u)) continue;
      listingSeen.add(u);

      const detailHtml = await fetchText(u);
      const category = extractCategoryString(detailHtml);
      if (!category) {
        if (delayMs) await sleep(delayMs);
        continue;
      }
      const t = toTupleFromCategory(category);
      if (t) {
        const key = `${t.brand}|||${t.model}|||${t.series}|||${t.trim}`;
        if (!tuples.has(key)) tuples.set(key, t);
      }
      if (delayMs) await sleep(delayMs);
    }
  }

  const rows = [...tuples.values()].sort((a, b) =>
    `${a.brand}|${a.model}|${a.series}|${a.trim}`.localeCompare(`${b.brand}|${b.model}|${b.series}|${b.trim}`, "tr")
  );

  if (dryRun) {
    process.stdout.write(JSON.stringify({ count: rows.length, sample: rows.slice(0, 10) }, null, 2));
    process.stdout.write("\n");
    return;
  }

  const jsonPath = path.join(outAbs, "satariz-vasita-hierarchy.json");
  fs.writeFileSync(jsonPath, JSON.stringify(rows, null, 2), "utf8");

  const csvPath = path.join(outAbs, "satariz-vasita-hierarchy.csv");
  const csv = ["Marka,Model,Motor/Seri,Donanım/Paket"]
    .concat(rows.map((r) => [r.brand, r.model, r.series, r.trim].map(csvEscape).join(",")))
    .join("\n");
  fs.writeFileSync(csvPath, csv, "utf8");

  process.stdout.write(`OK ${rows.length}\n`);
  process.stdout.write(`${jsonPath}\n`);
  process.stdout.write(`${csvPath}\n`);
}

main().catch((e) => {
  process.stderr.write(String(e?.stack || e?.message || e) + "\n");
  process.exit(1);
});
