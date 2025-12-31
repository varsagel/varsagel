
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

// Configuration
const EXCEL_FILE = process.argv[2] || 'scraped_data.xlsx';
const OUTPUT_FILE = path.join(__dirname, '../src/data/generated-automobil.json');

// Check if file exists
if (!fs.existsSync(EXCEL_FILE)) {
  console.error(`Error: File '${EXCEL_FILE}' not found.`);
  console.error('Usage: node scripts/import-scraped-data.js <excel-file-path>');
  process.exit(1);
}

// Read Excel
console.log(`Reading ${EXCEL_FILE}...`);
const workbook = XLSX.readFile(EXCEL_FILE);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

// Load existing data
let existingData = {};
try {
  const content = fs.readFileSync(OUTPUT_FILE, 'utf-8');
  existingData = JSON.parse(content);
} catch (e) {
  console.warn('Could not read existing data, starting fresh.', e.message);
  existingData = { modelSeries: { "vasita/otomobil": {} } };
}

// Ensure structure
if (!existingData.modelSeries) existingData.modelSeries = {};
if (!existingData.modelSeries["vasita/otomobil"]) existingData.modelSeries["vasita/otomobil"] = {};

const target = existingData.modelSeries["vasita/otomobil"];
let addedCount = 0;

// Process Rows
// Expected Format: [Brand, Model, Engine/Series, Package]
data.forEach((row, index) => {
  if (row.length < 2) return; // Skip empty or invalid rows

  const brand = (row[0] || '').trim();
  const model = (row[1] || '').trim();
  const engine = (row[2] || '').trim();
  const pkg = (row[3] || '').trim();

  if (!brand || !model) return;

  // Initialize Brand
  if (!target[brand]) target[brand] = {};

  // Initialize Model
  if (!target[brand][model]) target[brand][model] = [];

  // Construct Version String
  let version = engine;
  if (pkg) {
    version = version ? `${version} ${pkg}` : pkg;
  }

  // Add if not exists
  if (version && !target[brand][model].includes(version)) {
    target[brand][model].push(version);
    addedCount++;
    console.log(`Added: ${brand} > ${model} > ${version}`);
  }
});

// Sort Data (Optional, for cleanliness)
// ... (Sorting logic could be added here if needed)

// Write back
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(existingData, null, 2), 'utf-8');
console.log(`\nSuccess! Added ${addedCount} new entries to ${OUTPUT_FILE}`);
