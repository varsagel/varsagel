
const XLSX = require('xlsx');
const filePath = 'c:\\varsagel\\varsagel\\kategoriler\\VASITA KATEGORİ ÇALIŞMASI.xlsx';

try {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, range: 0, defval: null });

  console.log('Total rows:', rows.length);

  // Find where "MARKA" and "MODEL" appear
  let brandRowIndex = -1;
  let modelRowIndex = -1;
  let brands = [];
  let models = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row) continue;

    // Check for "MARKA"
    if (row.includes('MARKA')) {
        console.log(`Found MARKA at row ${i}:`, row);
        // Look at subsequent rows for brands
        for (let j = i + 1; j < i + 50; j++) {
            if (rows[j] && rows[j][3]) { // Column D seems to be values based on previous inspection
                brands.push(rows[j][3]);
            }
        }
    }

    // Check for "MODEL"
    if (row.includes('MODEL')) {
        console.log(`Found MODEL at row ${i}:`, row);
         // Look at subsequent rows for models
         for (let j = i + 1; j < i + 50; j++) {
            if (rows[j] && rows[j][3]) {
                 models.push(rows[j][3]);
            }
        }
    }
  }

  console.log('Sample Brands:', brands.slice(0, 10));
  console.log('Sample Models:', models.slice(0, 10));

} catch (e) {
  console.error('Error:', e);
}
