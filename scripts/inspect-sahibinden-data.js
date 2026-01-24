const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

const filePath = path.join(__dirname, '../sahibinden_data_full.xlsx');

if (!fs.existsSync(filePath)) {
    console.error('File not found:', filePath);
    process.exit(1);
}

const workbook = xlsx.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });

console.log('Total rows:', rows.length);
console.log('Header row (Row 1):', rows[0]);

// Check unique brands
const brands = new Set();
rows.slice(1).forEach(row => {
    if (row[0]) brands.add(row[0]);
});
console.log('Total Unique Brands:', brands.size);
console.log('Sample Brands:', Array.from(brands).slice(0, 10));

// Check data in others file
const othersPath = path.join(__dirname, '../sahibinden_data_others.xlsx');
if (fs.existsSync(othersPath)) {
    console.log('\n--- Checking sahibinden_data_others.xlsx ---');
    const wbOthers = xlsx.readFile(othersPath);
    const sheetOthers = wbOthers.Sheets[wbOthers.SheetNames[0]];
    const rowsOthers = xlsx.utils.sheet_to_json(sheetOthers, { header: 1 });
    console.log('Total rows in others:', rowsOthers.length);
    console.log('Header:', rowsOthers[0]);
    console.log('First 5 rows:', rowsOthers.slice(0, 5));
}

