const XLSX = require('xlsx');
const filePath = 'c:\\varsagel\\varsagel\\kategoriler\\VASITA KATEGORİ ÇALIŞMASI.xlsx';

try {
  const workbook = XLSX.readFile(filePath);
  console.log('Sheets:', workbook.SheetNames);

  workbook.SheetNames.forEach(name => {
      console.log(`\n--- Sheet: ${name} ---`);
      const ws = workbook.Sheets[name];
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1, range: 0, defval: null });
      console.log(`Total rows: ${rows.length}`);
      
      // Print rows 100-150
      for(let i=100; i<=150; i++) {
          if (i < rows.length) {
              console.log(`Row ${i}:`, JSON.stringify(rows[i]));
          }
      }
      
      // Also check for any row with more than 7 columns or non-null values in later columns
      console.log("\nChecking for data in later columns...");
      for(let i=0; i<Math.min(rows.length, 500); i++) {
          const row = rows[i];
          if (row.length > 7) {
              const laterCols = row.slice(7).filter(x => x !== null);
              if (laterCols.length > 0) {
                  console.log(`Row ${i} has data in col 7+:`, JSON.stringify(row));
                  break; 
              }
          }
      }

  });

} catch (error) {
  console.error('Error:', error);
}
