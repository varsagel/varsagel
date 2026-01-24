import fs from "node:fs";
import path from "node:path";
import xlsx from "xlsx";

const ROOT = process.cwd();
const INPUT_DIR = path.join(ROOT, "kategoriler");
const OUT_FILE = path.join(ROOT, "src", "data", "xlsx-attr-schemas.json");
const STRUCT_DIR = path.join(ROOT, "src", "data", "xlsx-structures");

const CATEGORY_FILES = [
  { file: "EMLAK kategori çalışması en son.xlsx", categorySlug: "emlak" },
  { file: "VASITA KATEGORİ ÇALIŞMASI.xlsx", categorySlug: "vasita" },
  { file: "Yedek Parça, Aksesuar, Donanım & Tuning.xlsx", categorySlug: "yedek-parca-aksesuar-donanim-tuning" },
  { file: "İkinci El ve Sıfır Alışveriş.xlsx", categorySlug: "alisveris" },
  { file: "İş Makineleri & Sanayi.xlsx", categorySlug: "is-makineleri-sanayi" },
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
  return normalized.findIndex((c) => c === norm("Aradığınız Ürünün Özellikleri"));
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
  return node?.fullSlug || null;
}

function ensureSchemaStore(store, key) {
  if (!store[key]) store[key] = new Map();
  return store[key];
}

function addField(fieldsMap, label, option) {
  const cleanLabel = String(label || "").trim();
  if (!cleanLabel) return;
  const id = norm(cleanLabel);
  if (!fieldsMap.has(id)) {
    fieldsMap.set(id, {
      label: cleanLabel,
      key: slugify(cleanLabel),
      options: new Set(),
      range: false,
    });
  }
  const field = fieldsMap.get(id);
  const cleanOpt = String(option || "").trim();
  if (cleanOpt) field.options.add(cleanOpt);
}

function addRangeField(fieldsMap, baseLabel) {
  const cleanBase = String(baseLabel || "").trim();
  if (!cleanBase) return;
  const id = norm(cleanBase);
  if (!fieldsMap.has(id)) {
    fieldsMap.set(id, {
      label: cleanBase,
      key: baseKeyFromLabel(cleanBase),
      options: new Set(),
      range: true,
    });
    return;
  }
  const field = fieldsMap.get(id);
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
      rangeGroups.set(gKey, { baseLabel: split.baseLabel, min: null, max: null });
    }
    const g = rangeGroups.get(gKey);
    if (split.side === "min") g.min = f;
    else if (split.side === "max") g.max = f;
    else normal.push(f);
  }

  const arr = [];

  for (const f of raw) {
    if (!f.range) continue;
    const baseKey = baseKeyFromLabel(f.label);
    arr.push({
      label: f.label,
      key: baseKey,
      type: "range-number",
      minKey: `${baseKey}Min`,
      maxKey: `${baseKey}Max`,
      minLabel: "Min",
      maxLabel: "Max",
    });
  }

  for (const g of rangeGroups.values()) {
    if (g.min && g.max) {
      const baseKey = baseKeyFromLabel(g.baseLabel);
      arr.push({
        label: g.baseLabel,
        key: baseKey,
        type: "range-number",
        minKey: `${baseKey}Min`,
        maxKey: `${baseKey}Max`,
        minLabel: "Min",
        maxLabel: "Max",
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
      arr.push({ label: f.label, key: f.key, type: "select", options });
    } else {
      arr.push({ label: f.label, key: f.key, type: "text" });
    }
  }

  arr.sort((a, b) => String(a.label).localeCompare(String(b.label), "tr"));
  return arr;
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
      if (struct) {
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
        const fieldsMap = ensureSchemaStore(store, key);
        const maybeMin = String(attrCells?.[attrCells.length - 2] || "").trim();
        const maybeMax = String(attrCells?.[attrCells.length - 1] || "").trim();
        const sMin = splitMinMaxSuffix(maybeMin);
        const sMax = splitMinMaxSuffix(maybeMax);
        if (attrCells.length === 2 && sMin && sMax && sMin.side === "min" && sMax.side === "max" && norm(sMin.baseLabel) === norm(sMax.baseLabel)) {
          addRangeField(fieldsMap, sMin.baseLabel);
        } else {
          addField(fieldsMap, label, option);
        }
      }
    }
  }

  const out = {};
  for (const [key, fieldsMap] of Object.entries(store)) {
    out[key] = toAttrFieldArray(fieldsMap);
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
