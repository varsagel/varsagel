import fs from "node:fs";
import path from "node:path";

const ORIGIN = "https://www.satariz.com";

const SUBCATEGORIES = [
  { key: "arac", label: "Araç", rootPath: "/vasita-arac" },
  { key: "motosiklet", label: "Motosiklet", rootPath: "/vasita-motosiklet" },
  { key: "ticari-araclar", label: "Ticari Araçlar", rootPath: "/vasita-ticari-araclar" },
  { key: "kiralik-araclar", label: "Kiralık Araçlar", rootPath: "/kiralik-araclar" },
  { key: "klasik-araclar", label: "Klasik Araçlar", rootPath: "/klasik-araclar-vasita-klasik-araclar" },
  { key: "hasarli-araclar", label: "Hasarlı Araçlar", rootPath: "/vasita-hasarli-araclar" },
  { key: "karavan", label: "Karavan", rootPath: "/vasita-karavan" },
  { key: "deniz-araclari", label: "Deniz Araçları", rootPath: "/vasita-deniz-araclari" },
  { key: "hava-araclari", label: "Hava Araçları", rootPath: "/vasita-hava-araclari" },
];

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

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function htmlEntityDecode(s) {
  return String(s)
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchText(url) {
  const maxAttempts = 5;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), 30_000);
    try {
      const res = await fetch(url, {
        signal: ac.signal,
        redirect: "follow",
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; VarsagelScraper/1.0; +https://varsagel.com)",
          Accept: "text/html,application/xhtml+xml",
        },
      });
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status} ${url} ${body.slice(0, 160)}`);
      }
      return await res.text();
    } catch (e) {
      if (attempt === maxAttempts - 1) throw e;
      await sleep(250 * Math.pow(2, attempt));
    } finally {
      clearTimeout(t);
    }
  }
  throw new Error(`fetchText failed ${url}`);
}

function extractAnchors(html) {
  const out = [];
  const re = /<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(html))) {
    const href = m[1] || "";
    const inner = m[2] || "";
    const text = htmlEntityDecode(inner.replace(/<[^>]+>/g, " "))
      .replace(/^[\s▸•\-]+/g, "")
      .trim();
    if (!text) continue;
    out.push({ href, text });
  }
  return out;
}

function normalizePath(href) {
  try {
    const u = new URL(href, ORIGIN);
    if (u.origin !== new URL(ORIGIN).origin) return null;
    return u.pathname;
  } catch {
    return null;
  }
}

async function getChildrenPaths(parentPath) {
  const url = new URL(parentPath, ORIGIN).toString();
  const html = await fetchText(url);
  const anchors = extractAnchors(html);

  const wanted = new Map();
  for (const a of anchors) {
    const p = normalizePath(a.href);
    if (!p) continue;
    if (!p.startsWith(parentPath)) continue;
    if (p === parentPath) continue;
    if (p.includes("?") || p.includes("#")) continue;
    if (!p.startsWith(parentPath + "-")) continue;
    if (!wanted.has(p)) wanted.set(p, a.text);
  }

  return [...wanted.entries()].map(([p, text]) => ({ path: p, label: text }));
}

function titleFromSlug(slug) {
  const s = String(slug || "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!s) return "";
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

function extractListingTuplesFromHtml(html, subcategoryKey, subcategoryLabel) {
  const anchors = extractAnchors(html);
  const tuples = new Map();
  for (const a of anchors) {
    const p = normalizePath(a.href);
    if (!p) continue;
    if (!p.startsWith("/ilan/")) continue;
    if (!p.includes(`/vasita-${subcategoryKey}-`)) continue;

    const tail = p.split("/").pop() || "";
    const parts = tail.split("-");
    const last = parts[parts.length - 1] || "";
    const hasNumericId = /^\d+$/.test(last);
    const titleParts = hasNumericId ? parts.slice(0, -1) : parts;
    const fullSlug = titleParts.join("-");

    let cleaned = fullSlug;
    const prefix = `vasita-${subcategoryKey}-`;
    if (cleaned.startsWith(prefix)) cleaned = cleaned.slice(prefix.length);
    cleaned = cleaned.replace(/^(satilik|kiralik)-/i, "");

    const model = titleFromSlug(cleaned).trim();
    if (!model) continue;

    const key = `${subcategoryLabel}|||${model}`;
    if (!tuples.has(key)) {
      tuples.set(key, { brand: "", model, series: "", trim: "" });
    }
  }
  return [...tuples.values()];
}

function csvEscape(v) {
  const s = String(v ?? "");
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

async function safeWriteJson(filePath, obj) {
  const tmp = `${filePath}.${process.pid}.${Date.now()}.${Math.random().toString(16).slice(2)}.tmp`;
  const content = JSON.stringify(obj, null, 2);
  fs.writeFileSync(tmp, content, "utf8");

  const retriable = new Set(["EPERM", "EBUSY", "EACCES"]);
  for (let attempt = 0; attempt < 6; attempt++) {
    try {
      try {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      } catch {}
      fs.renameSync(tmp, filePath);
      return;
    } catch (e) {
      const code = e?.code || "";
      if (retriable.has(code)) {
        await sleep(50 * Math.pow(2, attempt));
        continue;
      }
      try {
        fs.copyFileSync(tmp, filePath);
        try { fs.unlinkSync(tmp); } catch {}
        return;
      } catch {}
      break;
    }
  }

  try {
    fs.writeFileSync(filePath, content, "utf8");
  } catch {}
  try { fs.unlinkSync(tmp); } catch {}
  try {
    const legacyTmp = `${filePath}.tmp`;
    if (fs.existsSync(legacyTmp)) fs.unlinkSync(legacyTmp);
  } catch {}
}

async function scrapeOneSubcategory({ key, label, rootPath }, options) {
  const delayMs = options.delayMs;
  const outAbs = options.outAbs;
  const resume = options.resume;
  const maxBrands = options.maxBrands;
  const maxListings = options.maxListings;

  const statePath = path.join(outAbs, `satariz-vasita-${key}.state.json`);
  const csvPath = path.join(outAbs, `satariz-vasita-${key}.csv`);
  const jsonlPath = path.join(outAbs, `satariz-vasita-${key}.jsonl`);

  let state = {
    startedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completedBrandPaths: [],
    errors: [],
    rowsWritten: 0,
  };
  if (resume && fs.existsSync(statePath)) {
    try {
      state = JSON.parse(fs.readFileSync(statePath, "utf8"));
    } catch {}
  }

  const completed = new Set(Array.isArray(state.completedBrandPaths) ? state.completedBrandPaths : []);

  const csvExists = fs.existsSync(csvPath);
  const csvStream = fs.createWriteStream(csvPath, { flags: resume && csvExists ? "a" : "w" });
  const jsonlExists = fs.existsSync(jsonlPath);
  const jsonlStream = fs.createWriteStream(jsonlPath, { flags: resume && jsonlExists ? "a" : "w" });

  if (!(resume && csvExists)) {
    csvStream.write("Alt Kategori,Marka,Model,Motor/Seri,Donanım/Paket\n");
  }

  let rowsWritten = Number(state.rowsWritten || 0);
  const writeRow = (r) => {
    let brand = r.brand || "";
    let model = r.model || "";
    let series = r.series || "";
    let trim = r.trim || "";

    const isGroupish = (s) => {
      const v = String(s || "").trim().toLowerCase();
      if (!v) return false;
      if (v.includes("/")) return true;
      const set = new Set(["satılık", "satilik", "kiralık", "kiralik"]);
      return set.has(v);
    };

    if (isGroupish(brand) && model && series) {
      brand = model;
      model = series;
      series = trim;
      trim = "";
    }

    const row = {
      subcategory: label,
      brand,
      model,
      series,
      trim,
    };
    csvStream.write([row.subcategory, row.brand, row.model, row.series, row.trim].map(csvEscape).join(",") + "\n");
    jsonlStream.write(JSON.stringify(row) + "\n");
    rowsWritten++;
  };

  const flushState = async () => {
    state.updatedAt = new Date().toISOString();
    state.completedBrandPaths = [...completed];
    state.rowsWritten = rowsWritten;
    await safeWriteJson(statePath, state);
  };

  let brands = await getChildrenPaths(rootPath);
  if (Number.isFinite(maxBrands) && maxBrands > 0) brands = brands.slice(0, maxBrands);

  if (brands.length === 0) {
    const html = await fetchText(new URL(rootPath, ORIGIN).toString());
    let tuples = extractListingTuplesFromHtml(html, key, label);
    if (Number.isFinite(maxListings) && maxListings > 0) tuples = tuples.slice(0, maxListings);
    for (const t of tuples) writeRow(t);
    await flushState();
    return { key, label, csvPath, jsonlPath, statePath, rowsWritten };
  }
  for (const brand of brands) {
    if (completed.has(brand.path)) continue;
    try {
      const models = await getChildrenPaths(brand.path);
      if (delayMs) await sleep(delayMs);

      if (models.length === 0) {
        writeRow({ brand: brand.label, model: "", series: "", trim: "" });
        completed.add(brand.path);
        await flushState();
        continue;
      }

      for (const model of models) {
        const seriesList = await getChildrenPaths(model.path);
        if (delayMs) await sleep(delayMs);

        if (seriesList.length === 0) {
          writeRow({ brand: brand.label, model: model.label, series: "", trim: "" });
          continue;
        }

        for (const series of seriesList) {
          const trims = await getChildrenPaths(series.path);
          if (delayMs) await sleep(delayMs);

          if (trims.length === 0) {
            writeRow({ brand: brand.label, model: model.label, series: series.label, trim: "" });
            continue;
          }

          for (const trim of trims) {
            writeRow({ brand: brand.label, model: model.label, series: series.label, trim: trim.label });
          }
        }
      }

      completed.add(brand.path);
      await flushState();
      process.stdout.write(`ok ${label} ${brand.label} rows=${rowsWritten}\n`);
    } catch (e) {
      state.errors = Array.isArray(state.errors) ? state.errors : [];
      state.errors.push({
        at: new Date().toISOString(),
        subcategory: label,
        brand: brand.label,
        path: brand.path,
        error: String(e?.message || e),
      });
      await flushState();
      process.stdout.write(`err ${label} ${brand.label}\n`);
    }
  }

  csvStream.end();
  jsonlStream.end();
  await flushState();

  return { key, label, csvPath, jsonlPath, statePath, rowsWritten };
}

function mergeCsv(outputs, outAbs) {
  const outCsv = path.join(outAbs, "satariz-vasita-all.csv");
  const header = "Alt Kategori,Marka,Model,Motor/Seri,Donanım/Paket\n";
  fs.writeFileSync(outCsv, header, "utf8");

  for (const o of outputs) {
    if (!fs.existsSync(o.csvPath)) continue;
    const content = fs.readFileSync(o.csvPath, "utf8");
    const lines = content.split(/\r?\n/);
    const body = lines.slice(1).filter((l) => l.trim() !== "").join("\n");
    if (body) fs.appendFileSync(outCsv, body + "\n", "utf8");
  }

  return outCsv;
}

async function main() {
  const outDir = argValue("outDir", "data/satariz_taxonomy");
  const delayMs = Number(argValue("delayMs", "120"));
  const resume = argFlag("resume");
  const onlyArg = argValue("only", "");
  const maxBrands = Number(argValue("maxBrands", "0"));
  const maxListings = Number(argValue("maxListings", "200"));

  const outAbs = path.resolve(process.cwd(), outDir);
  fs.mkdirSync(outAbs, { recursive: true });

  const only = onlyArg
    ? new Set(onlyArg.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean))
    : null;

  const selected = only ? SUBCATEGORIES.filter((s) => only.has(s.key)) : SUBCATEGORIES;

  const outputs = [];
  for (const sc of selected) {
    const out = await scrapeOneSubcategory(sc, { outAbs, delayMs, resume, maxBrands, maxListings });
    outputs.push(out);
  }

  const allCsv = mergeCsv(outputs, outAbs);
  process.stdout.write(`OK\n${allCsv}\n`);
  for (const o of outputs) {
    process.stdout.write(`${o.label}: rows=${o.rowsWritten} csv=${o.csvPath}\n`);
  }
}

main().catch((e) => {
  process.stderr.write(String(e?.stack || e?.message || e) + "\n");
  process.exit(1);
});
