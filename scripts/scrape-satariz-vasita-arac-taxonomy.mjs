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
      throw new Error(`HTTP ${res.status} ${url} ${body.slice(0, 120)}`);
    }
    return await res.text();
  } finally {
    clearTimeout(t);
  }
}

function extractAnchors(html) {
  const out = [];
  const re = /<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(html))) {
    const href = m[1] || "";
    const inner = m[2] || "";
    const text = htmlEntityDecode(inner.replace(/<[^>]+>/g, " ")).replace(/^[\s▸•\-]+/g, "").trim();
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

function csvEscape(v) {
  const s = String(v ?? "");
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function safeWriteJson(filePath, obj) {
  const tmp = `${filePath}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(obj, null, 2), "utf8");
  fs.renameSync(tmp, filePath);
}

async function main() {
  const delayMs = Number(argValue("delayMs", "120"));
  const outDir = argValue("outDir", "data");
  const dryRun = argFlag("dryRun");
  const brandsArg = argValue("brands", "");
  const maxBrands = Number(argValue("maxBrands", "0"));
  const resume = argFlag("resume");

  const brandsFilter = brandsArg
    ? new Set(brandsArg.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean))
    : null;

  const outAbs = path.resolve(process.cwd(), outDir);
  fs.mkdirSync(outAbs, { recursive: true });

  const statePath = path.join(outAbs, "satariz-vasita-arac-taxonomy.state.json");
  const csvPath = path.join(outAbs, "satariz-vasita-arac-taxonomy.csv");
  const jsonlPath = path.join(outAbs, "satariz-vasita-arac-taxonomy.jsonl");

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

  const completedBrands = new Set(Array.isArray(state.completedBrandPaths) ? state.completedBrandPaths : []);

  const root = "/vasita-arac";
  const brands = await getChildrenPaths(root);
  let selectedBrands = brands;
  if (brandsFilter) {
    selectedBrands = brands.filter((b) => brandsFilter.has(b.path.replace("/vasita-arac-", "").toLowerCase()));
  }
  if (Number.isFinite(maxBrands) && maxBrands > 0) {
    selectedBrands = selectedBrands.slice(0, maxBrands);
  }

  if (dryRun) {
    process.stdout.write(JSON.stringify({ brands: selectedBrands.length, sampleBrands: selectedBrands.slice(0, 10) }, null, 2));
    process.stdout.write("\n");
    return;
  }

  const csvExists = fs.existsSync(csvPath);
  const csvStream = fs.createWriteStream(csvPath, { flags: resume && csvExists ? "a" : "w" });
  const jsonlExists = fs.existsSync(jsonlPath);
  const jsonlStream = fs.createWriteStream(jsonlPath, { flags: resume && jsonlExists ? "a" : "w" });

  if (!(resume && csvExists)) {
    csvStream.write("Marka,Model,Motor/Seri,Donanım/Paket\n");
  }

  let rowsWritten = Number(state.rowsWritten || 0);

  const writeRow = (r) => {
    const row = {
      brand: r.brand || "",
      model: r.model || "",
      series: r.series || "",
      trim: r.trim || "",
    };
    const csvLine = [row.brand, row.model, row.series, row.trim].map(csvEscape).join(",") + "\n";
    csvStream.write(csvLine);
    jsonlStream.write(JSON.stringify(row) + "\n");
    rowsWritten++;
  };

  const flushState = () => {
    state.updatedAt = new Date().toISOString();
    state.completedBrandPaths = [...completedBrands];
    state.rowsWritten = rowsWritten;
    safeWriteJson(statePath, state);
  };

  for (const brand of selectedBrands) {
    if (completedBrands.has(brand.path)) continue;
    try {
      const models = await getChildrenPaths(brand.path);
      if (delayMs) await sleep(delayMs);

      if (models.length === 0) {
        writeRow({ brand: brand.label, model: "", series: "", trim: "" });
        completedBrands.add(brand.path);
        flushState();
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

      completedBrands.add(brand.path);
      flushState();
      process.stdout.write(`brand_ok ${brand.label} rows=${rowsWritten}\n`);
    } catch (e) {
      state.errors = Array.isArray(state.errors) ? state.errors : [];
      state.errors.push({
        at: new Date().toISOString(),
        brand: brand.label,
        path: brand.path,
        error: String(e?.message || e),
      });
      flushState();
      process.stdout.write(`brand_err ${brand.label}\n`);
    }
  }

  csvStream.end();
  jsonlStream.end();
  flushState();

  const xlsxPath = path.join(outAbs, "satariz-vasita-arac-taxonomy.xlsx");
  const makeXlsx = argFlag("xlsx");
  if (makeXlsx) {
    try {
      const xlsx = await import("xlsx");
      const csvData = fs.readFileSync(csvPath, "utf8");
      const lines = csvData.split(/\r?\n/).filter(Boolean);
      const header = lines[0].split(",");
      const dataRows = lines.slice(1).map((line) => {
        const cols = [];
        let cur = "";
        let inQ = false;
        for (let i = 0; i < line.length; i++) {
          const ch = line[i];
          if (ch === '"' && line[i + 1] === '"') {
            cur += '"';
            i++;
            continue;
          }
          if (ch === '"') {
            inQ = !inQ;
            continue;
          }
          if (ch === "," && !inQ) {
            cols.push(cur);
            cur = "";
            continue;
          }
          cur += ch;
        }
        cols.push(cur);
        const obj = {};
        for (let i = 0; i < header.length; i++) obj[header[i]] = cols[i] || "";
        return obj;
      });
      const sheet = xlsx.utils.json_to_sheet(dataRows, { header: header });
      const wb = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(wb, sheet, "Vasıta-Araç");
      xlsx.writeFile(wb, xlsxPath);
    } catch {}
  }

  process.stdout.write(`OK rows=${rowsWritten}\n${csvPath}\n${jsonlPath}\n${statePath}\n`);
  if (makeXlsx && fs.existsSync(xlsxPath)) process.stdout.write(`${xlsxPath}\n`);
}

main().catch((e) => {
  process.stderr.write(String(e?.stack || e?.message || e) + "\n");
  process.exit(1);
});
