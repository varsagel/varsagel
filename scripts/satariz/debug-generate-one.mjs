function isLikelyChallengeHtml(html) {
  const s = String(html || "");
  return s.includes("/cdn-cgi/challenge-platform/") || s.includes("__CF$cv$params");
}

async function fetchWithRetry(url, tries = 3) {
  let last = null;
  for (let i = 0; i < tries; i++) {
    const r = await fetch(url, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });
    const text = await r.text();
    last = { status: r.status, text };
    if (r.ok && !isLikelyChallengeHtml(text)) return last;
  }
  return last;
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
      if (ch === "\"") inStr = false;
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
    if (out) return { key: k, json: out };
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
    const parsed = JSON.parse(raw.replace(/\\+"/g, "\""));
    return Array.isArray(parsed) ? parsed : null;
  } catch {}
  try {
    const parsed = JSON.parse(raw.replace(/\\+"/g, "\"").replace(/\\\\/g, "\\"));
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function findFirstListingUrl(html) {
  const s = String(html || "");
  const reRel = /\/ilan\/[a-z0-9\-\/]+/gi;
  const rel = s.match(reRel) || [];
  if (rel.length) return `https://www.satariz.com${rel[0]}`;
  return null;
}

async function main() {
  const slug = process.env.SLUG || "vasita";
  const url = `https://www.satariz.com/${slug}`;
  const listRes = await fetchWithRetry(url, 3);
  process.stdout.write(`list status=${listRes?.status} len=${listRes?.text?.length}\n`);
  const ilanUrl = findFirstListingUrl(listRes?.text || "");
  process.stdout.write(`ilanUrl=${ilanUrl || "NONE"}\n`);
  if (!ilanUrl) return;
  const detailRes = await fetchWithRetry(ilanUrl, 3);
  process.stdout.write(`detail status=${detailRes?.status} len=${detailRes?.text?.length}\n`);
  const found = extractAnyArray(detailRes?.text || "", ["\\\"attribute_values\\\":", "\"attribute_values\":"]);
  process.stdout.write(`extract=${found?.key || "NONE"}\n`);
  if (!found) return;
  const arr = parsePossiblyEscapedJsonArray(found.json);
  process.stdout.write(`parsed=${arr ? arr.length : "NULL"}\n`);
}

main().catch((e) => {
  process.stderr.write(String(e?.message || e) + "\n");
  process.exit(1);
});

