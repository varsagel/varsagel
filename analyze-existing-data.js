const XLSX = require('xlsx');
const fs = require('fs');

// Load the existing Excel file
const workbook = XLSX.readFile('sahibinden_filters_homepage.xlsx');
const filtersSheet = workbook.Sheets['Filters'];
const filters = XLSX.utils.sheet_to_json(filtersSheet);

console.log(`Current Excel file contains ${filters.length} filters`);

// Load progress file
const progress = JSON.parse(fs.readFileSync('sahibinden_progress_homepage.json', 'utf8'));

console.log(`Progress shows ${progress.totalFilters} total filters`);
console.log(`Categories processed: ${progress.completedCategories.length}`);

// Analyze the data we have
const categories = {};
const subcategories = {};

filters.forEach(filter => {
    const mainCat = filter['Main Category'];
    const subCat = filter['Sub Category'];
    
    if (!categories[mainCat]) {
        categories[mainCat] = 0;
    }
    categories[mainCat]++;
    
    if (!subcategories[mainCat]) {
        subcategories[mainCat] = new Set();
    }
    subcategories[mainCat].add(subCat);
});

console.log('\n📊 CURRENT DATA ANALYSIS:');
console.log('==========================');

Object.entries(categories).forEach(([category, count]) => {
    const subCount = subcategories[category].size;
    console.log(`${category}: ${count} filters across ${subCount} subcategories`);
});

// Check what categories might be missing
const expectedMainCategories = [
    'Emlak', 'Vasıta', 'İkinci El ve Sıfır Alışveriş', 'İş Makineleri & Sanayi', 
    'Özel Ders Verenler', 'İş İlanları', 'Hayvanlar Alemi'
];

console.log('\n🔍 MISSING CATEGORIES ANALYSIS:');
console.log('=================================');

expectedMainCategories.forEach(cat => {
    if (!categories[cat]) {
        console.log(`❌ ${cat}: No data found`);
    } else {
        console.log(`✅ ${cat}: ${categories[cat]} filters`);
    }
});

// Create a comprehensive report
const report = {
    totalFilters: filters.length,
    totalCategories: Object.keys(categories).length,
    categories: Object.entries(categories).map(([name, count]) => ({
        name,
        filterCount: count,
        subcategoryCount: subcategories[name].size,
        subcategories: Array.from(subcategories[name]).slice(0, 5) // First 5 subcategories
    }))
};

console.log('\n📋 COMPREHENSIVE REPORT:');
console.log('========================');
console.log(`Total Filters: ${report.totalFilters}`);
console.log(`Total Main Categories: ${report.totalCategories}`);

report.categories.forEach(cat => {
    console.log(`\n${cat.name}:`);
    console.log(`  Filters: ${cat.filterCount}`);
    console.log(`  Subcategories: ${cat.subcategoryCount}`);
    if (cat.subcategories.length > 0) {
        console.log(`  Sample subcategories: ${cat.subcategories.join(', ')}${cat.subcategoryCount > 5 ? '...' : ''}`);
    }
});