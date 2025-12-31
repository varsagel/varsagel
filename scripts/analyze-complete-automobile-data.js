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
console.log(`Excel'de toplam ${data.length} otomobil kaydı bulundu`);

// Read current automobile data
const currentDataPath = path.join(__dirname, '..', 'src', 'data', 'automobile-data.ts');
const currentDataContent = fs.readFileSync(currentDataPath, 'utf8');

// Extract current data
const brandModelsMatch = currentDataContent.match(/export const AUTOMOBILE_BRAND_MODELS = ({[\s\S]*?});/);
const modelSeriesMatch = currentDataContent.match(/export const AUTOMOBILE_MODEL_SERIES = ({[\s\S]*?});/);

let currentBrandModels = {};
let currentModelSeries = {};

if (brandModelsMatch && modelSeriesMatch) {
  try {
    const brandModelsStr = brandModelsMatch[1].replace(/'/g, '"');
    const modelSeriesStr = modelSeriesMatch[1].replace(/'/g, '"');
    
    currentBrandModels = JSON.parse(brandModelsStr);
    currentModelSeries = JSON.parse(modelSeriesStr);
  } catch (e) {
    console.error('Mevcut veri okunamadı:', e.message);
  }
}

console.log(`\nMevcut entegrasyonda ${Object.keys(currentBrandModels).length} marka var`);

// Process ALL data from Excel (not just a subset)
const allBrandModelMap = new Map();
const allModelSeriesMap = new Map();

// Group ALL data from Excel
for (const row of data) {
  const marka = row['Marka']?.toString().trim();
  const model = row['Model']?.toString().trim();
  const seri = row['Seri']?.toString().trim();
  const motorPaket = row['Motor/Paket']?.toString().trim();

  if (!marka || !model) continue;

  // Build brand -> models mapping
  if (!allBrandModelMap.has(marka)) {
    allBrandModelMap.set(marka, new Set());
  }
  allBrandModelMap.get(marka).add(model);

  // Build model -> series mapping
  const modelKey = `${marka}|${model}`;
  if (!allModelSeriesMap.has(modelKey)) {
    allModelSeriesMap.set(modelKey, new Set());
  }
  if (seri) {
    allModelSeriesMap.get(modelKey).add(seri);
  }
}

// Compare with current data
console.log('\n--- EKSİK VERİ ANALİZİ ---');

const excelBrands = Array.from(allBrandModelMap.keys()).sort();
const currentBrands = Object.keys(currentBrandModels);

console.log(`Excel'deki markalar: ${excelBrands.length}`);
console.log(`Mevcut markalar: ${currentBrands.length}`);

// Find missing brands
const missingBrands = excelBrands.filter(brand => !currentBrands.includes(brand));
console.log(`\nEksik markalar: ${missingBrands.length}`);
if (missingBrands.length > 0) {
  console.log('Eksik markalar:', missingBrands.slice(0, 10));
}

// Find missing models for existing brands
let totalMissingModels = 0;
for (const [brand, modelsSet] of allBrandModelMap) {
  if (currentBrandModels[brand]) {
    const excelModels = Array.from(modelsSet);
    const currentModels = currentBrandModels[brand] || [];
    const missingModels = excelModels.filter(model => !currentModels.includes(model));
    
    if (missingModels.length > 0) {
      console.log(`\n${brand}: ${missingModels.length} eksik model`);
      console.log('Eksik modeller:', missingModels.slice(0, 5));
      totalMissingModels += missingModels.length;
    }
  }
}

console.log(`\nToplam eksik model: ${totalMissingModels}`);

// Create complete data with ALL Excel entries
const completeBrandModels = {};
const completeModelSeries = {};

// Process ALL brands and models from Excel
for (const [brand, modelsSet] of allBrandModelMap) {
  completeBrandModels[brand] = Array.from(modelsSet).sort((a, b) => 
    a.localeCompare(b, 'tr')
  );
}

// Process ALL model series from Excel
for (const [modelKey, seriesSet] of allModelSeriesMap) {
  const [brand, model] = modelKey.split('|');
  const seriesArray = Array.from(seriesSet).sort((a, b) => 
    a.localeCompare(b, 'tr')
  );
  
  if (!completeModelSeries[brand]) {
    completeModelSeries[brand] = {};
  }
  completeModelSeries[brand][model] = seriesArray;
}

console.log(`\n--- TAM VERİ ÖZETİ ---`);
console.log(`Toplam marka: ${Object.keys(completeBrandModels).length}`);
console.log(`Toplam model: ${Object.values(completeBrandModels).reduce((sum, models) => sum + models.length, 0)}`);
console.log(`Toplam seri: ${Object.values(completeModelSeries).reduce((brandSum, brandData) => 
  brandSum + Object.values(brandData).reduce((modelSum, series) => modelSum + series.length, 0)
, 0)}`);

// Generate complete TypeScript code
const completeTsCode = `// Complete automobile data from sahibinden_data_full.xlsx
// Generated on ${new Date().toISOString()}
// Total entries: ${data.length}
// This file contains ALL data from the Excel file

export const AUTOMOBILE_BRAND_MODELS = ${JSON.stringify(completeBrandModels, null, 2)};

export const AUTOMOBILE_MODEL_SERIES = ${JSON.stringify(completeModelSeries, null, 2)};

// Statistics
export const AUTOMOBILE_DATA_STATS = {
  totalBrands: ${Object.keys(completeBrandModels).length},
  totalModels: ${Object.values(completeBrandModels).reduce((sum, models) => sum + models.length, 0)},
  totalSeries: ${Object.values(completeModelSeries).reduce((brandSum, brandData) => 
    brandSum + Object.values(brandData).reduce((modelSum, series) => modelSum + series.length, 0)
  , 0)},
  source: 'sahibinden_data_full.xlsx',
  generatedAt: '${new Date().toISOString()}'
};
`;

// Write the complete data
const outputPath = path.join(__dirname, '..', 'src', 'data', 'automobile-data-complete.ts');
fs.writeFileSync(outputPath, completeTsCode);

console.log(`\n✅ Tam veri dosyası oluşturuldu: ${outputPath}`);

// Show sample of complete data
console.log('\n--- TAM VERİDEN ÖRNEKLER ---');
const sampleCompleteBrands = Object.keys(completeBrandModels).slice(0, 5);
sampleCompleteBrands.forEach(brand => {
  const models = completeBrandModels[brand];
  console.log(`${brand}: ${models.length} model`);
  if (models.length > 0) {
    console.log(`  Örnek: ${models.slice(0, 3).join(', ')}${models.length > 3 ? '...' : ''}`);
  }
});