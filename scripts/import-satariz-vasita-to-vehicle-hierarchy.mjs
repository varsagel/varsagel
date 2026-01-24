import fs from "node:fs";
import path from "node:path";

function argValue(name, fallback = null) {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx === -1) return fallback;
  const v = process.argv[idx + 1];
  if (!v || v.startsWith("--")) return fallback;
  return v;
}

function csvParseLine(line) {
  const out = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      continue;
    }
    if (ch === ",") {
      out.push(cur);
      cur = "";
      continue;
    }
    cur += ch;
  }
  out.push(cur);
  return out;
}

function normalize(s) {
  return String(s ?? "").replace(/\s+/g, " ").trim();
}

function ensure(obj, key, fallback) {
  if (!obj[key]) obj[key] = fallback;
  return obj[key];
}

function sortTrKeys(obj) {
  return Object.fromEntries(
    Object.entries(obj).sort(([a], [b]) => a.localeCompare(b, "tr"))
  );
}

function deepSort(node) {
  if (!node || typeof node !== "object" || Array.isArray(node)) return node;
  const sorted = sortTrKeys(node);
  for (const [k, v] of Object.entries(sorted)) {
    if (Array.isArray(v)) {
      sorted[k] = Array.from(new Set(v.map(normalize).filter(Boolean))).sort((a, b) => a.localeCompare(b, "tr"));
    } else {
      sorted[k] = deepSort(v);
    }
  }
  return sorted;
}

function readCsvRows(csvPath) {
  const raw = fs.readFileSync(csvPath, "utf8");
  const lines = raw.split(/\r?\n/).filter((l) => l.trim() !== "");
  if (lines.length <= 1) return [];
  const out = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = csvParseLine(lines[i]);
    if (cols.length < 5) continue;
    out.push({
      subcategory: normalize(cols[0]),
      brand: normalize(cols[1]),
      model: normalize(cols[2]),
      series: normalize(cols[3]),
      trim: normalize(cols[4]),
    });
  }
  return out;
}

const SOURCE_TO_HIERARCHY_KEY = [
  { sourceKey: "arac", hierarchyKey: "otomobil" },
  { sourceKey: "motosiklet", hierarchyKey: "motosiklet" },
  { sourceKey: "ticari-araclar", hierarchyKey: "ticari" },
  { sourceKey: "kiralik-araclar", hierarchyKey: "kiralik" },
  { sourceKey: "klasik-araclar", hierarchyKey: "otomobil" },
  { sourceKey: "hasarli-araclar", hierarchyKey: "otomobil" },
  { sourceKey: "karavan", hierarchyKey: "karavan" },
  { sourceKey: "deniz-araclari", hierarchyKey: "deniz" },
  { sourceKey: "hava-araclari", hierarchyKey: "hava" },
];

function applyRowsToHierarchy(hierarchy, hierarchyKey, rows) {
  const root = ensure(hierarchy, hierarchyKey, {});

  for (const r of rows) {
    let brand = r.brand;
    let model = r.model;
    if (!model) continue;
    if (!brand) brand = "Genel";

    let series = r.series || "";
    let trim = r.trim || "";

    const isGroupish = (s) => {
      const v = String(s || "").trim().toLowerCase();
      if (!v) return false;
      if (v.includes("/")) return true;
      const set = new Set(["satılık", "satilik", "kiralık", "kiralik"]);
      return set.has(v);
    };

    const isTicariSegment = (s) => {
      const v = String(s || "").toLowerCase();
      if (!v) return false;
      const segments = [
        "minibüs",
        "midibüs",
        "otobüs",
        "kamyon",
        "kamyonet",
        "çekici",
        "dorse",
        "römork",
        "romork",
        "karoser",
        "üst yapı",
        "ust yapi",
        "kurtarıcı",
        "tasiyici",
        "taşıyıcı",
        "ticari hat",
        "ticari plaka",
      ];
      return segments.some((p) => v.includes(p));
    };

    const brandMatchesSubcategory =
      normalize(r.subcategory).toLowerCase() &&
      normalize(brand).toLowerCase() === normalize(r.subcategory).toLowerCase();

    if (
      (hierarchyKey === "kiralik" && isGroupish(brand)) ||
      (hierarchyKey === "ticari" && isTicariSegment(brand)) ||
      brandMatchesSubcategory
    ) {
      brand = model;
      model = series || model;
      series = trim;
      trim = "";
    }

    if (!series) series = "Genel";

    const brandNode = ensure(root, brand, {});
    const modelNode = ensure(brandNode, model, {});
    const seriesArr = ensure(modelNode, series, []);

    if (trim) seriesArr.push(trim);
  }
}

async function main() {
  const srcDir = path.resolve(process.cwd(), argValue("srcDir", "data/satariz_taxonomy_v2"));
  const hierarchyPath = path.resolve(process.cwd(), argValue("hierarchyPath", "src/data/vehicle-hierarchy.json"));

  if (!fs.existsSync(srcDir)) throw new Error(`srcDir not found: ${srcDir}`);
  if (!fs.existsSync(hierarchyPath)) throw new Error(`hierarchyPath not found: ${hierarchyPath}`);

  const hierarchy = JSON.parse(fs.readFileSync(hierarchyPath, "utf8"));

  const stats = [];
  for (const map of SOURCE_TO_HIERARCHY_KEY) {
    const csv = path.join(srcDir, `satariz-vasita-${map.sourceKey}.csv`);
    if (!fs.existsSync(csv)) {
      stats.push({ sourceKey: map.sourceKey, hierarchyKey: map.hierarchyKey, rows: 0, missing: true });
      continue;
    }
    const rows = readCsvRows(csv);
    applyRowsToHierarchy(hierarchy, map.hierarchyKey, rows);
    stats.push({ sourceKey: map.sourceKey, hierarchyKey: map.hierarchyKey, rows: rows.length, missing: false });
  }

  const sorted = deepSort(hierarchy);
  const tmp = `${hierarchyPath}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(sorted, null, 2), "utf8");
  fs.renameSync(tmp, hierarchyPath);

  process.stdout.write(`OK ${hierarchyPath}\n`);
  for (const s of stats) {
    process.stdout.write(`${s.sourceKey} -> ${s.hierarchyKey} rows=${s.rows}${s.missing ? " (missing)" : ""}\n`);
  }
}

main().catch((e) => {
  process.stderr.write(String(e?.stack || e?.message || e) + "\n");
  process.exit(1);
});
