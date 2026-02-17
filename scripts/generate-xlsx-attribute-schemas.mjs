import fs from "node:fs";
import path from "node:path";
import xlsx from "xlsx";

const ROOT = process.cwd();
const INPUT_DIR = path.join(ROOT, "kategoriler");
const OUT_FILE = path.join(ROOT, "src", "data", "xlsx-attr-schemas.json");
const STRUCT_DIR = path.join(ROOT, "src", "data", "xlsx-structures");

const CATEGORY_FILES = [
  { file: "EMLAK kategori çalışması en son.xlsx", categorySlug: "emlak", structureJson: "../../../scripts/emlak-structure.json" },
  { file: "VASITA KATEGORİ ÇALIŞMASI.xlsx", categorySlug: "vasita" },
  { file: "Yedek Parça, Aksesuar, Donanım & Tuning.xlsx", categorySlug: "yedek-parca-aksesuar-donanim-tuning", structureJson: "../yedek-parca-structure.json" },
  { file: "İkinci El ve Sıfır Alışveriş.xlsx", categorySlug: "alisveris", structureJson: "../alisveris-structure.json" },
  { file: "İş Makineleri & Sanayi.xlsx", categorySlug: "is-makineleri-sanayi", structureJson: "../sanayi-structure.json" },
  { file: "İş Arayanlar.xlsx", categorySlug: "is-ilanlari", structureJson: "is-arayanlar.json" },
  { file: "Özel Ders Arayanlar.xlsx", categorySlug: "ozel-ders-arayanlar", structureJson: "ozel-ders-arayanlar.json" },
  { file: "Yardımcı Arayanlar.xlsx", categorySlug: "yardimci-arayanlar", structureJson: "yardimci-arayanlar.json" },
  { file: "Hayvanlar Alemi.xlsx", categorySlug: "hayvanlar-alemi", structureJson: "hayvanlar-alemi.json" },
];

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function norm(input) {
  return String(input || "")
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/\p{M}+/gu, "")
    .replace(/İ/g, "i")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/\s+/g, " ");
}

function slugify(input) {
  const base = String(input || "")
    .trim()
    .replace(/&/g, " ve ")
    .replace(/\//g, " ")
    .replace(/İ/g, "I")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/\p{M}+/gu, "")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c");

  const s = base
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return s || "ozellik";
}

function readRows(fileName) {
  const fp = path.join(INPUT_DIR, fileName);
  const wb = xlsx.readFile(fp);
  const sn = wb.SheetNames[0];
  const ws = wb.Sheets[sn];
  return xlsx.utils.sheet_to_json(ws, { header: 1, raw: false });
}

function findAttrStart(headerRow) {
  const normalized = headerRow.map((c) => norm(c));
  const needle = norm("Aradığınız Ürünün Özellikleri");
  return normalized.findIndex((c) => c && c.includes(needle));
}

function loadStructure(structureJson) {
  if (!structureJson) return null;
  const fp = path.join(STRUCT_DIR, structureJson);
  if (!fs.existsSync(fp)) return null;
  return JSON.parse(fs.readFileSync(fp, "utf-8"));
}

function findChildByName(children, name) {
  const target = norm(name);
  if (!target) return null;
  return (
    (children || []).find((c) => norm(c.name) === target) ||
    (children || []).find((c) => norm(c.name).includes(target)) ||
    (children || []).find((c) => target.includes(norm(c.name))) ||
    null
  );
}

function resolveFullSlugFromStructure(struct, pathParts) {
  if (!struct || !Array.isArray(pathParts) || pathParts.length === 0) return null;
  let node = null;
  let current = struct.subcategories || [];
  for (const part of pathParts) {
    node = findChildByName(current, part);
    if (!node) return null;
    current = node.subcategories || [];
  }
  return node?.fullSlug || node?.slug || null;
}

function resolveSubKeyForVasita(pathParts) {
  if (!Array.isArray(pathParts) || pathParts.length === 0) return null;

  const ticariChildren = [
    { name: "Minibüs & Midibüs", slug: "ticari-araclar-minibus-midibus" },
    { name: "Otobüs", slug: "ticari-araclar-otobus" },
    { name: "Kamyon & Kamyonet", slug: "ticari-araclar-kamyon-kamyonet" },
    { name: "Çekici", slug: "ticari-araclar-cekici" },
    { name: "Dorse", slug: "ticari-araclar-dorse" },
    { name: "Römork", slug: "ticari-araclar-romork" },
    { name: "Karoser & Üst Yapı", slug: "ticari-araclar-karoser-ust-yapi" },
    { name: "Oto Kurtarıcı & Taşıyıcı", slug: "ticari-araclar-oto-kurtarici-tasiyici" },
    { name: "Ticari Hat & Ticari Plaka", slug: "ticari-araclar-ticari-hat-ticari-plaka" },
  ];

  const topLevel = [
    { name: "Otomobil", slug: "otomobil" },
    { name: "Arazi, SUV & Pickup", slug: "arazi-suv-pickup" },
    { name: "Motosiklet", slug: "motosiklet" },
    { name: "Minivan & Panelvan", slug: "minivan-panelvan" },
    { name: "Ticari Araçlar", slug: "ticari-araclar" },
    { name: "Kiralık Araçlar", slug: "kiralik-araclar" },
    { name: "Deniz Araçları", slug: "deniz-araclari" },
    { name: "Hasarlı Araçlar", slug: "hasarli-araclar" },
    { name: "Karavan", slug: "karavan" },
    { name: "Klasik Araçlar", slug: "klasik-araclar" },
    { name: "Hava Araçları", slug: "hava-araclari" },
    { name: "ATV", slug: "atv" },
    { name: "UTV", slug: "utv" },
    { name: "Engelli Plakalı Araçlar", slug: "engelli-plakali-araclar" },
  ];

  const isMatch = (part, entry) => {
    const p = norm(part);
    if (!p) return false;
    if (p === norm(entry.name)) return true;
    if (p === norm(entry.slug)) return true;
    if (p.includes(norm(entry.name)) || norm(entry.name).includes(p)) return true;
    return false;
  };

  for (const part of pathParts) {
    for (const entry of ticariChildren) {
      if (isMatch(part, entry)) return entry.slug;
    }
  }

  for (const part of pathParts) {
    for (const entry of topLevel) {
      if (isMatch(part, entry)) return entry.slug;
    }
  }

  return null;
}

function ensureSchemaStore(store, key) {
  if (!store[key]) store[key] = { fields: new Map(), order: 0 };
  return store[key];
}

function addField(entry, label, option) {
  const cleanLabel = String(label || "").trim();
  if (!cleanLabel) return;
  const id = norm(cleanLabel);
  if (!entry.fields.has(id)) {
    entry.fields.set(id, {
      label: cleanLabel,
      key: slugify(cleanLabel),
      options: new Set(),
      range: false,
      order: entry.order++,
    });
  }
  const field = entry.fields.get(id);
  const cleanOpt = String(option || "").trim();
  if (cleanOpt) field.options.add(cleanOpt);
}

function addRangeField(entry, baseLabel) {
  const cleanBase = String(baseLabel || "").trim();
  if (!cleanBase) return;
  const id = norm(cleanBase);
  if (!entry.fields.has(id)) {
    entry.fields.set(id, {
      label: cleanBase,
      key: baseKeyFromLabel(cleanBase),
      options: new Set(),
      range: true,
      order: entry.order++,
    });
    return;
  }
  const field = entry.fields.get(id);
  field.label = cleanBase;
  field.key = baseKeyFromLabel(cleanBase);
  field.range = true;
}

function baseKeyFromLabel(baseLabel) {
  const n = norm(baseLabel);
  if (!n) return slugify(baseLabel);
  if (n === "km" || n.includes("kilometre")) return "km";
  if (n === "yil" || n === "model yili") return "yil";
  return slugify(baseLabel);
}

function splitMinMaxSuffix(label) {
  const raw = String(label || "").trim();
  if (!raw) return null;
  const parts = raw.split(/\s+/g).filter(Boolean);
  if (parts.length < 2) return null;
  const last = parts[parts.length - 1];
  const lastNorm = norm(last);
  if (lastNorm !== "min" && lastNorm !== "max") return null;
  const baseLabel = parts.slice(0, -1).join(" ").trim();
  if (!baseLabel) return null;
  return { baseLabel, side: lastNorm };
}

function toAttrFieldArray(fieldsMap) {
  const raw = Array.from(fieldsMap.values());

  const rangeGroups = new Map();
  const normal = [];

  for (const f of raw) {
    if (f.range) continue;
    const split = splitMinMaxSuffix(f.label);
    if (!split) {
      normal.push(f);
      continue;
    }
    const gKey = norm(split.baseLabel);
    if (!rangeGroups.has(gKey)) {
      rangeGroups.set(gKey, { baseLabel: split.baseLabel, min: null, max: null, order: f.order ?? 0 });
    }
    const g = rangeGroups.get(gKey);
    if (typeof f.order === "number" && f.order < g.order) g.order = f.order;
    if (split.side === "min") g.min = f;
    else if (split.side === "max") g.max = f;
    else normal.push(f);
  }

  const arr = [];

  for (const f of raw) {
    if (!f.range) continue;
    const baseKey = baseKeyFromLabel(f.label);
    arr.push({
      order: f.order ?? 0,
      field: {
        label: f.label,
        key: baseKey,
        type: "range-number",
        minKey: `${baseKey}Min`,
        maxKey: `${baseKey}Max`,
        minLabel: "Min",
        maxLabel: "Max",
      },
    });
  }

  for (const g of rangeGroups.values()) {
    if (g.min && g.max) {
      const baseKey = baseKeyFromLabel(g.baseLabel);
      arr.push({
        order: g.order ?? 0,
        field: {
          label: g.baseLabel,
          key: baseKey,
          type: "range-number",
          minKey: `${baseKey}Min`,
          maxKey: `${baseKey}Max`,
          minLabel: "Min",
          maxLabel: "Max",
        },
      });
    } else {
      if (g.min) normal.push(g.min);
      if (g.max) normal.push(g.max);
    }
  }

  for (const f of normal) {
    const options = Array.from(f.options);
    options.sort((a, b) => a.localeCompare(b, "tr"));
    if (options.length > 0) {
      arr.push({ order: f.order ?? 0, field: { label: f.label, key: f.key, type: "select", options } });
    } else {
      arr.push({ order: f.order ?? 0, field: { label: f.label, key: f.key, type: "text" } });
    }
  }

  arr.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  return arr.map((item) => item.field);
}

function buildSchemas() {
  const store = {};

  for (const cfg of CATEGORY_FILES) {
    const rows = readRows(cfg.file);
    const header = rows[0] || [];
    const attrStart = findAttrStart(header);
    if (attrStart < 0) continue;

    const struct = loadStructure(cfg.structureJson);

    for (const r of rows.slice(1)) {
      const main = String(r?.[0] || "").trim();
      if (!main) continue;

      const pathParts = [];
      for (let i = 1; i < attrStart; i++) {
        const p = String(r?.[i] || "").trim();
        if (p) pathParts.push(p);
      }

      const attrCells = [];
      for (let i = attrStart; i < r.length; i++) {
        const v = String(r?.[i] || "").trim();
        if (v) attrCells.push(v);
      }
      if (attrCells.length === 0) continue;

      const option = attrCells.length >= 2 ? attrCells[attrCells.length - 1] : "";
      const label = attrCells.length >= 2 ? attrCells[attrCells.length - 2] : attrCells[0];
      if (!label) continue;

      let subKey = null;
      if (cfg.categorySlug === "vasita") {
        subKey = resolveSubKeyForVasita(pathParts);
      } else if (struct) {
        subKey = resolveFullSlugFromStructure(struct, pathParts);
      } else if (pathParts.length > 0) {
        subKey = pathParts.map(slugify).join("/");
      }

      const keys = [];
      if (subKey) {
        keys.push(`${cfg.categorySlug}/${subKey}`);
        if (subKey.includes("/")) keys.push(`${cfg.categorySlug}/${subKey.replace(/\//g, "-")}`);
      } else {
        keys.push(cfg.categorySlug);
      }

      for (const key of keys) {
        const entry = ensureSchemaStore(store, key);
        const maybeMin = String(attrCells?.[attrCells.length - 2] || "").trim();
        const maybeMax = String(attrCells?.[attrCells.length - 1] || "").trim();
        const sMin = splitMinMaxSuffix(maybeMin);
        const sMax = splitMinMaxSuffix(maybeMax);
        if (attrCells.length >= 2 && sMin && sMax && sMin.side === "min" && sMax.side === "max") {
          const minBase = norm(sMin.baseLabel);
          const maxBase = norm(sMax.baseLabel);
          let baseLabel = null;
          if (minBase === maxBase) {
            baseLabel = sMin.baseLabel;
          } else if (minBase.includes(maxBase)) {
            baseLabel = sMin.baseLabel;
          } else if (maxBase.includes(minBase)) {
            baseLabel = sMax.baseLabel;
          }
          if (baseLabel) {
            addRangeField(entry, baseLabel);
          } else {
            addField(entry, label, option);
          }
        } else {
          addField(entry, label, option);
        }
      }
    }
  }

  const out = {};
  for (const [key, entry] of Object.entries(store)) {
    out[key] = toAttrFieldArray(entry.fields);
  }

  return out;
}

function main() {
  const schemas = buildSchemas();
  ensureDir(path.dirname(OUT_FILE));
  fs.writeFileSync(OUT_FILE, JSON.stringify(schemas, null, 2) + "\n", "utf-8");
  console.log("wrote", path.relative(ROOT, OUT_FILE));
  console.log("keys", Object.keys(schemas).length);
}

main();
