const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

const filePath = path.join(__dirname, '../kategoriler/VASITA KATEGORİ ÇALIŞMASI.xlsx');

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
console.log('Row 2:', rows[1]);
console.log('Row 3:', rows[2]);
console.log('Row 4:', rows[3]);

// Check KARAVAN structure
console.log('\n--- KARAVAN Analysis ---');
let karavanRows = rows.filter(r => r[1] === 'KARAVAN');
console.log(`Total KARAVAN rows: ${karavanRows.length}`);

if (karavanRows.length > 0) {
    // Print rows 20-40 to see other attributes
    console.log('\n--- KARAVAN Rows 20-40 ---');
    for (let i = 20; i < Math.min(40, karavanRows.length); i++) {
        console.log(`KARAVAN Row ${i}:`, JSON.stringify(karavanRows[i]));
    }

    // Count values for each attribute
    console.log('\n--- Attribute Value Counts for KARAVAN ---');
    let attrCounts = {};
    
    karavanRows.forEach(row => {
        // Check Col 4 for attribute name
        let attrName = row[4];
        if (attrName && typeof attrName === 'string') {
            if (!attrCounts[attrName]) {
                attrCounts[attrName] = { count: 0, examples: [] };
            }
            // Check if there is a value in Col 5
            if (row[5]) {
                attrCounts[attrName].count++;
                if (attrCounts[attrName].examples.length < 3) {
                    attrCounts[attrName].examples.push(row[5]);
                }
            }
        }
    });

    for (const [attr, data] of Object.entries(attrCounts)) {
        console.log(`Attribute: "${attr}" - Values: ${data.count}, Examples: ${JSON.stringify(data.examples)}`);
    }
}



