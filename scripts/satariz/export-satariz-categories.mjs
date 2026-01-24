import fs from "node:fs";
import path from "node:path";
import xlsx from "xlsx";

const SITEMAP_URL = process.env.SATARIZ_SITEMAP_URL || "https://www.satariz.com/sitemap.xml";

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function uniq(arr) {
  return Array.from(new Set(arr));
}

function extractLocs(xml) {
  const locs = [];
  const re = /<loc>([^<]+)<\/loc>/g;
  let m;
  while ((m = re.exec(xml))) {
    locs.push(m[1]);
  }
  return locs;
}

function isSingleSegmentCategoryPath(pathname) {
  if (!pathname || pathname === "/") return false;
  const trimmed = pathname.startsWith("/") ? pathname.slice(1) : pathname;
  if (!trimmed) return false;
  if (trimmed.startsWith("ilan/")) return false;
  if (trimmed.startsWith("api/")) return false;
  if (trimmed.includes("/")) return false;
  return true;
}

function inferNameFromTitle(title) {
  const t = String(title || "").trim();
  if (!t) return "";
  const left = t.split("|")[0]?.trim() || "";
  return left
    .replace(/\s+İlanları\s*$/i, "")
    .replace(/\s+İlanları\s*$/i, "")
    .replace(/\s+İlanlar\s*$/i, "")
    .trim();
}

function extractTitleFromHtml(html) {
  const m = /<title>([\s\S]*?)<\/title>/i.exec(String(html || ""));
  if (!m) return "";
  return String(m[1] || "").replace(/\s+/g, " ").trim();
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

function computeLevel(slug, parentBySlug) {
  let level = 0;
  let cur = slug;
  while (true) {
    const p = parentBySlug.get(cur);
    if (!p) return level;
    level += 1;
    cur = p;
    if (level > 20) return level;
  }
}

function buildFullPath(slug, parentBySlug, nameBySlug) {
  const parts = [];
  let cur = slug;
  while (cur) {
    parts.push(nameBySlug.get(cur) || cur);
    cur = parentBySlug.get(cur) || null;
    if (parts.length > 30) break;
  }
  return parts.reverse().join(" > ");
}

async function main() {
  const outFile =
    process.env.OUT_XLSX ||
    path.join(process.cwd(), "public", "exports", "satariz-kategori-agaci.xlsx");

  const res = await fetch(SITEMAP_URL, { headers: { accept: "application/xml,text/xml,*/*" } });
  if (!res.ok) {
    throw new Error(`Sitemap indirilemedi: HTTP ${res.status}`);
  }
  const xml = await res.text();
  const locs = extractLocs(xml);
  const urls = uniq(locs)
    .map((u) => {
      try {
        return new URL(u);
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  const categoryUrls = urls
    .filter((u) => isSingleSegmentCategoryPath(u.pathname))
    .map((u) => ({
      slug: u.pathname.replace(/^\//, ""),
      url: u.toString(),
    }))
    .filter((x) => x.slug);

  const allSlugs = new Set(categoryUrls.map((x) => x.slug));
  const parentBySlug = new Map();
  for (const { slug } of categoryUrls) {
    parentBySlug.set(slug, computeParentSlug(slug, allSlugs));
  }

  const nameBySlug = new Map();
  const titleBySlug = new Map();

  const concurrency = Number(process.env.CONCURRENCY || 6);
  let index = 0;

  async function worker() {
    while (index < categoryUrls.length) {
      const my = categoryUrls[index];
      index += 1;
      try {
        const r = await fetch(my.url, { headers: { accept: "text/html,*/*" } });
        const html = await r.text();
        const title = extractTitleFromHtml(html);
        titleBySlug.set(my.slug, title);
        const inferred = inferNameFromTitle(title);
        if (inferred) nameBySlug.set(my.slug, inferred);
      } catch {
        // ignore
      }
    }
  }

  await Promise.all(Array.from({ length: Math.max(1, concurrency) }, () => worker()));

  for (const { slug } of categoryUrls) {
    if (!nameBySlug.get(slug)) nameBySlug.set(slug, slug);
  }

  const nodes = categoryUrls
    .map(({ slug, url }) => {
      const parentSlug = parentBySlug.get(slug) || "";
      const level = computeLevel(slug, parentBySlug);
      return {
        slug,
        name: nameBySlug.get(slug) || slug,
        parentSlug,
        level,
        url,
        title: titleBySlug.get(slug) || "",
      };
    })
    .sort((a, b) => {
      if (a.level !== b.level) return a.level - b.level;
      return a.slug.localeCompare(b.slug, "tr");
    });

  const leaves = nodes.filter((n) => !nodes.some((x) => x.parentSlug === n.slug));
  const paths = leaves
    .map((n) => ({
      leafSlug: n.slug,
      leafName: n.name,
      fullPath: buildFullPath(n.slug, parentBySlug, nameBySlug),
      url: n.url,
    }))
    .sort((a, b) => a.fullPath.localeCompare(b.fullPath, "tr"));

  const wb = xlsx.utils.book_new();
  const wsNodes = xlsx.utils.json_to_sheet(nodes);
  const wsPaths = xlsx.utils.json_to_sheet(paths);
  xlsx.utils.book_append_sheet(wb, wsNodes, "Kategoriler");
  xlsx.utils.book_append_sheet(wb, wsPaths, "Yollar");

  ensureDir(path.dirname(outFile));
  xlsx.writeFile(wb, outFile);

  process.stdout.write(`OK: ${outFile}\n`);
  process.stdout.write(`Kategoriler: ${nodes.length}, Yaprak: ${paths.length}\n`);
}

main().catch((e) => {
  process.stderr.write(String(e?.message || e) + "\n");
  process.exit(1);
});

