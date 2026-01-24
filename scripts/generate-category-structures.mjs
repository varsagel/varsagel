import fs from "node:fs";
import path from "node:path";
import xlsx from "xlsx";

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, "src", "data", "xlsx-structures");
const INPUT_DIR = path.join(ROOT, "kategoriler");

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
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
  return s || "kategori";
}

function readRows(fileName, opts = {}) {
  const fp = path.join(INPUT_DIR, fileName);
  const wb = xlsx.readFile(fp);
  const sn = opts.sheetName || wb.SheetNames[0];
  const ws = wb.Sheets[sn];
  const rows = xlsx.utils.sheet_to_json(ws, { header: 1, raw: false });
  return rows;
}

function uniq(arr) {
  return Array.from(new Set(arr));
}

function writeJson(name, obj) {
  ensureDir(SRC_DIR);
  const fp = path.join(SRC_DIR, name);
  fs.writeFileSync(fp, JSON.stringify(obj, null, 2) + "\n", "utf-8");
  return fp;
}

function addFullSlugs(category) {
  const walk = (node, parentFullSlug) => {
    const currentFullSlug = parentFullSlug ? `${parentFullSlug}/${node.slug}` : node.slug;
    const out = { ...node, fullSlug: currentFullSlug };
    if (Array.isArray(node.subcategories) && node.subcategories.length > 0) {
      out.subcategories = node.subcategories.map((c) => walk(c, currentFullSlug));
    }
    return out;
  };
  return { ...category, fullSlug: category.slug, subcategories: (category.subcategories || []).map((c) => walk(c, "")) };
}

function buildOzelDers() {
  const rows = readRows("Özel Ders Arayanlar.xlsx");
  const dataRows = rows.slice(1);
  const subcats = [];
  for (const r of dataRows) {
    const main = String(r?.[0] || "").trim();
    const sub = String(r?.[1] || "").trim();
    if (!main || !sub) continue;
    subcats.push(sub);
  }

  const name = "Özel Ders Arayanlar";
  const slug = "ozel-ders-arayanlar";

  const preferred = new Map([
    ["Lise & Üniversite", "lise-universite-hazirlik"],
    ["İlkokul & Ortaokul", "ilkogretim-takviye"],
    ["Yabancı Dil", "yabanci-dil"],
    ["Bilgisayar", "ozel-ders-bilgisayar"],
    ["Müzik & Enstrüman", "muzik-enstruman"],
    ["Spor", "ozel-ders-spor"],
    ["Sanat", "sanat"],
    ["Direksiyon", "direksiyon"],
    ["Kişisel Gelişim", "kisisel-gelisim"],
    ["Çocuk Gelişimi", "ozel-ders-cocuk-gelisimi"],
    ["Dans", "ozel-ders-dans"],
    ["Fotoğrafçılık", "ozel-ders-fotografcilik"],
    ["Güzel Konuşma & Diksiyon", "ozel-ders-diksiyon"],
    ["Mesleki Dersler", "ozel-ders-mesleki-dersler"],
    ["Özel Eğitim", "ozel-ders-ozel-egitim"],
    ["Tiyatro & Oyunculuk", "ozel-ders-tiyatro-oyunculuk"],
  ]);

  const uniqueSubs = uniq(subcats);
  const normalized = uniqueSubs.map((n) => {
    const existing = preferred.get(n);
    return { name: n, slug: existing || slugify(n) };
  });

  normalized.sort((a, b) => a.name.localeCompare(b.name, "tr"));

  const ordered = Array.from(preferred.entries())
    .map(([n, s]) => ({ name: n, slug: s }))
    .filter((p) => normalized.some((x) => x.slug === p.slug));

  const rest = normalized.filter((x) => !preferred.has(x.name));
  const merged = [...ordered, ...rest.filter((x) => !ordered.some((o) => o.slug === x.slug))];

  return addFullSlugs({ name, slug, subcategories: merged });
}

function buildYardimci() {
  const rows = readRows("Yardımcı Arayanlar.xlsx", { sheetName: "Sayfa1" });
  const subcats = [];
  for (const r of rows.slice(1)) {
    const main = String(r?.[0] || "").trim();
    const sub = String(r?.[1] || "").trim();
    if (!main || !sub) continue;
    subcats.push(sub);
  }

  const name = "Yardımcı Arayanlar";
  const slug = "yardimci-arayanlar";
  const preferred = new Map([
    ["Bebek & Çocuk Bakıcısı", "bebek-cocuk-bakicisi"],
    ["Yaşlı & Hasta Bakıcısı", "yasli-hasta-bakicisi"],
    ["Temizlikçi & Ev İşlerine Yardımcı", "temizlikci-ev-islerine-yardimci"],
  ]);

  const uniqueSubs = uniq(subcats);
  const normalized = uniqueSubs.map((n) => ({ name: n, slug: preferred.get(n) || slugify(n) }));

  const ordered = Array.from(preferred.entries())
    .map(([n, s]) => ({ name: n, slug: s }))
    .filter((p) => normalized.some((x) => x.slug === p.slug));
  const rest = normalized.filter((x) => !preferred.has(x.name));

  return addFullSlugs({ name, slug, subcategories: [...ordered, ...rest.filter((x) => !ordered.some((o) => o.slug === x.slug))] });
}

function buildIsArayanlar() {
  const rows = readRows("İş Arayanlar.xlsx");
  const dataRows = rows.slice(1);
  const sectorToJobs = new Map();
  for (const r of dataRows) {
    const main = String(r?.[0] || "").trim();
    const sector = String(r?.[1] || "").trim();
    const job = String(r?.[2] || "").trim();
    if (!main || !sector) continue;
    if (!sectorToJobs.has(sector)) sectorToJobs.set(sector, new Set());
    if (job) sectorToJobs.get(sector).add(job);
  }

  const name = "İş Arayanlar";
  const slug = "is-ilanlari";

  const sectors = Array.from(sectorToJobs.entries()).map(([sector, jobsSet]) => {
    const jobs = Array.from(jobsSet).map((j) => ({ name: j, slug: slugify(j) }));
    jobs.sort((a, b) => a.name.localeCompare(b.name, "tr"));
    return {
      name: sector,
      slug: slugify(sector),
      subcategories: jobs,
    };
  });
  sectors.sort((a, b) => a.name.localeCompare(b.name, "tr"));

  return addFullSlugs({ name, slug, subcategories: sectors });
}

function buildHayvanlar() {
  const rows = readRows("Hayvanlar Alemi.xlsx");
  const lvl1Map = new Map();

  for (const r of rows) {
    const main = String(r?.[0] || "").trim();
    if (!main) continue;
    const l1 = String(r?.[1] || "").trim();
    const l2 = String(r?.[2] || "").trim();
    const l3 = String(r?.[3] || "").trim();
    if (!l1) continue;

    if (!lvl1Map.has(l1)) lvl1Map.set(l1, new Map());
    const lvl2Map = lvl1Map.get(l1);
    if (!l2) continue;
    if (!lvl2Map.has(l2)) lvl2Map.set(l2, new Set());
    const lvl3Set = lvl2Map.get(l2);
    if (l3) lvl3Set.add(l3);
  }

  const name = "Hayvanlar Alemi";
  const slug = "hayvanlar-alemi";

  const preferredLvl1 = new Map([
    ["Aksesuar & Ekipman", "aksesuarlar"],
    ["Yem & Mama", "yem-mama"],
    ["Evcil Hayvanlar", "evcil-hayvanlar"],
    ["Akvaryum Balıkları", "akvaryum-baliklari"],
    ["Kümes Hayvanları", "kumes-hayvanlari"],
    ["Büyükbaş Hayvanlar", "buyukbas-hayvanlar"],
    ["Küçükbaş Hayvanlar", "kucukbas-hayvanlar"],
    ["Deniz Canlıları", "deniz-canlilari"],
    ["Sürüngenler", "surungenler"],
    ["Böcekler", "bocekler"],
  ]);

  const lvl1Nodes = Array.from(lvl1Map.entries()).map(([l1, lvl2Map]) => {
    const lvl2Nodes = Array.from(lvl2Map.entries()).map(([l2, lvl3Set]) => {
      const lvl3 = Array.from(lvl3Set).filter(Boolean).map((l3) => ({ name: l3, slug: slugify(l3) }));
      lvl3.sort((a, b) => a.name.localeCompare(b.name, "tr"));
      return lvl3.length
        ? { name: l2, slug: slugify(l2), subcategories: lvl3 }
        : { name: l2, slug: slugify(l2) };
    });
    lvl2Nodes.sort((a, b) => a.name.localeCompare(b.name, "tr"));
    return {
      name: l1,
      slug: preferredLvl1.get(l1) || slugify(l1),
      subcategories: lvl2Nodes,
    };
  });

  lvl1Nodes.sort((a, b) => a.name.localeCompare(b.name, "tr"));

  const ordered = Array.from(preferredLvl1.entries())
    .map(([n, s]) => lvl1Nodes.find((x) => x.slug === s) || lvl1Nodes.find((x) => x.name === n))
    .filter(Boolean);

  const rest = lvl1Nodes.filter((x) => !ordered.some((o) => o.slug === x.slug));

  return addFullSlugs({ name, slug, subcategories: [...ordered, ...rest] });
}

function main() {
  const results = [
    ["ozel-ders-arayanlar.json", buildOzelDers()],
    ["yardimci-arayanlar.json", buildYardimci()],
    ["is-arayanlar.json", buildIsArayanlar()],
    ["hayvanlar-alemi.json", buildHayvanlar()],
  ];
  for (const [fn, obj] of results) {
    const fp = writeJson(fn, obj);
    console.log("wrote", path.relative(ROOT, fp));
  }
}

main();
