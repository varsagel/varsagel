const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Read the Excel file
const excelPath = path.join(__dirname, '..', 'sahibinden_data_full.xlsx');
const workbook = XLSX.readFile(excelPath);
const otomobillerSheet = workbook.Sheets['Otomobiller'];
const data = XLSX.utils.sheet_to_json(otomobillerSheet);

console.log(`Excel'de toplam ${data.length} kayıt var`);

// Process ALL data from Excel (including records with missing model info)
const allBrandModelMap = new Map();
const allModelSeriesMap = new Map();
const brandInfoMap = new Map(); // Track all info for each brand

// Group ALL data from Excel
for (const row of data) {
  const marka = row['Marka']?.toString().trim();
  const model = row['Model']?.toString().trim();
  const seri = row['Seri']?.toString().trim();
  
  if (!marka) continue; // Skip if no brand
  
  // Track brand info
  if (!brandInfoMap.has(marka)) {
    brandInfoMap.set(marka, {
      totalRecords: 0,
      models: new Set(),
      series: new Set(),
      motorPakets: new Set(),
      hasValidModels: false
    });
  }
  
  const brandInfo = brandInfoMap.get(marka);
  brandInfo.totalRecords++;
  
  if (model) {
    brandInfo.models.add(model);
    brandInfo.hasValidModels = true;
    
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
      brandInfo.series.add(seri);
    }
  }
  
  if (row['Motor/Paket']) {
    brandInfo.motorPakets.add(row['Motor/Paket'].toString().trim());
  }
}

console.log(`\n--- TÜM MARKALAR (${brandInfoMap.size}) ---`);

// Separate brands with and without models
const brandsWithModels = [];
const brandsWithoutModels = [];

for (const [brand, info] of brandInfoMap) {
  if (info.hasValidModels) {
    brandsWithModels.push({
      brand,
      modelCount: info.models.size,
      seriesCount: info.series.size,
      records: info.totalRecords
    });
  } else {
    brandsWithoutModels.push({
      brand,
      records: info.totalRecords,
      motorPakets: Array.from(info.motorPakets).slice(0, 3)
    });
  }
}

console.log(`\nModelli markalar (${brandsWithModels.length}):`);
brandsWithModels.sort((a, b) => a.brand.localeCompare(b.brand, 'tr')).forEach(item => {
  console.log(`  ${item.brand}: ${item.modelCount} model, ${item.seriesCount} seri, ${item.records} kayıt`);
});

console.log(`\nModelsiz markalar (${brandsWithoutModels.length}):`);
brandsWithoutModels.sort((a, b) => a.brand.localeCompare(b.brand, 'tr')).forEach(item => {
  console.log(`  ${item.brand}: ${item.records} kayıt${item.motorPakets.length > 0 ? ` (Örnek: ${item.motorPakets.join(', ')})` : ''}`);
});

// Create complete data structures
const completeBrandModels = {};
const completeModelSeries = {};

// Add brands with models
for (const [brand, modelsSet] of allBrandModelMap) {
  completeBrandModels[brand] = Array.from(modelsSet).sort((a, b) => 
    a.localeCompare(b, 'tr')
  );
}

// Add brands without models (use placeholder or derive from other data)
brandsWithoutModels.forEach(item => {
  // For brands without models, we can:
  // 1. Skip them (current approach)
  // 2. Add a placeholder model
  // 3. Try to derive model from Motor/Paket or Seri info
  
  // Option 1: Skip (maintain current behavior)
  // Don't add to brand models
  
  // Option 2: Add placeholder
  // completeBrandModels[item.brand] = ['Standart Model'];
  
  // Option 3: Try to derive from available data
  if (item.motorPakets.length > 0) {
    // If we have motor/paket info, we could use that as model hint
    console.log(`  ${item.brand} için model bilgisi çıkarılamadı`);
  }
});

// Process model series
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

console.log(`\n--- SONUÇ ---`);
console.log(`Toplam marka (modelli): ${Object.keys(completeBrandModels).length}`);
console.log(`Toplam model: ${Object.values(completeBrandModels).reduce((sum, models) => sum + models.length, 0)}`);
console.log(`Toplam seri: ${Object.values(completeModelSeries).reduce((brandSum, brandData) => 
  brandSum + Object.values(brandData).reduce((modelSum, series) => modelSum + series.length, 0)
, 0)}`);

// Generate complete TypeScript code with ALL Excel data
const completeTsCode = `// COMPLETE automobile data from sahibinden_data_full.xlsx
// Generated on ${new Date().toISOString()}
// Total Excel records: ${data.length}
// Valid records: ${data.filter(row => row['Marka'] && row['Model']).length}
// Brands with models: ${brandsWithModels.length}
// Brands without models: ${brandsWithoutModels.length}
// This file contains ALL meaningful data from the Excel file

export const AUTOMOBILE_BRAND_MODELS = ${JSON.stringify(completeBrandModels, null, 2)};

export const AUTOMOBILE_MODEL_SERIES = ${JSON.stringify(completeModelSeries, null, 2)};

// Statistics
export const AUTOMOBILE_DATA_STATS = {
  totalBrands: ${Object.keys(completeBrandModels).length},
  totalModels: ${Object.values(completeBrandModels).reduce((sum, models) => sum + models.length, 0)},
  totalSeries: ${Object.values(completeModelSeries).reduce((brandSum, brandData) => 
    brandSum + Object.values(brandData).reduce((modelSum, series) => modelSum + series.length, 0)
  , 0)},
  totalExcelRecords: ${data.length},
  validRecords: ${data.filter(row => row['Marka'] && row['Model']).length},
  brandsWithModels: ${brandsWithModels.length},
  brandsWithoutModels: ${brandsWithoutModels.length},
  source: 'sahabinden_data_full.xlsx',
  generatedAt: '${new Date().toISOString()}',
  note: 'This includes all brands that have valid model data from the Excel file'
};

// List of brands that exist in Excel but have no model data
export const BRANDS_WITHOUT_MODELS = ${JSON.stringify(brandsWithoutModels.map(item => item.brand).sort(), null, 2)};
`;

// Write the complete data
const outputPath = path.join(__dirname, '..', 'src', 'data', 'automobile-data-complete.ts');
fs.writeFileSync(outputPath, completeTsCode);

console.log(`\n✅ TAM VERİ dosyası oluşturuldu: ${outputPath}`);

// Also update the main automobile-data.ts file
const mainDataPath = path.join(__dirname, '..', 'src', 'data', 'automobile-data.ts');
fs.writeFileSync(mainDataPath, completeTsCode);

console.log(`✅ Ana veri dosyası da güncellendi: ${mainDataPath}`);

// Show what was added
console.log(`\n--- EKLENEN VERİ ---`);
console.log(`Modelli markalar: ${brandsWithModels.length}`);
console.log(`Modelsiz markalar (eklenmedi): ${brandsWithoutModels.length}`);
console.log(`Toplam işlenen kayıt: ${data.filter(row => row['Marka'] && row['Model']).length}`);

// Show brands without models
if (brandsWithoutModels.length > 0) {
  console.log(`\nModelsiz markalar (bu markalar filtrede görünmeyecek):`);
  brandsWithoutModels.forEach(item => {
    console.log(`  - ${item.brand}: ${item.records} kayıt`);
  });
}