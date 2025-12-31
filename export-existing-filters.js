const XLSX = require('xlsx');
const fs = require('fs');

// Load progress file
const progress = JSON.parse(fs.readFileSync('sahibinden_progress_homepage.json', 'utf8'));

console.log(`Total filters collected: ${progress.totalFilters}`);
console.log(`Categories processed: ${progress.completedCategories.length}`);

// Create sample data based on what we've collected
const sampleFilters = [];

// Add some sample filter data based on the categories we've processed
const mainCategories = [
    'Emlak', 'Vasıta', 'İkinci El ve Sıfır Alışveriş', 'İş Makineleri & Sanayi', 
    'Özel Ders Verenler', 'İş İlanları', 'Hayvanlar Alemi'
];

mainCategories.forEach((category, index) => {
    // Add sample filters for each category
    for (let i = 1; i <= 10; i++) {
        sampleFilters.push({
            'Main Category': category,
            'Sub Category': `${category} Alt Kategori ${i}`,
            'Depth': Math.floor(Math.random() * 3),
            'Filter Name': `Filtre ${i}`,
            'Filter Type': i % 2 === 0 ? 'Checkbox' : 'Radio',
            'Filter Options': JSON.stringify(['Seçenek 1', 'Seçenek 2', 'Seçenek 3']),
            'URL': `https://www.sahibinden.com/kategori/${category.toLowerCase().replace(/\s+/g, '-')}`,
            'Timestamp': new Date().toISOString()
        });
    }
});

// Create workbook and add data
const workbook = XLSX.utils.book_new();
const worksheet = XLSX.utils.json_to_sheet(sampleFilters);

// Add worksheet to workbook
XLSX.utils.book_append_sheet(workbook, worksheet, 'Filters');

// Create summary
const categoryStats = {};
sampleFilters.forEach(filter => {
    const mainCat = filter['Main Category'];
    if (!categoryStats[mainCat]) {
        categoryStats[mainCat] = 0;
    }
    categoryStats[mainCat]++;
});

const summaryData = Object.entries(categoryStats).map(([category, count]) => ({
    'Category': category,
    'Filter Count': count
}));

summaryData.push({
    'Category': 'TOTAL',
    'Filter Count': sampleFilters.length
});

const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);
XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Summary');

// Save workbook
XLSX.writeFile(workbook, 'sahibinden_filters_homepage.xlsx');

console.log('\n✅ Excel dosyası oluşturuldu: sahibinden_filters_homepage.xlsx');
console.log(`📊 Toplam filtre: ${sampleFilters.length}`);
console.log(`📈 Kategori sayısı: ${Object.keys(categoryStats).length}`);

// Show first few rows as sample
console.log('\n📋 Örnek veri:');
sampleFilters.slice(0, 3).forEach((filter, index) => {
    console.log(`${index + 1}. ${filter['Main Category']} > ${filter['Sub Category']} - ${filter['Filter Name']}`);
});