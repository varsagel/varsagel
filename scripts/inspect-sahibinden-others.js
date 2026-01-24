const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

const filePath = path.join(__dirname, '../sahibinden_data_others.xlsx');

if (!fs.existsSync(filePath)) {
    console.error('File not found:', filePath);
    process.exit(1);
}

const workbook = xlsx.readFile(filePath);
console.log('Sheet Names:', workbook.SheetNames);

const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });

console.log('Total rows:', rows.length);
console.log('Header row:', rows[0]);
console.log('Row 1:', rows[1]);
console.log('Row 2:', rows[2]);

// Check for Karavan or similar
const karavanData = rows.filter(r => 
    (r[0] && r[0].toLowerCase().includes('karavan')) || 
    (r[1] && r[1].toLowerCase().includes('karavan'))
);

console.log(`\nFound ${karavanData.length} Karavan rows.`);
if (karavanData.length > 0) {
    console.log('First Karavan Row:', karavanData[0]);
}

// Also check MOTOSİKLET
const motoData = rows.filter(r => 
    (r[0] && r[0].toLowerCase().includes('motosiklet'))
);
console.log(`Found ${motoData.length} Motosiklet rows.`);
