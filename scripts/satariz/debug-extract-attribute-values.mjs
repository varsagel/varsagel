function isLikelyChallengeHtml(html) {
  const s = String(html || "");
  return s.includes("/cdn-cgi/challenge-platform/") || s.includes("__CF$cv$params");
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

async function main() {
  const url =
    process.env.URL ||
    "https://www.satariz.com/ilan/vasita-arac-opel-akgun-otomotiv-plazadan-opel-corsa-1000004602";
  const r = await fetch(url, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  });
  const text = await r.text();
  process.stdout.write(`status=${r.status} len=${text.length} challenge=${isLikelyChallengeHtml(text)}\n`);

  const found = extractAnyArray(text, [
    "\"attribute_values\":",
    "\\\"attribute_values\\\":",
    "attribute_values\":",
    "attribute_values\\\":",
    "\"attributes\":",
    "\\\"attributes\\\":",
  ]);
  if (!found) {
    process.stdout.write("NOT_FOUND\n");
    process.exit(0);
  }

  process.stdout.write(`found_key=${found.key}\n`);
  const arr = parsePossiblyEscapedJsonArray(found.json);
  if (!arr) {
    const raw = String(found.json || "");
    const candidates = [
      raw,
      raw.replace(/\\+"/g, "\""),
      raw.replace(/\\+"/g, "\"").replace(/\\\\/g, "\\"),
    ];
    for (let i = 0; i < candidates.length; i++) {
      try {
        const parsed = JSON.parse(candidates[i]);
        if (Array.isArray(parsed)) {
          process.stdout.write(`recovered_with=${i}\nparsed_len=${parsed.length}\n`);
          return;
        }
      } catch (e) {
        process.stdout.write(`try=${i} err=${String(e?.message || e)}\n`);
      }
    }
    process.stdout.write("PARSE_FAIL\n");
    process.stdout.write(raw.slice(0, 260) + "\n");
    return;
  }
  process.stdout.write(`parsed_len=${arr.length}\n`);
  if (arr[0]) process.stdout.write(`sample_keys=${Object.keys(arr[0]).slice(0, 12).join(",")}\n`);
}

main().catch((e) => {
  process.stderr.write(String(e?.message || e) + "\n");
  process.exit(1);
});
