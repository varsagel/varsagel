import fs from "node:fs";
import path from "node:path";
import xlsx from "xlsx";

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function readSheetRows(ws) {
  return xlsx.utils.sheet_to_json(ws, { defval: "" });
}

function toSlug(s) {
  return String(s || "").trim();
}

async function main() {
  const inFile =
    process.env.IN_XLSX ||
    path.join(process.cwd(), "public", "exports", "satariz-kategori-agaci.xlsx");
  const outFile =
    process.env.OUT_JSON ||
    path.join(process.cwd(), "src", "data", "satariz-taxonomy.json");

  if (!fs.existsSync(inFile)) {
    throw new Error(`Girdi bulunamadı: ${inFile}`);
  }

  const wb = xlsx.readFile(inFile);
  const ws = wb.Sheets["Kategoriler"] || wb.Sheets[wb.SheetNames[0]];
  if (!ws) throw new Error("Sheet bulunamadı");

  const rows = readSheetRows(ws);
  const nodes = rows
    .map((r) => ({
      slug: toSlug(r.slug),
      name: String(r.name || "").trim() || toSlug(r.slug),
      parentSlug: toSlug(r.parentSlug),
      level: Number(r.level || 0) || 0,
      url: String(r.url || "").trim(),
    }))
    .filter((n) => n.slug);

  const bySlug = new Map(nodes.map((n) => [n.slug, { ...n, children: [] }]));
  for (const n of bySlug.values()) {
    const p = n.parentSlug ? bySlug.get(n.parentSlug) : null;
    if (p) p.children.push(n);
  }

  const roots = Array.from(bySlug.values())
    .filter((n) => !n.parentSlug)
    .sort((a, b) => a.slug.localeCompare(b.slug, "tr"));

  const sortDeep = (n) => {
    n.children.sort((a, b) => a.slug.localeCompare(b.slug, "tr"));
    n.children.forEach(sortDeep);
  };
  roots.forEach(sortDeep);

  ensureDir(path.dirname(outFile));
  fs.writeFileSync(outFile, JSON.stringify({ source: "satariz.com", roots }, null, 2), "utf8");
  process.stdout.write(`OK: ${outFile}\nRoots: ${roots.length}, Nodes: ${bySlug.size}\n`);
}

main().catch((e) => {
  process.stderr.write(String(e?.message || e) + "\n");
  process.exit(1);
});

