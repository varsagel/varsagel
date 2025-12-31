const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Read the Excel file
const excelPath = path.join(__dirname, '..', 'sahibinden_data_full.xlsx');
const workbook = XLSX.readFile(excelPath);
const otomobillerSheet = workbook.Sheets['Otomobiller'];
const data = XLSX.utils.sheet_to_json(otomobillerSheet);

console.log(`Excel'de toplam ${data.length} kayıt var`);

// Read current automobile data
const currentDataPath = path.join(__dirname, '..', 'src', 'data', 'automobile-data.ts');
const currentDataContent = fs.readFileSync(currentDataPath, 'utf8');

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

// Create detailed comparison
console.log('\n--- DETAYLI KARŞILAŞTIRMA ---');

// Group Excel data by brand/model/series
const excelData = {};
data.forEach(row => {
  const marka = row['Marka']?.toString().trim();
  const model = row['Model']?.toString().trim();
  const seri = row['Seri']?.toString().trim();
  
  if (!marka || !model) return;
  
  if (!excelData[marka]) excelData[marka] = {};
  if (!excelData[marka][model]) excelData[marka][model] = new Set();
  
  if (seri) {
    excelData[marka][model].add(seri);
  }
});

// Compare each brand/model/series
let missingCount = 0;
let extraCount = 0;

console.log('\nMarka bazlı karşılaştırma:');
Object.keys(excelData).sort().forEach(brand => {
  const excelModels = Object.keys(excelData[brand]);
  const currentModels = currentBrandModels[brand] || [];
  
  console.log(`\n${brand}:`);
  console.log(`  Excel: ${excelModels.length} model`);
  console.log(`  Mevcut: ${currentModels.length} model`);
  
  // Find missing models
  const missingModels = excelModels.filter(model => !currentModels.includes(model));
  if (missingModels.length > 0) {
    console.log(`  Eksik modeller: ${missingModels.join(', ')}`);
    missingCount += missingModels.length;
  }
  
  // Find extra models (in current but not in Excel)
  const extraModels = currentModels.filter(model => !excelModels.includes(model));
  if (extraModels.length > 0) {
    console.log(`  Fazla modeller: ${extraModels.join(', ')}`);
    extraCount += extraModels.length;
  }
  
  // Check series for each model
  excelModels.forEach(model => {
    const excelSeries = Array.from(excelData[brand][model]);
    const currentSeries = currentModelSeries[brand]?.[model] || [];
    
    if (excelSeries.length !== currentSeries.length) {
      console.log(`    ${model}: Excel'de ${excelSeries.length} seri, mevcutta ${currentSeries.length} seri`);
    }
  });
});

console.log(`\n--- ÖZET ---`);
console.log(`Toplam eksik model: ${missingCount}`);
console.log(`Toplam fazla model: ${extraCount}`);

// Show some sample data that might be missing
console.log('\n--- EXCEL VERİ ÖRNEKLERİ ---');
console.log('İlk 10 kayıt:');
data.slice(0, 10).forEach((row, index) => {
  console.log(`${index + 1}. ${row['Marka']} - ${row['Model']} - ${row['Seri'] || 'Yok'} - ${row['Motor/Paket'] || 'Yok'}`);
});

// Check if there are any brands in Excel that are not in current data
const excelBrands = Object.keys(excelData).sort();
const currentBrands = Object.keys(currentBrandModels).sort();
const missingBrands = excelBrands.filter(brand => !currentBrands.includes(brand));

if (missingBrands.length > 0) {
  console.log(`\nEksik markalar: ${missingBrands.join(', ')}`);
}

// Check for data quality issues
console.log('\n--- VERİ KALİTESİ KONTROLÜ ---');
let emptyMarka = 0;
let emptyModel = 0;
data.forEach(row => {
  if (!row['Marka'] || row['Marka'].toString().trim() === '') emptyMarka++;
  if (!row['Model'] || row['Model'].toString().trim() === '') emptyModel++;
});

console.log(`Boş marka: ${emptyMarka}`);
console.log(`Boş model: ${emptyModel}`);

// Create a complete report
const report = {
  totalExcelRecords: data.length,
  totalExcelBrands: Object.keys(excelData).length,
  totalCurrentBrands: currentBrands.length,
  missingBrands: missingBrands,
  missingModels: missingCount,
  extraModels: extraCount,
  emptyFields: {
    marka: emptyMarka,
    model: emptyModel
  }
};

fs.writeFileSync('automobile-data-comparison-report.json', JSON.stringify(report, null, 2));
console.log('\n📊 Detaylı rapor kaydedildi: automobile-data-comparison-report.json');