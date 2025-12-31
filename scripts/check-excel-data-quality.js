const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Read the Excel file
const excelPath = path.join(__dirname, '..', 'sahibinden_data_full.xlsx');
const workbook = XLSX.readFile(excelPath);
const otomobillerSheet = workbook.Sheets['Otomobiller'];
const data = XLSX.utils.sheet_to_json(otomobillerSheet);

console.log(`Excel'de toplam ${data.length} kayıt var`);

// Find records with missing model information
const missingModelRecords = data.filter(row => !row['Model'] || row['Model'].toString().trim() === '');
console.log(`Model bilgisi eksik kayıt sayısı: ${missingModelRecords.length}`);

if (missingModelRecords.length > 0) {
  console.log('\n--- MODEL BİLGİSİ EKSİK KAYITLAR ---');
  missingModelRecords.forEach((row, index) => {
    console.log(`${index + 1}. Marka: "${row['Marka'] || 'BOŞ'}" | Model: "${row['Model'] || 'BOŞ'}" | Seri: "${row['Seri'] || 'BOŞ'}" | Motor/Paket: "${row['Motor/Paket'] || 'BOŞ'}"`);
  });
}

// Find records with missing brand information
const missingBrandRecords = data.filter(row => !row['Marka'] || row['Marka'].toString().trim() === '');
console.log(`\nMarka bilgisi eksik kayıt sayısı: ${missingBrandRecords.length}`);

// Show all unique brands in Excel
const uniqueBrands = [...new Set(data.map(row => row['Marka']).filter(Boolean))].sort();
console.log(`\n--- EXCEL'DEKİ TÜM MARKALAR (${uniqueBrands.length}) ---`);
uniqueBrands.forEach((brand, index) => {
  const brandRecords = data.filter(row => row['Marka'] === brand);
  const modelCount = new Set(brandRecords.map(row => row['Model']).filter(Boolean)).size;
  console.log(`${index + 1}. ${brand} - ${modelCount} model`);
});

// Check if there are any patterns in missing data
console.log('\n--- EKSİK VERİ ANALİZİ ---');
const recordsWithIssues = data.filter(row => !row['Marka'] || !row['Model']);
if (recordsWithIssues.length > 0) {
  console.log(`Toplam sorunlu kayıt: ${recordsWithIssues.length}`);
  
  // Group by what's missing
  const noBrand = recordsWithIssues.filter(row => !row['Marka']);
  const noModel = recordsWithIssues.filter(row => !row['Model']);
  const noBrandNoModel = recordsWithIssues.filter(row => !row['Marka'] && !row['Model']);
  
  console.log(`Marka eksik: ${noBrand.length}`);
  console.log(`Model eksik: ${noModel.length}`);
  console.log(`Hem marka hem model eksik: ${noBrandNoModel.length}`);
}

// Create a clean dataset (only valid records)
const cleanData = data.filter(row => row['Marka'] && row['Model'] && row['Marka'].toString().trim() !== '' && row['Model'].toString().trim() !== '');
console.log(`\n--- TEMİZ VERİ ---`);
console.log(`Geçerli kayıt sayısı: ${cleanData.length}`);
console.log(`Çıkarılan kayıt sayısı: ${data.length - cleanData.length}`);

// Show statistics for clean data
const cleanBrands = new Set(cleanData.map(row => row['Marka']));
const cleanModels = new Set(cleanData.map(row => `${row['Marka']}|${row['Model']}`));
const cleanSeries = new Set(cleanData.map(row => `${row['Marka']}|${row['Model']}|${row['Seri']}`).filter(item => !item.endsWith('|undefined')));

console.log(`Temiz verideki marka sayısı: ${cleanBrands.size}`);
console.log(`Temiz verideki model sayısı: ${cleanModels.size}`);
console.log(`Temiz verideki seri sayısı: ${cleanSeries.size}`);

// Compare with current integration
console.log('\n--- MEVCUT ENTEGRASYONLA KARŞILAŞTIRMA ---');
const currentDataPath = path.join(__dirname, '..', 'src', 'data', 'automobile-data.ts');
const currentDataContent = fs.readFileSync(currentDataPath, 'utf8');

const brandModelsMatch = currentDataContent.match(/export const AUTOMOBILE_BRAND_MODELS = ({[\s\S]*?});/);
if (brandModelsMatch) {
  try {
    const brandModelsStr = brandModelsMatch[1].replace(/'/g, '"');
    const currentBrandModels = JSON.parse(brandModelsStr);
    
    const currentBrandCount = Object.keys(currentBrandModels).length;
    const currentModelCount = Object.values(currentBrandModels).reduce((sum, models) => sum + models.length, 0);
    
    console.log(`Mevcut entegrasyondaki marka sayısı: ${currentBrandCount}`);
    console.log(`Mevcut entegrasyondaki model sayısı: ${currentModelCount}`);
    console.log(`Temiz verideki marka sayısı: ${cleanBrands.size}`);
    console.log(`Temiz verideki model sayısı: ${cleanModels.size}`);
    
    if (cleanBrands.size === currentBrandCount && cleanModels.size === currentModelCount) {
      console.log('\n✅ Mevcut entegrasyon temiz veriyle eşleşiyor!');
    } else {
      console.log('\n⚠️ Farklar var. Temiz veri kullanılmalı.');
    }
  } catch (e) {
    console.error('Mevcut veri okunamadı:', e.message);
  }
}