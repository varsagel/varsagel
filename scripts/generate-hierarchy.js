
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const EXCEL_PATH = path.join('c:\\varsagel\\varsagel\\kategoriler\\VASITA KATEGORİ ÇALIŞMASI.xlsx');
const OUTPUT_PATH = path.join(__dirname, '../src/data/vehicle-hierarchy.json');

function generateHierarchy() {
  console.log('Reading Excel file...');
  
  try {
    const workbook = XLSX.readFile(EXCEL_PATH);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    console.log(`Found ${rows.length} rows`);
    console.log('Sheet Names:', workbook.SheetNames);
    
    // Scan column 2 (index 1) for categories
    const categories = new Set();
    rows.forEach((row, i) => {
        if (row && row[1]) {
            categories.add(row[1]);
        }
    });
    console.log('Categories found in Col 2:', Array.from(categories));

    const hierarchy = {};
    
    // Find header row index
    let headerRowIndex = -1;
    let colMap = {};
    
    for (let i = 0; i < Math.min(rows.length, 10); i++) {
        const row = rows[i];
        if (row.includes('MARKA') || row.includes('Marka')) {
            headerRowIndex = i;
            row.forEach((cell, idx) => {
                if (typeof cell === 'string') {
                    const upper = cell.trim().toUpperCase();
                    if (upper === 'MARKA') colMap.brand = idx;
                    else if (upper === 'MODEL') colMap.model = idx;
                    else if (upper === 'SERİ' || upper === 'SERI') colMap.series = idx;
                    else if (upper === 'PAKET') colMap.trim = idx;
                }
            });
            break;
        }
    }
    
    if (headerRowIndex === -1) {
        console.error('Could not find header row with MARKA');
        return;
    }
    
    console.log('Header found at index:', headerRowIndex);
    console.log('Column mapping:', colMap);

    // Process data starting from next row
    for (let i = headerRowIndex + 1; i < rows.length; i++) {
      const row = rows[i];
      const brand = row[colMap.brand]?.toString().trim();
      const model = row[colMap.model]?.toString().trim();
      const series = row[colMap.series]?.toString().trim();
      const trim = row[colMap.trim]?.toString().trim();

      if (!brand) continue;

      if (!hierarchy[brand]) {
        hierarchy[brand] = {};
      }

      if (model) {
        if (!hierarchy[brand][model]) {
          hierarchy[brand][model] = {};
        }

        if (series) {
          if (!hierarchy[brand][model][series]) {
            hierarchy[brand][model][series] = [];
          }

          if (trim && !hierarchy[brand][model][series].includes(trim)) {
            hierarchy[brand][model][series].push(trim);
          }
        }
      }
    }

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(hierarchy, null, 2));
    console.log(`Hierarchy generated at ${OUTPUT_PATH}`);
    
    // Log stats
    const brands = Object.keys(hierarchy);
    let models = 0;
    let seriesCount = 0;
    let trims = 0;
    
    brands.forEach(b => {
      const bModels = Object.keys(hierarchy[b]);
      models += bModels.length;
      bModels.forEach(m => {
        const mSeries = Object.keys(hierarchy[b][m]);
        seriesCount += mSeries.length;
        mSeries.forEach(s => {
          trims += hierarchy[b][m][s].length;
        });
      });
    });

    console.log('Stats:');
    console.log(`Brands: ${brands.length}`);
    console.log(`Models: ${models}`);
    console.log(`Series: ${seriesCount}`);
    console.log(`Trims: ${trims}`);

  } catch (error) {
    console.error('Error processing Excel:', error);
  }
}

generateHierarchy();
