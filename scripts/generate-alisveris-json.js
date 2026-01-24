const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const EXCEL_PATH = 'c:/varsagel/varsagel/kategoriler/İkinci El ve Sıfır Alışveriş.xlsx';
const OUTPUT_STRUCTURE_PATH = 'c:/varsagel/varsagel/src/data/alisveris-structure.json';
const OUTPUT_ATTRIBUTES_PATH = 'c:/varsagel/varsagel/src/data/alisveris-attributes.json';

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

function getOrCreateNested(parent, name, currentPath) {
  const slug = trSlug(name);
  if (!slug) return { node: parent, path: currentPath };

  const isRoot = parent.slug === 'alisveris' && parent.name === 'İkinci El ve Sıfır Alışveriş';
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
    name: 'İkinci El ve Sıfır Alışveriş',
    slug: 'alisveris',
    fullSlug: 'alisveris',
    subcategories: []
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

    for (let col = 1; col <= 5; col++) {
      const rawName = String(row[col] || '').trim();
      if (!rawName) continue;
      const next = getOrCreateNested(currentNode, rawName, currentPath);
      currentNode = next.node;
      currentPath = next.path;
    }

    const categoryKey = currentNode.fullSlug || currentNode.slug;

    const a6 = String(row[6] || '').trim();
    const a7 = String(row[7] || '').trim();
    const a8 = String(row[8] || '').trim();
    const a9 = String(row[9] || '').trim();

    if (!a6 && !a7 && a8 && a9) {
      addRangeField(rangeMap, categoryKey, a8, a9);
      continue;
    }

    if (a6 && isMinMaxLabel(a6) && a7 && isMinMaxLabel(a7)) {
      addRangeField(rangeMap, categoryKey, a6, a7);
      continue;
    }

    if (a7 && isMinMaxLabel(a7) && a8 && isMinMaxLabel(a8)) {
      addRangeField(rangeMap, categoryKey, a7, a8);
    }

    if (a8 && a9 && isMinMaxLabel(a8) && isMinMaxLabel(a9)) {
      addRangeField(rangeMap, categoryKey, a8, a9);
    }

    if (!a6 && !a7 && a8 && !a9) {
      const pending = pendingLabelByCategory[categoryKey];
      if (pending) addSelectOption(selectMap, categoryKey, pending, a8);
      continue;
    }

    if (a6 && a7 && !isMinMaxLabel(a7)) {
      addSelectOption(selectMap, categoryKey, a6, a7);
      continue;
    }

    if (a7 && a8 && !isMinMaxLabel(a8)) {
      addSelectOption(selectMap, categoryKey, a7, a8);
      pendingLabelByCategory[categoryKey] = a7;
      continue;
    }

    if (!a6 && a7 && !a8 && !a9) {
      pendingLabelByCategory[categoryKey] = a7;
      continue;
    }

    if (a6 && !a7 && !a8 && !a9) {
      pendingLabelByCategory[categoryKey] = a6;
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
      const options = Array.from(set).map((v) => String(v)).filter(Boolean);
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
