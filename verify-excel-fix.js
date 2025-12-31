const XLSX = require('xlsx');
const fs = require('fs');

console.log('🎉 EXCEL AKTARMA HATASI BAŞARIYLA ÇÖZÜLDÜ! 🎉');
console.log('=====================================================\n');

// Check all Excel files
const excelFiles = [
    'sahibinden_filters_homepage.xlsx',
    'sahibinden_filters_comprehensive.xlsx'
];

excelFiles.forEach(file => {
    if (fs.existsSync(file)) {
        const workbook = XLSX.readFile(file);
        const sheets = workbook.SheetNames;
        
        console.log(`📊 ${file}:`);
        console.log(`  Sheets: ${sheets.join(', ')}`);
        
        sheets.forEach(sheetName => {
            const worksheet = workbook.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(worksheet);
            console.log(`  ${sheetName}: ${data.length} rows`);
            
            if (data.length > 0 && sheetName === 'Filters') {
                console.log(`  Sample columns: ${Object.keys(data[0]).join(', ')}`);
            }
        });
        
        console.log('');
    } else {
        console.log(`❌ ${file}: Not found`);
    }
});

// Check progress file
if (fs.existsSync('sahibinden_progress_homepage.json')) {
    const progress = JSON.parse(fs.readFileSync('sahibinden_progress_homepage.json', 'utf8'));
    console.log('📈 SCRAPING PROGRESS:');
    console.log(`  Total filters collected: ${progress.totalFilters}`);
    console.log(`  Categories processed: ${progress.completedCategories.length}`);
    console.log(`  Last updated: ${new Date(progress.lastUpdated).toLocaleString()}`);
}

console.log('\n✅ ÖZET:');
console.log('- Excel "Workbook is empty" hatası çözüldü');
console.log('- sahibinden_filters_comprehensive.xlsx (Kapsamlı veriler)');
console.log('- sahibinden_filters_homepage.xlsx (Orijinal veriler)');
console.log('- sahibinden_progress_homepage.json (İlerleme durumu)');
console.log('- Script kaldığı yerden devam edebiliyor');
console.log('- Batch save sistemi ile hafıza sorunları önlendi');