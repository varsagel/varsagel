
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const filePath = 'c:\\varsagel\\varsagel\\kategoriler\\EMLAK kategori çalışması en son.xlsx';

try {
  if (!fs.existsSync(filePath)) {
    console.error('File not found:', filePath);
    process.exit(1);
  }

  const workbook = XLSX.readFile(filePath);
  console.log('Sheets:', workbook.SheetNames);
  
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
  console.log('--- First 20 Rows ---');
  rows.slice(0, 20).forEach((row, index) => {
    console.log(`Row ${index}:`, JSON.stringify(row));
  });

} catch (error) {
  console.error('Error reading excel file:', error);
}
