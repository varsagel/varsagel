const XLSX = require('xlsx');
const fs = require('fs');

const EXCEL_PATH = 'c:/varsagel/varsagel/kategoriler/İş Makineleri & Sanayi.xlsx';
const OUTPUT_STRUCTURE_PATH = 'c:/varsagel/varsagel/src/data/sanayi-structure.json';
const OUTPUT_ATTRIBUTES_PATH = 'c:/varsagel/varsagel/src/data/sanayi-attributes.json';

function trSlug(str) {
  if (!str) return '';
  return str
    .toString()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ı/g, 'i')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function isMinMaxLabel(text) {
  const s = String(text || '').trim();
  if (!s) return false;
  return /\b(min|max)\b\.?$/i.test(s);
}

function stripMinMaxSuffix(text) {
  const s = String(text || '').trim();
  return s.replace(/\b(min|max)\b\.?$/i, '').trim();
}

function getOrCreateNested(parent, name, currentPath, root) {
  const slug = trSlug(name);
  if (!slug) return { node: parent, path: currentPath };

  const isRoot = parent.slug === root.slug && parent.name === root.name;
  const fullSlug = isRoot ? slug : `${currentPath}-${slug}`;

  if (!parent.subcategories) parent.subcategories = [];
  let child = parent.subcategories.find((c) => c.slug === slug);
  if (!child) {
    child = { name, slug, fullSlug, subcategories: [] };
    parent.subcategories.push(child);
  } else if (!child.fullSlug) {
    child.fullSlug = fullSlug;
  }

  return { node: child, path: fullSlug };
}

function addSelectOption(selectMap, categoryKey, label, option) {
  const l = String(label || '').trim();
  const o = String(option || '').trim();
  if (!l || !o) return;
  if (!selectMap[categoryKey]) selectMap[categoryKey] = {};
  if (!selectMap[categoryKey][l]) selectMap[categoryKey][l] = new Set();
  selectMap[categoryKey][l].add(o);
}

function addRangeField(rangeMap, categoryKey, minLabel, maxLabel) {
  const minL = String(minLabel || '').trim();
  const maxL = String(maxLabel || '').trim();
  if (!minL || !maxL) return;
  if (!isMinMaxLabel(minL) || !isMinMaxLabel(maxL)) return;

  const baseMin = stripMinMaxSuffix(minL);
  const baseMax = stripMinMaxSuffix(maxL);
  const base = baseMin && baseMin === baseMax ? baseMin : baseMin || baseMax;
  if (!base) return;

  if (!rangeMap[categoryKey]) rangeMap[categoryKey] = {};
  rangeMap[categoryKey][base] = { minLabel: minL, maxLabel: maxL };
}

function main() {
  if (!fs.existsSync(EXCEL_PATH)) {
    console.error('File not found:', EXCEL_PATH);
    process.exit(1);
  }

  const workbook = XLSX.readFile(EXCEL_PATH);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

  const root = {
    name: 'İş Makineleri & Sanayi',
    slug: 'is-makineleri-sanayi',
    fullSlug: 'is-makineleri-sanayi',
    subcategories: [],
  };

  const selectMap = {};
  const rangeMap = {};
  const pendingLabelByCategory = {};

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const mainCategory = String(row[0] || '').trim();
    if (mainCategory && mainCategory !== root.name) continue;

    let currentNode = root;
    let currentPath = root.fullSlug;

    for (let col = 1; col <= 2; col++) {
      const rawName = String(row[col] || '').trim();
      if (!rawName) continue;
      const next = getOrCreateNested(currentNode, rawName, currentPath, root);
      currentNode = next.node;
      currentPath = next.path;
    }

    const categoryKey = currentNode.fullSlug || currentNode.slug;

    const a3 = String(row[3] || '').trim();
    const a4 = String(row[4] || '').trim();
    const a5 = String(row[5] || '').trim();
    const a6 = String(row[6] || '').trim();

    if (!a3 && !a4 && a5 && a6) {
      addRangeField(rangeMap, categoryKey, a5, a6);
      continue;
    }

    if (a3 && isMinMaxLabel(a3) && a4 && isMinMaxLabel(a4)) {
      addRangeField(rangeMap, categoryKey, a3, a4);
      continue;
    }

    if (a4 && isMinMaxLabel(a4) && a5 && isMinMaxLabel(a5)) {
      addRangeField(rangeMap, categoryKey, a4, a5);
    }

    if (a5 && a6 && isMinMaxLabel(a5) && isMinMaxLabel(a6)) {
      addRangeField(rangeMap, categoryKey, a5, a6);
    }

    if (!a3 && !a4 && a5 && !a6) {
      const pending = pendingLabelByCategory[categoryKey];
      if (pending) addSelectOption(selectMap, categoryKey, pending, a5);
      continue;
    }

    if (a3 && a4 && !isMinMaxLabel(a4)) {
      addSelectOption(selectMap, categoryKey, a3, a4);
      continue;
    }

    if (a4 && a5 && !isMinMaxLabel(a5)) {
      addSelectOption(selectMap, categoryKey, a4, a5);
      pendingLabelByCategory[categoryKey] = a4;
      continue;
    }

    if (!a3 && a4 && !a5 && !a6) {
      pendingLabelByCategory[categoryKey] = a4;
      continue;
    }

    if (a3 && !a4 && !a5 && !a6) {
      pendingLabelByCategory[categoryKey] = a3;
      continue;
    }
  }

  fs.writeFileSync(OUTPUT_STRUCTURE_PATH, JSON.stringify(root, null, 2));

  const attributesOutput = {};
  const allKeys = new Set([...Object.keys(selectMap), ...Object.keys(rangeMap)]);
  for (const categoryKey of allKeys) {
    const fields = [];

    const selects = selectMap[categoryKey] || {};
    Object.entries(selects).forEach(([label, set]) => {
      const options = Array.from(set)
        .map((v) => String(v))
        .filter(Boolean);
      if (options.length === 0) return;
      fields.push({
        type: 'select',
        key: trSlug(label),
        label,
        options: options.sort((a, b) => a.localeCompare(b, 'tr')),
      });
    });

    const ranges = rangeMap[categoryKey] || {};
    Object.entries(ranges).forEach(([baseLabel, meta]) => {
      const baseKey = trSlug(baseLabel);
      if (!baseKey) return;
      fields.push({
        type: 'range-number',
        label: baseLabel,
        minKey: `${baseKey}Min`,
        maxKey: `${baseKey}Max`,
        minLabel: meta.minLabel,
        maxLabel: meta.maxLabel,
      });
    });

    fields.sort((a, b) => String(a.label).localeCompare(String(b.label), 'tr'));
    if (fields.length > 0) attributesOutput[categoryKey] = fields;
  }

  fs.writeFileSync(OUTPUT_ATTRIBUTES_PATH, JSON.stringify(attributesOutput, null, 2));
  console.log('Structure written to:', OUTPUT_STRUCTURE_PATH);
  console.log('Attributes written to:', OUTPUT_ATTRIBUTES_PATH);
}

main();

