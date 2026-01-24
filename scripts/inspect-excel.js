const XLSX = require('xlsx');
const path = require('path');

const EXCEL_PATH = path.join(process.cwd(), 'kategoriler', 'EMLAK kategori çalışması en son.xlsx');

function inspect() {
    try {
        const workbook = XLSX.readFile(EXCEL_PATH);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        // Get range
        const range = XLSX.utils.decode_range(sheet['!ref']);
        console.log(`Range: ${sheet['!ref']}`);
        
        // Read headers (first row)
        const headers = [];
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const cell = sheet[XLSX.utils.encode_cell({r: range.s.r, c: C})];
            headers.push(cell ? cell.v : `UNKNOWN_${C}`);
        }
        console.log('Headers:', headers);

        // Read rows 0-5000
    const data = XLSX.utils.sheet_to_json(sheet, {header: 1, range: { s: {r: 0, c: 0}, e: {r: 5000, c: 10} }});
    
    console.log('--- HIERARCHY ANALYSIS (Rows 0-5000) ---');
        const seen = new Set();
        data.forEach((row, index) => {
            const l1 = row[0];
            const l2 = row[1];
            const l3 = row[2];
            const l4 = row[3];
            
            if (index >= 2945 && index <= 2960) {
             const structure = `L2=${l2} | L3=${l3} | L4=${l4} | Col4=${row[4]} | Col5=${row[5]}`;
             console.log(`Row ${index}: ${structure}`);
        }
        });

    } catch (error) {
        console.error('Error reading Excel:', error);
    }
}

inspect();
