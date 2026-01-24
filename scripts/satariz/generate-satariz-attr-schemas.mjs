import fs from "node:fs";
import path from "node:path";
import xlsx from "xlsx";

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function slugifyKey(s) {
  return String(s || "")
    .trim()
    .toLowerCase()
    .replace(/&amp;/g, "&")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function uniq(arr) {
  return Array.from(new Set(arr));
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function isLikelyChallengeHtml(html) {
  const s = String(html || "");
  return s.includes("/cdn-cgi/challenge-platform/") || s.includes("__CF$cv$params");
}

function jitter(ms, ratio = 0.25) {
  const base = Math.max(0, Number(ms) || 0);
  const spread = Math.floor(base * ratio);
  return base + Math.floor(Math.random() * (spread + 1));
}

function extractJsonArrayFromHtml(html, key) {
  const s = String(html || "");
  const idx = s.indexOf(key);
  if (idx < 0) return null;
  const start = s.indexOf("[", idx);
  if (start < 0) return null;

  let depth = 0;
  let inStr = false;
  let esc = false;
  for (let i = start; i < s.length; i++) {
    const ch = s[i];
    if (inStr) {
      if (esc) {
        esc = false;
        continue;
      }
      if (ch === "\\") {
        esc = true;
        continue;
      }
      if (ch === "\"") {
        inStr = false;
      }
      continue;
    }
    if (ch === "\"") {
      if (i > 0 && s[i - 1] === "\\") continue;
      inStr = true;
      continue;
    }
    if (ch === "[") depth += 1;
    if (ch === "]") {
      depth -= 1;
      if (depth === 0) return s.slice(start, i + 1);
    }
  }
  return null;
}

function extractAnyArray(html, keys) {
  for (const k of keys) {
    const out = extractJsonArrayFromHtml(html, k);
    if (out) return out;
  }
  return null;
}

function parsePossiblyEscapedJsonArray(text) {
  const raw = String(text || "");
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {}

  try {
    const unescapedQuotes = raw.replace(/\\+"/g, "\"");
    const parsed = JSON.parse(unescapedQuotes);
    return Array.isArray(parsed) ? parsed : null;
  } catch {}

  try {
    const unescaped = raw.replace(/\\+"/g, "\"").replace(/\\\\/g, "\\");
    const parsed = JSON.parse(unescaped);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function findFirstListingUrl(html) {
  const reAbs = /https:\/\/www\.satariz\.com\/ilan\/[a-z0-9\-\/]+/gi;
  const abs = s.match(reAbs) || [];
  if (abs.length) return abs[0];
  const reRel = /\/ilan\/[a-z0-9\-\/]+/gi;
  const rel = s.match(reRel) || [];
  if (rel.length) return `https://www.satariz.com${rel[0]}`;
  return null;
}

function findListingUrls(html, limit = 25) {
  const s = String(html || "");
  const reRel = /\/ilan\/[a-z0-9\-\/]+/gi;
  const rel = s.match(reRel) || [];
  const urls = uniq(rel.map((u) => `https://www.satariz.com${u}`));
  return urls.slice(0, Math.max(1, limit));
}

function extractMaxPageNumber(html, hardCap = 250) {
  const s = String(html || "");
  const re = new RegExp("\\\\?page=(\\\\d+)", "gi");
  const matches = Array.from(s.matchAll(re)).map((m) => Number(m[1]) || 0);
  const max = matches.length ? Math.max(...matches) : 1;
  return Math.max(1, Math.min(hardCap, max));
}

function withPage(url, page) {
  const u = new URL(url);
  u.searchParams.set("page", String(page));
  return u.toString();
}

function flattenNodes(roots) {
  const out = [];
  const stack = Array.isArray(roots) ? [...roots] : [];
  while (stack.length) {
    const n = stack.pop();
    if (!n?.slug) continue;
    const children = Array.isArray(n.children) ? n.children : [];
    out.push(n);
    children.forEach((c) => stack.push(c));
  }
  out.sort((a, b) => String(a.slug).localeCompare(String(b.slug), "tr"));
  return out;
}

function mapAttrToField(a) {
  const id = a?.attribute_id ?? a?.id ?? null;
  const key = id !== null && id !== undefined ? String(id) : slugifyKey(a?.name || "");
  const label = String(a?.name || key).trim() || key;
  const filterable = Number(a?.filter_status || 0) === 1;
  const required = Number(a?.required || 0) === 1;
  const createType = String(a?.create_type || "").toLowerCase();
  const type = String(a?.type || "").toLowerCase();
  const formatNumber = !!a?.format_number;
  const values = Array.isArray(a?.values) ? a.values : [];
  const options = uniq(
    values
      .map((v) => String(v?.value || "").trim())
      .filter(Boolean),
  );

  let outType = "text";
  if (createType === "checkbox" && options.length > 0) outType = "multiselect";
  else if (createType === "checkbox") outType = "boolean";
  else if (formatNumber || type === "number") outType = "range-number";
  else if (createType === "select") outType = "select";
  else outType = "text";

  const f = {
    label,
    key: outType === "range-number" ? undefined : key,
    type: outType,
    options: options.length ? options : undefined,
    minKey: outType === "range-number" ? `${key}Min` : undefined,
    maxKey: outType === "range-number" ? `${key}Max` : undefined,
    minLabel: outType === "range-number" ? "En az" : undefined,
    maxLabel: outType === "range-number" ? "En çok" : undefined,
    required,
    showInRequest: filterable,
    showInOffer: true,
    satariz: {
      attributeId: id,
      type,
      createType,
      filter_status: Number(a?.filter_status || 0) || 0,
      show_listing_status: Number(a?.show_listing_status || 0) || 0,
      listing_transaction_must: a?.listing_transaction_must ?? null,
    },
  };
  return f;
}

function mergeAttrValuesIntoMap(map, arr) {
  const list = Array.isArray(arr) ? arr : [];
  for (const a of list) {
    const id = a?.attribute_id ?? a?.id ?? null;
    if (id === null || id === undefined) continue;
    const key = String(id);
    const prev = map.get(key);
    const next = { ...(prev || {}), ...(a || {}) };

    const prevValues = Array.isArray(prev?.values) ? prev.values : [];
    const nextValues = Array.isArray(a?.values) ? a.values : [];
    const mergedValues = uniq(
      [...prevValues, ...nextValues].map((v) => String(v?.value || "").trim()).filter(Boolean),
    ).map((value) => ({ value }));
    next.values = mergedValues;

    next.filter_status = Math.max(Number(prev?.filter_status || 0) || 0, Number(a?.filter_status || 0) || 0);
    next.required = Math.max(Number(prev?.required || 0) || 0, Number(a?.required || 0) || 0);
    next.show_listing_status = Math.max(
      Number(prev?.show_listing_status || 0) || 0,
      Number(a?.show_listing_status || 0) || 0,
    );

    map.set(key, next);
  }
}

async function fetchWithRetry(url, tries = 3, opts = {}) {
  let last = null;
  for (let i = 0; i < tries; i++) {
    const headers = {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "accept-language": "tr-TR,tr;q=0.9,en;q=0.8",
      ...(opts?.headers || {}),
    };
    const r = await fetch(url, {
      headers,
    });
    const text = await r.text();
    last = { status: r.status, text };
    if (r.ok) return last;

    const status = Number(r.status) || 0;
    const base =
      status === 429
        ? 2200
        : status === 403
          ? 1500
          : status >= 500
            ? 900
            : 600;
    await sleep(jitter(base + i * 750));
  }
  return last;
}

async function collectListingUrls(listUrl, opts) {
  const maxPages = Math.max(1, Number(opts?.maxPages || 1) || 1);
  const maxUrls = Math.max(1, Number(opts?.maxUrls || 60) || 60);
  const pageFetchTries = Math.max(1, Number(opts?.pageFetchTries || 2) || 2);

  const page1 = await fetchWithRetry(listUrl, pageFetchTries, { headers: { referer: "https://www.satariz.com/" } });
  if (!page1?.text) return { urls: [], pageCount: 0 };

  const maxFromHtml = extractMaxPageNumber(page1.text, 250);
  const pagesToTry = Math.min(maxPages, maxFromHtml);

  const urlSet = new Set(findListingUrls(page1.text, maxUrls));
  for (let p = 2; p <= pagesToTry; p++) {
    if (urlSet.size >= maxUrls) break;
    const pageUrl = withPage(listUrl, p);
    const res = await fetchWithRetry(pageUrl, pageFetchTries, { headers: { referer: listUrl } });
    if (!res?.text) continue;
    const found = findListingUrls(res.text, maxUrls);
    for (const u of found) {
      urlSet.add(u);
      if (urlSet.size >= maxUrls) break;
    }
    await sleep(jitter(220));
  }

  return { urls: Array.from(urlSet), pageCount: pagesToTry };
}

async function main() {
  const taxonomyPath =
    process.env.TAXONOMY_JSON || path.join(process.cwd(), "src", "data", "satariz-taxonomy.json");
  const outJsonPath =
    process.env.OUT_JSON || path.join(process.cwd(), "src", "data", "satariz-attr-schemas.json");
  const outXlsxPath =
    process.env.OUT_XLSX || path.join(process.cwd(), "public", "exports", "satariz-kategori-filtreleri.xlsx");
  const cachePath =
    process.env.CACHE_JSON || path.join(process.cwd(), "scripts", "satariz", ".cache", "satariz-attr-schemas.partial.json");

  const maxLeaves = Number(process.env.MAX_LEAVES || 0) || 0;
  const maxSuccess = Number(process.env.MAX_SUCCESS || 0) || 0;
  const onlySlugs = String(process.env.ONLY_SLUGS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const maxConcurrency = Math.max(1, Number(process.env.CONCURRENCY || 5) || 5);
  const listingPages = Math.max(1, Number(process.env.LISTING_PAGES || 3) || 3);
  const listingUrls = Math.max(1, Number(process.env.LISTING_URLS || 80) || 80);
  const pageFetchTries = Math.max(1, Number(process.env.PAGE_FETCH_TRIES || 2) || 2);
  const detailFetchTries = Math.max(1, Number(process.env.DETAIL_FETCH_TRIES || 2) || 2);
  const detailLimit = Math.max(1, Number(process.env.DETAIL_LIMIT || 35) || 35);
  const attrSamples = Math.max(1, Number(process.env.ATTR_SAMPLES || 6) || 6);
  const emptyCutoff = Math.max(1, Number(process.env.EMPTY_CUTOFF || 4) || 4);
  const force = String(process.env.FORCE || "") === "1";

  if (!fs.existsSync(taxonomyPath)) throw new Error(`Taxonomy bulunamadı: ${taxonomyPath}`);
  const taxonomy = JSON.parse(fs.readFileSync(taxonomyPath, "utf8"));
  const nodes = flattenNodes(taxonomy?.roots || []);
  const targetNodes = maxLeaves > 0 ? nodes.slice(0, maxLeaves) : nodes;

  let existing = {};
  if (fs.existsSync(cachePath)) {
    try {
      existing = JSON.parse(fs.readFileSync(cachePath, "utf8"));
    } catch {
      existing = {};
    }
  }

  const results = { ...existing };
  let cursor = 0;
  let successCount = Object.keys(results).filter((k) => Array.isArray(results[k]) && results[k].length > 0).length;
  const startedAt = Date.now();

  const tasks = targetNodes
    .filter((n) => (onlySlugs.length ? onlySlugs.includes(String(n.slug)) : true))
    .map((node) => ({
    slug: String(node.slug),
    url: String(node.url || `https://www.satariz.com/${node.slug}`),
  }));
  if (process.env.DEBUG) {
    process.stdout.write(`ONLY_SLUGS_RAW=${JSON.stringify(process.env.ONLY_SLUGS || "")}\n`);
    process.stdout.write(`ONLY_SLUGS_PARSED=${JSON.stringify(onlySlugs)}\n`);
    process.stdout.write(`tasks=${tasks.length}\n`);
  }

  const worker = async () => {
    while (cursor < tasks.length) {
      if (maxSuccess > 0 && successCount >= maxSuccess) return;
      const i = cursor;
      cursor += 1;
      const t = tasks[i];
      if (!t?.slug) continue;
      if (!force && Array.isArray(results[t.slug]) && results[t.slug].length > 0) continue;

      const collected = await collectListingUrls(t.url, {
        maxPages: listingPages,
        maxUrls: listingUrls,
        pageFetchTries,
      });
      const ilanUrls = collected.urls;
      if (!ilanUrls.length) continue;
      const shuffled = ilanUrls
        .slice(0)
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.min(detailLimit, ilanUrls.length));
      if (process.env.DEBUG) {
        process.stdout.write(
          `${t.slug}\tpages=${collected.pageCount}\tilanUrls=${ilanUrls.length}\ttryDetail=${shuffled.length}\n`,
        );
      }

      let attrValues = null;
      const merged = new Map();
      let nonEmptySamples = 0;
      let emptySamples = 0;
      for (const ilanUrl of shuffled) {
        const detailRes = await fetchWithRetry(ilanUrl, detailFetchTries, { headers: { referer: t.url } });
        if (!detailRes?.text) continue;
        const arrText = extractAnyArray(detailRes.text, [
          "\"attribute_values\":",
          "\\\"attribute_values\\\":",
          "attribute_values\":",
          "attribute_values\\\":",
        ]);
        if (!arrText) continue;
        const parsed = parsePossiblyEscapedJsonArray(arrText);
        if (parsed && parsed.length > 0) {
          mergeAttrValuesIntoMap(merged, parsed);
          nonEmptySamples += 1;
          if (nonEmptySamples >= attrSamples) break;
        } else if (Array.isArray(parsed) && parsed.length === 0) {
          emptySamples += 1;
          if (merged.size === 0 && emptySamples >= emptyCutoff) break;
        }
        await sleep(jitter(140));
      }
      if (merged.size === 0) continue;
      attrValues = Array.from(merged.values());

      const fields = attrValues
        .map(mapAttrToField)
        .filter((f) => f && (f.key !== "" || f.minKey || f.maxKey));

      const elapsedSec = Math.round((Date.now() - startedAt) / 1000);
      process.stdout.write(
        `${t.slug}\tfields=${fields.length}\tsuccess=${successCount + 1}\t/${tasks.length}\telapsed=${elapsedSec}s\n`,
      );

      results[t.slug] = fields;
      if (fields.length > 0) successCount += 1;

      ensureDir(path.dirname(cachePath));
      fs.writeFileSync(cachePath, JSON.stringify(results, null, 2), "utf8");
      await sleep(jitter(260));
    }
  };

  await Promise.all(Array.from({ length: maxConcurrency }, () => worker()));

  ensureDir(path.dirname(outJsonPath));
  fs.writeFileSync(outJsonPath, JSON.stringify(results, null, 2), "utf8");

  const wb = xlsx.utils.book_new();
  const indexRows = Object.keys(results)
    .sort((a, b) => a.localeCompare(b, "tr"))
    .map((slug) => ({
      slug,
      fieldCount: Array.isArray(results[slug]) ? results[slug].length : 0,
    }));
  xlsx.utils.book_append_sheet(wb, xlsx.utils.json_to_sheet(indexRows), "INDEX");

  const used = new Set(["INDEX"]);
  const mkSheetName = (slug) => {
    const base = String(slug || "sheet")
      .replace(/[\[\]\*\/\\\?\:]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 31);
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
    const fallback = `sheet~${used.size}`.slice(0, 31);
    used.add(fallback);
    return fallback;
  };

  for (const slug of Object.keys(results).sort((a, b) => a.localeCompare(b, "tr"))) {
    const fields = Array.isArray(results[slug]) ? results[slug] : [];
    const rows = fields.map((f) => ({
      label: f.label,
      key: f.key || "",
      type: f.type,
      required: !!f.required,
      showInRequest: f.showInRequest !== false,
      options: Array.isArray(f.options) ? f.options.join(", ") : "",
      minKey: f.minKey || "",
      maxKey: f.maxKey || "",
      satarizAttributeId: f?.satariz?.attributeId ?? "",
      satarizType: f?.satariz?.type ?? "",
      satarizCreateType: f?.satariz?.createType ?? "",
    }));
    const ws = xlsx.utils.json_to_sheet(rows);
    xlsx.utils.book_append_sheet(wb, ws, mkSheetName(slug));
  }

  ensureDir(path.dirname(outXlsxPath));
  xlsx.writeFile(wb, outXlsxPath);

  process.stdout.write(`OK\n${outJsonPath}\n${outXlsxPath}\n`);
}

main().catch((e) => {
  process.stderr.write(String(e?.message || e) + "\n");
  process.exit(1);
});
