const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Read the Excel file
const excelPath = path.join(__dirname, '..', 'sahibinden_data_full.xlsx');
const workbook = XLSX.readFile(excelPath);
const otomobillerSheet = workbook.Sheets['Otomobiller'];
// Use header:1 to get array of arrays, easier to inspect if headers are tricky
// But sheet_to_json with default is safer if headers are standard.
// Let's rely on standard sheet_to_json but handle column names carefully.
const data = XLSX.utils.sheet_to_json(otomobillerSheet);

console.log(`Excel'de toplam ${data.length} kayıt var`);

// Data structures
const brandModels = new Map();
const modelSeries = new Map();
const seriesTrims = new Map();
const trimEquipments = new Map(); // New: Donanım

// Reporting
const report = {
  totalRecords: data.length,
  processedRecords: 0,
  skippedRecords: 0,
  missingData: {
    brand: [],
    model: [],
    series: [],
    trim: [],
    equipment: []
  },
  stats: {
    brands: 0,
    models: 0,
    series: 0,
    trims: 0,
    equipments: 0
  }
};

// Process data
data.forEach((row, index) => {
  const rowNum = index + 2; // Excel row number (1-based, +header)
  
  let marka = row['Marka']?.toString().trim();
  let model = row['Model']?.toString().trim();
  let seri = row['Seri']?.toString().trim();
  let motorPaket = row['Motor/Paket']?.toString().trim(); 
  let donanim = row['Donanım']?.toString().trim();

  // Deduplication Logic: Clean repetitive data to support dynamic hierarchy depth
  // If a child level has the same name as parent, it implies artificial hierarchy extension in Excel.
  // We remove it to allow the hierarchy to end naturally at the parent level.
  if (seri && (seri === model || seri === marka)) seri = null;
  if (motorPaket && (motorPaket === seri || motorPaket === model)) motorPaket = null;
  if (donanim && (donanim === motorPaket || donanim === seri)) donanim = null;

  // Validation
  if (!marka) {
    report.missingData.brand.push({ row: rowNum, data: row });
    report.skippedRecords++;
    return;
  }
  
  if (!model) {
    report.missingData.model.push({ row: rowNum, brand: marka, data: row });
    if (!brandModels.has(marka)) brandModels.set(marka, new Set());
    report.skippedRecords++;
    return;
  }

  // 1. Add Brand -> Model
  if (!brandModels.has(marka)) brandModels.set(marka, new Set());
  brandModels.get(marka).add(model);
  
  // 2. Add Model -> Series
  if (!modelSeries.has(marka)) modelSeries.set(marka, new Map());
  if (!modelSeries.get(marka).has(model)) modelSeries.get(marka).set(model, new Set());
  
  if (seri) {
    modelSeries.get(marka).get(model).add(seri);
    
    // 3. Add Series -> Trims (Motor/Paket)
    if (!seriesTrims.has(marka)) seriesTrims.set(marka, new Map());
    if (!seriesTrims.get(marka).has(model)) seriesTrims.get(marka).set(model, new Map());
    if (!seriesTrims.get(marka).get(model).has(seri)) seriesTrims.get(marka).get(model).set(seri, new Set());
    
    if (motorPaket) {
      seriesTrims.get(marka).get(model).get(seri).add(motorPaket);

      // 4. Add Trim -> Equipment (Donanım)
      if (donanim) {
        if (!trimEquipments.has(marka)) trimEquipments.set(marka, new Map());
        if (!trimEquipments.get(marka).has(model)) trimEquipments.get(marka).set(model, new Map());
        if (!trimEquipments.get(marka).get(model).has(seri)) trimEquipments.get(marka).get(model).set(seri, new Map());
        if (!trimEquipments.get(marka).get(model).get(seri).has(motorPaket)) trimEquipments.get(marka).get(model).get(seri).set(motorPaket, new Set());

        trimEquipments.get(marka).get(model).get(seri).get(motorPaket).add(donanim);
      } else {
        // Optional: report missing equipment if needed, but often equipment is optional or empty
        // report.missingData.equipment.push({ row: rowNum, brand: marka, model: model, series: seri, trim: motorPaket });
      }

    } else {
      report.missingData.trim.push({ row: rowNum, brand: marka, model: model, series: seri });
    }
  } else {
    report.missingData.series.push({ row: rowNum, brand: marka, model: model });
  }
  
  report.processedRecords++;
});

// Convert Maps to Objects for JSON/TS output
const outBrandModels = {};
const outModelSeries = {};
const outSeriesTrims = {};
const outTrimEquipments = {};

// Sort options for consistent output
const sortFn = (a, b) => a.localeCompare(b, 'tr');

// 1. Brand Models
[...brandModels.keys()].sort(sortFn).forEach(brand => {
  outBrandModels[brand] = [...brandModels.get(brand)].sort(sortFn);
});

// 2. Model Series
[...modelSeries.keys()].sort(sortFn).forEach(brand => {
  outModelSeries[brand] = {};
  const brandModelsMap = modelSeries.get(brand);
  
  [...brandModelsMap.keys()].sort(sortFn).forEach(model => {
    const seriesSet = brandModelsMap.get(model);
    if (seriesSet.size > 0) {
      outModelSeries[brand][model] = [...seriesSet].sort(sortFn);
    }
  });
});

// 3. Series Trims
[...seriesTrims.keys()].sort(sortFn).forEach(brand => {
  outSeriesTrims[brand] = {};
  const brandModelsMap = seriesTrims.get(brand);
  
  [...brandModelsMap.keys()].sort(sortFn).forEach(model => {
    outSeriesTrims[brand][model] = {};
    const modelSeriesMap = brandModelsMap.get(model);
    
    [...modelSeriesMap.keys()].sort(sortFn).forEach(series => {
      const trimsSet = modelSeriesMap.get(series);
      if (trimsSet.size > 0) {
        outSeriesTrims[brand][model][series] = [...trimsSet].sort(sortFn);
      }
    });
  });
});

// 4. Trim Equipments
[...trimEquipments.keys()].sort(sortFn).forEach(brand => {
  outTrimEquipments[brand] = {};
  const brandModelsMap = trimEquipments.get(brand);
  
  [...brandModelsMap.keys()].sort(sortFn).forEach(model => {
    outTrimEquipments[brand][model] = {};
    const modelSeriesMap = brandModelsMap.get(model);
    
    [...modelSeriesMap.keys()].sort(sortFn).forEach(series => {
      outTrimEquipments[brand][model][series] = {};
      const seriesTrimsMap = modelSeriesMap.get(series);

      [...seriesTrimsMap.keys()].sort(sortFn).forEach(trim => {
        const equipmentsSet = seriesTrimsMap.get(trim);
        if (equipmentsSet.size > 0) {
          outTrimEquipments[brand][model][series][trim] = [...equipmentsSet].sort(sortFn);
        }
      });
    });
  });
});

// Update stats
report.stats.brands = Object.keys(outBrandModels).length;
report.stats.models = Object.values(outBrandModels).reduce((sum, models) => sum + models.length, 0);
report.stats.series = Object.values(outModelSeries).reduce((sum, brandData) => 
  sum + Object.values(brandData).reduce((s, series) => s + series.length, 0), 0);
report.stats.trims = Object.values(outSeriesTrims).reduce((sum, brandData) => 
  sum + Object.values(brandData).reduce((s, modelData) => 
    s + Object.values(modelData).reduce((t, trims) => t + trims.length, 0), 0), 0);
report.stats.equipments = Object.values(outTrimEquipments).reduce((sum, brandData) => 
  sum + Object.values(brandData).reduce((s, modelData) => 
    s + Object.values(modelData).reduce((t, seriesData) => 
        t + Object.values(seriesData).reduce((e, equips) => e + equips.length, 0), 0), 0), 0);


// Generate TypeScript Content
const tsContent = `// AUTOMOBILE DATA WITH FULL HIERARCHY
// Generated on ${new Date().toISOString()}
// Source: sahibinden_data_full.xlsx
// Stats: ${report.stats.brands} Brands, ${report.stats.models} Models, ${report.stats.series} Series, ${report.stats.trims} Trims, ${report.stats.equipments} Equipments

export const AUTOMOBILE_BRAND_MODELS = ${JSON.stringify(outBrandModels, null, 2)};

export const AUTOMOBILE_MODEL_SERIES = ${JSON.stringify(outModelSeries, null, 2)};

export const AUTOMOBILE_SERIES_TRIMS = ${JSON.stringify(outSeriesTrims, null, 2)};

export const AUTOMOBILE_TRIM_EQUIPMENTS = ${JSON.stringify(outTrimEquipments, null, 2)};

export const AUTOMOBILE_STATS = ${JSON.stringify(report.stats, null, 2)};
`;

// Save files
const outputPath = path.join(__dirname, '..', 'src', 'data', 'automobile-data.ts');
fs.writeFileSync(outputPath, tsContent);

const reportPath = path.join(__dirname, '..', 'automobile-import-report.json');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

console.log('✅ Veri işleme tamamlandı.');
console.log(`📊 İstatistikler:`);
console.log(`   - Marka: ${report.stats.brands}`);
console.log(`   - Model: ${report.stats.models}`);
console.log(`   - Seri: ${report.stats.series}`);
console.log(`   - Paket (Trim): ${report.stats.trims}`);
console.log(`   - Donanım (Equip): ${report.stats.equipments}`);
console.log(`\n📄 Detaylı rapor: ${reportPath}`);
console.log(`💾 Veri dosyası: ${outputPath}`);
