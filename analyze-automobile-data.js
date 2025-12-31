const XLSX = require('xlsx');

// Read the Excel file
const workbook = XLSX.readFile('sahibinden_data_full.xlsx');

console.log('📊 Excel File Analysis:');
console.log('======================');

// Get sheet names
const sheetNames = workbook.SheetNames;
console.log(`Sheet Names: ${sheetNames.join(', ')}`);

// Analyze each sheet
sheetNames.forEach(sheetName => {
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`\n📋 Sheet: ${sheetName}`);
    console.log(`   Rows: ${data.length}`);
    
    if (data.length > 0) {
        console.log(`   Columns: ${Object.keys(data[0]).join(', ')}`);
        
        // Show first few rows
        console.log('   Sample Data:');
        data.slice(0, 5).forEach((row, index) => {
            console.log(`   Row ${index + 1}:`, JSON.stringify(row, null, 2));
        });
    }
});

// Look for automobile-related data
console.log('\n🔍 Automobile Data Search:');
console.log('============================');

sheetNames.forEach(sheetName => {
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    // Search for automobile-related terms
    const autoTerms = ['otomobil', 'araba', 'oto', 'marka', 'model', 'seri', 'motor', 'paket', 'donanım'];
    
    const autoData = data.filter(row => {
        return Object.values(row).some(value => 
            value && autoTerms.some(term => 
                String(value).toLowerCase().includes(term)
            )
        );
    });
    
    if (autoData.length > 0) {
        console.log(`\n🚗 Found ${autoData.length} automobile-related rows in ${sheetName}:`);
        autoData.slice(0, 3).forEach((row, index) => {
            console.log(`   Auto Row ${index + 1}:`, JSON.stringify(row, null, 2));
        });
    }
});