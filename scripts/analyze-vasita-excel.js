
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const EXCEL_PATH = path.join(__dirname, '../kategoriler/VASITA_FULL_DATA.xlsx');

if (!fs.existsSync(EXCEL_PATH)) {
    console.error(`File not found: ${EXCEL_PATH}`);
    process.exit(1);
}

const wb = XLSX.readFile(EXCEL_PATH);
const summary = {
    totalRows: 0,
    emptyFields: {},
    subcategories: {}
};

wb.SheetNames.forEach(sheetName => {
    if (sheetName === 'Summary') return;
    
    const ws = wb.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
    
    if (data.length === 0) return;
    
    const headers = data[0];
    const rows = data.slice(1);
    
    summary.subcategories[sheetName] = {
        rowCount: rows.length,
        emptyCounts: {}
    };
    
    summary.totalRows += rows.length;
    
    headers.forEach((header, colIndex) => {
        let emptyCount = 0;
        rows.forEach(row => {
            const cell = row[colIndex];
            if (cell === undefined || cell === null || cell === '') {
                emptyCount++;
            }
        });
        
        if (emptyCount > 0) {
            summary.subcategories[sheetName].emptyCounts[header] = emptyCount;
            
            if (!summary.emptyFields[header]) {
                summary.emptyFields[header] = 0;
            }
            summary.emptyFields[header] += emptyCount;
        }
    });
});

console.log('Analysis Complete:');
console.log('Total Rows:', summary.totalRows);
console.log('\n--- Empty Fields Summary (Global) ---');
Object.entries(summary.emptyFields).forEach(([field, count]) => {
    console.log(`${field}: ${count} empty`);
});

console.log('\n--- Details per Subcategory ---');
Object.entries(summary.subcategories).forEach(([name, stats]) => {
    console.log(`\n[${name}] (${stats.rowCount} rows)`);
    if (Object.keys(stats.emptyCounts).length === 0) {
        console.log('  All fields filled!');
    } else {
        Object.entries(stats.emptyCounts).forEach(([field, count]) => {
            console.log(`  - ${field}: ${count} empty`);
        });
    }
});
