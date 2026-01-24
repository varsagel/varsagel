import fs from "node:fs";
import path from "node:path";
import xlsx from "xlsx";

const SITEMAP_URL = process.env.SATARIZ_SITEMAP_URL || "https://www.satariz.com/sitemap.xml";

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function extractLocs(xml) {
  const locs = [];
  const re = /<loc>([^<]+)<\/loc>/g;
  let m;
  while ((m = re.exec(xml))) locs.push(m[1]);
  return Array.from(new Set(locs));
}

function isSingleSegmentCategoryPath(pathname) {
  if (!pathname || pathname === "/") return false;
  const trimmed = pathname.startsWith("/") ? pathname.slice(1) : pathname;
  if (!trimmed) return false;
  if (trimmed.startsWith("ilan/")) return false;
  if (trimmed.includes("/")) return false;
  return true;
}

function extractTitleFromHtml(html) {
  const m = /<title>([\s\S]*?)<\/title>/i.exec(String(html || ""));
  if (!m) return "";
  return String(m[1] || "").replace(/\s+/g, " ").trim();
}

function inferNameFromTitle(title) {
  const t = String(title || "").trim();
  if (!t) return "";
  const left = t.split("|")[0]?.trim() || "";
  return left.replace(/\s+İlanları\s*$/i, "").trim();
}

function computeParentSlug(slug, all) {
  let current = slug;
  while (true) {
    const idx = current.lastIndexOf("-");
    if (idx <= 0) return null;
    current = current.slice(0, idx);
    if (all.has(current)) return current;
  }
}

function getUniqueSheetName(desired, used) {
  const sanitized = String(desired || "")
    .replace(/[\[\]\*\/\\\?\:]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const base = (sanitized || "Sheet").slice(0, 31);
  if (!used.has(base)) {
    used.add(base);
    return base;
  }
  for (let i = 1; i < 999; i++) {
    const suffix = `~${i}`;
    const take = Math.max(1, 31 - suffix.length);
    const name = `${base.slice(0, take)}${suffix}`;
    if (!used.has(name)) {
      used.add(name);
      return name;
    }
  }
  const fallback = `Sheet~${used.size}`.slice(0, 31);
  used.add(fallback);
  return fallback;
}

async function main() {
  const outFile =
    process.env.OUT_XLSX ||
    path.join(process.cwd(), "public", "exports", "satariz-alt-kategori-formlari.xlsx");

  const res = await fetch(SITEMAP_URL, { headers: { accept: "application/xml,text/xml,*/*" } });
  if (!res.ok) throw new Error(`Sitemap indirilemedi: HTTP ${res.status}`);
  const xml = await res.text();
  const locs = extractLocs(xml);

  const categoryUrls = locs
    .map((u) => {
      try {
        return new URL(u);
      } catch {
        return null;
      }
    })
    .filter(Boolean)
    .filter((u) => isSingleSegmentCategoryPath(u.pathname))
    .map((u) => ({ slug: u.pathname.replace(/^\//, ""), url: u.toString() }));

  const allSlugs = new Set(categoryUrls.map((x) => x.slug));
  const parentBySlug = new Map();
  for (const { slug } of categoryUrls) parentBySlug.set(slug, computeParentSlug(slug, allSlugs));

  const nameBySlug = new Map();
  const concurrency = Number(process.env.CONCURRENCY || 6);
  let idx = 0;
  async function worker() {
    while (idx < categoryUrls.length) {
      const item = categoryUrls[idx];
      idx += 1;
      try {
        const r = await fetch(item.url, { headers: { accept: "text/html,*/*" } });
        const html = await r.text();
        const title = extractTitleFromHtml(html);
        const inferred = inferNameFromTitle(title);
        if (inferred) nameBySlug.set(item.slug, inferred);
      } catch {}
    }
  }
  await Promise.all(Array.from({ length: Math.max(1, concurrency) }, () => worker()));

  for (const { slug } of categoryUrls) if (!nameBySlug.get(slug)) nameBySlug.set(slug, slug);

  const nodes = categoryUrls.map(({ slug, url }) => ({
    slug,
    name: nameBySlug.get(slug) || slug,
    parentSlug: parentBySlug.get(slug) || "",
    url,
  }));

  const hasChild = new Set(nodes.map((n) => n.parentSlug).filter(Boolean));
  const leaves = nodes.filter((n) => !hasChild.has(n.slug));

  const wb = xlsx.utils.book_new();
  const usedNames = new Set();
  const indexRows = [];

  for (const leaf of leaves) {
    const sheetName = getUniqueSheetName(leaf.name, usedNames);
    indexRows.push({
      "Leaf Name": leaf.name,
      "Leaf Slug": leaf.slug,
      "Sheet Name": sheetName,
      URL: leaf.url,
    });

    const rows = [
      {
        Form: "TALEP",
        "Attribute Name": "Örnek Özellik (Silin)",
        "Slug (System ID)": "ornek_ozellik",
        "DB Type": "text",
        "UI Type": "text",
        "Options (Comma Separated)": "",
        "Required (TRUE/FALSE)": false,
        Order: 1,
        Scope: "GLOBAL",
        "Show In Offer (TRUE/FALSE)": true,
        "Show In Request (TRUE/FALSE)": true,
        "Range Min Key": "",
        "Range Max Key": "",
        "Range Min Label": "",
        "Range Max Label": "",
        ID: "",
      },
      {
        Form: "TEKLIF",
        "Attribute Name": "Örnek Özellik (Silin)",
        "Slug (System ID)": "ornek_ozellik",
        "DB Type": "text",
        "UI Type": "text",
        "Options (Comma Separated)": "",
        "Required (TRUE/FALSE)": false,
        Order: 1,
        Scope: "GLOBAL",
        "Show In Offer (TRUE/FALSE)": true,
        "Show In Request (TRUE/FALSE)": true,
        "Range Min Key": "",
        "Range Max Key": "",
        "Range Min Label": "",
        "Range Max Label": "",
        ID: "",
      },
    ];

    const ws = xlsx.utils.json_to_sheet(rows);
    ws["!cols"] = [
      { wch: 10 },
      { wch: 25 },
      { wch: 20 },
      { wch: 14 },
      { wch: 14 },
      { wch: 40 },
      { wch: 10 },
      { wch: 8 },
      { wch: 12 },
      { wch: 15 },
      { wch: 15 },
      { wch: 18 },
      { wch: 18 },
      { wch: 12 },
      { wch: 12 },
      { wch: 25 },
    ];
    xlsx.utils.book_append_sheet(wb, ws, sheetName);
  }

  indexRows.sort((a, b) => String(a["Leaf Name"]).localeCompare(String(b["Leaf Name"]), "tr"));
  const wsIndex = xlsx.utils.json_to_sheet(indexRows);
  wsIndex["!cols"] = [{ wch: 36 }, { wch: 34 }, { wch: 24 }, { wch: 60 }];

  const finalWb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(finalWb, wsIndex, "INDEX");
  wb.SheetNames.forEach((name) => {
    xlsx.utils.book_append_sheet(finalWb, wb.Sheets[name], name);
  });

  ensureDir(path.dirname(outFile));
  xlsx.writeFile(finalWb, outFile);

  process.stdout.write(`OK: ${outFile}\n`);
  process.stdout.write(`Yaprak form sayfası: ${leaves.length}\n`);
}

main().catch((e) => {
  process.stderr.write(String(e?.message || e) + "\n");
  process.exit(1);
});

