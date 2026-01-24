
// Mock hierarchy data verification

const fs = require('fs');
const path = require('path');

const hierarchyPath = path.join(__dirname, '../src/data/vehicle-hierarchy.json');
const hierarchy = JSON.parse(fs.readFileSync(hierarchyPath, 'utf8'));

function getHierarchyKey(categorySlug) {
    if (!categorySlug) return 'others';
    const s = categorySlug.toLowerCase();
    
    if (s.includes('motosiklet')) return 'motosiklet';
    if (s.includes('suv') || s.includes('arazi') || s.includes('pickup')) return 'suv';
    if (s.includes('minivan') || s.includes('panelvan')) return 'minivan';
    if (s.includes('ticari') || s.includes('kamyon') || s.includes('otobus') || s.includes('minibus')) return 'ticari';
    if (s.includes('karavan')) return 'karavan';
    if (s.includes('deniz')) return 'deniz';
    if (s.includes('hava')) return 'hava';
    if (s.includes('atv') || s.includes('utv')) return 'atv';
    if (s.includes('traktor') || s.includes('tarim')) return 'traktor';
    
    if (s.includes('otomobil')) return 'otomobil';
    if (s.includes('kiralik')) return 'kiralik';
    
    if (s.includes('hasarli')) return 'otomobil';
    if (s.includes('klasik')) return 'otomobil';
    if (s.includes('engelli')) return 'otomobil';

    return 'others';
}

const testCases = [
    'vasita/hasarli-araclar-otomobil',
    'vasita/klasik-araclar-klasik-otomobiller',
    'vasita/engelli-plakali-araclar-otomobil',
    'vasita/kiralik-araclar-otomobil',
    'vasita/deniz-araclari-satilik-motoryat',
    'vasita/karavan-motokaravan'
];

console.log('--- Verifying Hierarchy Keys and Data Availability ---');

let allPassed = true;

testCases.forEach(slug => {
    const key = getHierarchyKey(slug);
    const data = hierarchy[key];
    const brandCount = data ? Object.keys(data).length : 0;
    
    console.log(`Slug: ${slug.padEnd(45)} -> Key: ${key.padEnd(12)} -> Brands: ${brandCount}`);
    
    if (brandCount === 0) {
        console.error(`❌ NO DATA for ${slug} (mapped to ${key})`);
        allPassed = false;
    }
});

if (allPassed) {
    console.log('\n✅ All test cases map to valid data keys.');
} else {
    console.error('\n❌ Some test cases failed.');
    process.exit(1);
}
