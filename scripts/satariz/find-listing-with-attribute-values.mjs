function isLikelyChallengeHtml(html) {
  const s = String(html || "");
  return s.includes("/cdn-cgi/challenge-platform/") || s.includes("__CF$cv$params");
}

async function fetchHtml(url) {
  const r = await fetch(url, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      accept: "text/html,*/*",
    },
  });
  const text = await r.text();
  return { status: r.status, text };
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

function parsePossiblyEscapedJsonArray(text) {
  const raw = String(text || "");
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {}
  try {
    const parsed = JSON.parse(raw.replace(/\\+"/g, "\""));
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function findListingUrls(html, limit = 30) {
  const s = String(html || "");
  const rel = s.match(/\/ilan\/[a-z0-9\-\/]+/gi) || [];
  const uniq = Array.from(new Set(rel.map((u) => `https://www.satariz.com${u}`)));
  return uniq.slice(0, limit);
}

async function main() {
  const slug = process.env.SLUG || "vasita-arac";
  const listUrl = `https://www.satariz.com/${slug}`;
  const list = await fetchHtml(listUrl);
  process.stdout.write(`list status=${list.status} len=${list.text.length} challenge=${isLikelyChallengeHtml(list.text)}\n`);
  const ilanUrls = findListingUrls(list.text, Number(process.env.LIMIT || 25) || 25);
  process.stdout.write(`ilan candidates=${ilanUrls.length}\n`);
  for (const u of ilanUrls) {
    const d = await fetchHtml(u);
    const arrText = extractJsonArrayFromHtml(d.text, "\\\"attribute_values\\\":") || extractJsonArrayFromHtml(d.text, "\"attribute_values\":");
    const arr = parsePossiblyEscapedJsonArray(arrText);
    const len = Array.isArray(arr) ? arr.length : -1;
    process.stdout.write(`${len}\t${u}\n`);
    if (len > 0) break;
  }
}

main().catch((e) => {
  process.stderr.write(String(e?.message || e) + "\n");
  process.exit(1);
});

