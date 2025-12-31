const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Read the Excel file
const excelPath = path.join(__dirname, '..', 'sahibinden_data_full.xlsx');
const workbook = XLSX.readFile(excelPath);

// Get the "Otomobiller" sheet
const otomobillerSheet = workbook.Sheets['Otomobiller'];
if (!otomobillerSheet) {
  console.error('Otomobiller sheet not found in Excel file');
  process.exit(1);
}

// Convert sheet to JSON
const data = XLSX.utils.sheet_to_json(otomobillerSheet);
console.log(`Found ${data.length} automobile entries in Excel file`);

// Process data to extract brand/model/series hierarchy
const brandModelMap = new Map();
const modelSeriesMap = new Map();

// Group data by brand and model
for (const row of data) {
  const marka = row['Marka']?.toString().trim();
  const model = row['Model']?.toString().trim();
  const seri = row['Seri']?.toString().trim();
  const motorPaket = row['Motor/Paket']?.toString().trim();

  if (!marka || !model) continue;

  // Build brand -> models mapping
  if (!brandModelMap.has(marka)) {
    brandModelMap.set(marka, new Set());
  }
  brandModelMap.get(marka).add(model);

  // Build model -> series mapping
  const modelKey = `${marka}|${model}`;
  if (!modelSeriesMap.has(modelKey)) {
    modelSeriesMap.set(modelKey, new Set());
  }
  if (seri) {
    modelSeriesMap.get(modelKey).add(seri);
  }
}

// Convert maps to the format needed for attribute-overrides.ts
const brandModels = {};
const modelSeries = {};

// Process brand -> models
for (const [brand, modelsSet] of brandModelMap) {
  brandModels[brand] = Array.from(modelsSet).sort((a, b) => 
    a.localeCompare(b, 'tr')
  );
}

// Process model -> series
for (const [modelKey, seriesSet] of modelSeriesMap) {
  const [brand, model] = modelKey.split('|');
  const seriesArray = Array.from(seriesSet).sort((a, b) => 
    a.localeCompare(b, 'tr')
  );
  
  if (!modelSeries[brand]) {
    modelSeries[brand] = {};
  }
  modelSeries[brand][model] = seriesArray;
}

// Generate TypeScript code for attribute-overrides.ts
const tsCode = `// Automobile data from sahibinden_data_full.xlsx
// Generated on ${new Date().toISOString()}
// Total entries: ${data.length}

export const AUTOMOBILE_BRAND_MODELS = ${JSON.stringify(brandModels, null, 2)};

export const AUTOMOBILE_MODEL_SERIES = ${JSON.stringify(modelSeries, null, 2)};

// Sample of data structure (first 5 brands)
export const SAMPLE_AUTOMOBILE_DATA = ${JSON.stringify(
  Object.fromEntries(Object.entries(brandModels).slice(0, 5)),
  null,
  2
)};
`;

// Write the processed data
const outputPath = path.join(__dirname, '..', 'src', 'data', 'automobile-data.ts');
fs.writeFileSync(outputPath, tsCode);

console.log(`\nProcessed data written to: ${outputPath}`);
console.log(`Total brands: ${Object.keys(brandModels).length}`);
console.log(`Total brand-model combinations: ${Object.keys(brandModels).reduce((sum, brand) => sum + brandModels[brand].length, 0)}`);
console.log(`Total model-series combinations: ${Object.keys(modelSeries).reduce((sum, brand) => 
  sum + Object.keys(modelSeries[brand]).reduce((modelSum, model) => 
    modelSum + modelSeries[brand][model].length, 0
  ), 0
)}`);

// Show sample data
console.log('\nSample brands (first 10):');
console.log(Object.keys(brandModels).slice(0, 10));

console.log('\nSample brand-model mapping (first 3 brands):');
for (const [brand, models] of Object.entries(brandModels).slice(0, 3)) {
  console.log(`${brand}: ${models.slice(0, 5).join(', ')}${models.length > 5 ? '...' : ''}`);
}

console.log('\nSample model-series mapping (first 3 models):');
const sampleBrands = Object.keys(modelSeries).slice(0, 2);
for (const brand of sampleBrands) {
  const models = Object.keys(modelSeries[brand]).slice(0, 2);
  for (const model of models) {
    const series = modelSeries[brand][model];
    console.log(`${brand} ${model}: ${series.slice(0, 3).join(', ')}${series.length > 3 ? '...' : ''}`);
  }
}