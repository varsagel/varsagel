import fs from "node:fs";
import path from "node:path";

function argValue(name, fallback = null) {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx === -1) return fallback;
  const v = process.argv[idx + 1];
  if (!v || v.startsWith("--")) return fallback;
  return v;
}

function toTitleTr(input) {
  const s = String(input ?? "").trim();
  if (!s) return "";
  const lower = s.toLocaleLowerCase("tr-TR");
  return lower
    .split(" ")
    .filter(Boolean)
    .map((w) => {
      if (/^\d+([.-]\d+)*$/.test(w)) return w;
      return w.charAt(0).toLocaleUpperCase("tr-TR") + w.slice(1);
    })
    .join(" ");
}

async function fetchJson(url) {
  const res = await fetch(url, { headers: { "user-agent": "varsagel-bot" } });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  const text = await res.text();
  return JSON.parse(text);
}

async function main() {
  const outPath = path.resolve(process.cwd(), argValue("out", "src/data/turkey-neighborhoods.json"));
  const base = "https://raw.githubusercontent.com/metinyildirimnet/turkiye-adresler-json/master";

  const cities = await fetchJson(`${base}/sehirler.json`);
  const districts = await fetchJson(`${base}/ilceler.json`);
  const neighborhoodsChunks = await Promise.all([
    fetchJson(`${base}/mahalleler-1.json`),
    fetchJson(`${base}/mahalleler-2.json`),
    fetchJson(`${base}/mahalleler-3.json`),
    fetchJson(`${base}/mahalleler-4.json`),
  ]);

  const cityIdToName = new Map();
  for (const c of cities || []) {
    const id = String(c?.sehir_id ?? "").trim();
    const name = toTitleTr(c?.sehir_adi ?? "");
    if (id && name) cityIdToName.set(id, name);
  }

  const districtIdToKey = new Map();
  for (const d of districts || []) {
    const did = String(d?.ilce_id ?? "").trim();
    const cityId = String(d?.sehir_id ?? "").trim();
    const cityName = cityIdToName.get(cityId) || toTitleTr(d?.sehir_adi ?? "");
    const districtName = toTitleTr(d?.ilce_adi ?? "");
    if (!did || !cityName || !districtName) continue;
    districtIdToKey.set(did, { cityName, districtName });
  }

  const out = {};
  const all = neighborhoodsChunks.flat();
  for (const n of all) {
    const did = String(n?.ilce_id ?? "").trim();
    const fromDistrict = districtIdToKey.get(did);
    const cityName = fromDistrict?.cityName || toTitleTr(n?.sehir_adi ?? "");
    const districtName = fromDistrict?.districtName || toTitleTr(n?.ilce_adi ?? "");
    const neighborhoodName = toTitleTr(n?.mahalle_adi ?? "");
    if (!cityName || !districtName || !neighborhoodName) continue;

    if (!out[cityName]) out[cityName] = {};
    if (!out[cityName][districtName]) out[cityName][districtName] = [];
    out[cityName][districtName].push(neighborhoodName);
  }

  for (const cityName of Object.keys(out)) {
    for (const districtName of Object.keys(out[cityName])) {
      const uniq = Array.from(new Set(out[cityName][districtName]));
      uniq.sort((a, b) => a.localeCompare(b, "tr"));
      out[cityName][districtName] = uniq;
    }
  }

  const tmp = `${outPath}.${process.pid}.${Date.now()}.tmp`;
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(tmp, JSON.stringify(out), "utf8");
  fs.renameSync(tmp, outPath);

  process.stdout.write(`OK ${outPath}\n`);
  process.stdout.write(`cities=${cities?.length || 0} districts=${districts?.length || 0} neighborhoods=${all.length}\n`);
}

main().catch((e) => {
  process.stderr.write(String(e?.stack || e?.message || e) + "\n");
  process.exit(1);
});

