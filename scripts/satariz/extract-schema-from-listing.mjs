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

function uniq(arr) {
  return Array.from(new Set(arr));
}

function mapAttrToField(a) {
  const id = a?.attribute_id ?? a?.id ?? null;
  const key = id !== null && id !== undefined ? String(id) : "";
  const label = String(a?.name || key).trim() || key;
  const filterable = Number(a?.filter_status || 0) === 1;
  const required = Number(a?.required || 0) === 1;
  const createType = String(a?.create_type || "").toLowerCase();
  const type = String(a?.type || "").toLowerCase();
  const formatNumber = !!a?.format_number;
  const values = Array.isArray(a?.values) ? a.values : [];
  const options = uniq(values.map((v) => String(v?.value || "").trim()).filter(Boolean));

  let outType = "text";
  if (createType === "checkbox" && options.length > 0) outType = "multiselect";
  else if (createType === "checkbox") outType = "boolean";
  else if (formatNumber || type === "number") outType = "range-number";
  else if (createType === "select") outType = "select";
  else outType = "text";

  return {
    label,
    key: outType === "range-number" ? undefined : key,
    type: outType,
    options: options.length ? options : undefined,
    minKey: outType === "range-number" ? `${key}Min` : undefined,
    maxKey: outType === "range-number" ? `${key}Max` : undefined,
    required,
    showInRequest: filterable,
  };
}

async function main() {
  const url =
    process.env.URL ||
    "https://www.satariz.com/ilan/vasita-arac-opel-akgun-otomotiv-plazadan-opel-corsa-1000004602";
  const r = await fetch(url, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      accept: "text/html,*/*",
    },
  });
  const html = await r.text();
  process.stdout.write(`status=${r.status} challenge=${isLikelyChallengeHtml(html)} len=${html.length}\n`);
  const arrText = extractAnyArray(html, ["\\\"attribute_values\\\":", "\"attribute_values\":"]);
  const arr = parsePossiblyEscapedJsonArray(arrText);
  if (!arr) throw new Error("attribute_values parse failed");
  const fields = arr.map(mapAttrToField).filter((f) => f.showInRequest);
  process.stdout.write(JSON.stringify(fields, null, 2) + "\n");
}

main().catch((e) => {
  process.stderr.write(String(e?.message || e) + "\n");
  process.exit(1);
});

