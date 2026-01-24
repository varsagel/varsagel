import path from "node:path";
import { readJsonFileCached } from "@/lib/file-cache";

type NeighborhoodIndex = Record<string, Record<string, string[]>>;

type PreparedIndex = {
  data: NeighborhoodIndex;
  provinceNormToKey: Record<string, string>;
  districtNormToKeyByProvince: Record<string, Record<string, string>>;
};

function normalizeTr(input: string): string {
  return String(input || "")
    .toLocaleLowerCase("tr")
    .replace(/\s+/g, " ")
    .trim();
}

function prepare(data: NeighborhoodIndex): PreparedIndex {
  const provinceNormToKey: Record<string, string> = {};
  const districtNormToKeyByProvince: Record<string, Record<string, string>> = {};

  for (const [provinceKey, districts] of Object.entries(data || {})) {
    const pn = normalizeTr(provinceKey);
    if (pn) provinceNormToKey[pn] = provinceKey;
    districtNormToKeyByProvince[provinceKey] = {};
    for (const districtKey of Object.keys(districts || {})) {
      const dn = normalizeTr(districtKey);
      if (dn) districtNormToKeyByProvince[provinceKey][dn] = districtKey;
    }
  }

  return { data, provinceNormToKey, districtNormToKeyByProvince };
}

function getPrepared(): PreparedIndex {
  const g = globalThis as any;
  if (g.__varsagel_neighborhoods_prepared) return g.__varsagel_neighborhoods_prepared as PreparedIndex;

  const fp = path.join(process.cwd(), "src", "data", "turkey-neighborhoods.json");
  const data = readJsonFileCached<NeighborhoodIndex>(fp, {}, 60_000);
  const prepared = prepare(data);
  g.__varsagel_neighborhoods_prepared = prepared;
  return prepared;
}

export function getNeighborhoods(city: string, district: string): string[] {
  const prepared = getPrepared();
  const cityKey = prepared.provinceNormToKey[normalizeTr(city)] || city;
  const districts = prepared.data[cityKey];
  if (!districts) return [];
  const districtKey = prepared.districtNormToKeyByProvince[cityKey]?.[normalizeTr(district)] || district;
  const arr = districts[districtKey];
  return Array.isArray(arr) ? arr : [];
}

export function getDistricts(city: string): string[] {
  const prepared = getPrepared();
  const cityKey = prepared.provinceNormToKey[normalizeTr(city)] || city;
  const districts = prepared.data[cityKey];
  if (!districts) return [];
  return Object.keys(districts).sort((a, b) => a.localeCompare(b, "tr"));
}
