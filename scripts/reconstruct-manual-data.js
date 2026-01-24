
const fs = require('fs');
const path = require('path');

const HIERARCHY_PATH = path.join(__dirname, '../src/data/vehicle-hierarchy.json');
const OUTPUT_PATH = path.join(__dirname, 'data/manual-vehicle-data.js');

const common_attributes = {
    years: Array.from({length: 45}, (_, i) => (2025 - i).toString()),
    km: ["0-5000", "5000-10000", "10000-20000", "20000-50000", "50000+", "100000+", "200000+"],
    colors: ["Beyaz", "Siyah", "Gri", "Gümüş Gri", "Kırmızı", "Mavi", "Lacivert", "Yeşil", "Sarı", "Turuncu", "Kahverengi", "Bej", "Bordo", "Mor", "Pembe", "Turkuaz", "Şampanya"],
    fuels: ["Benzin", "Dizel", "LPG & Benzin", "Elektrik", "Hibrit"],
    gears: ["Manuel", "Otomatik", "Yarı Otomatik"],
    engine_powers: ["50 HP'ye kadar", "51-75 HP", "76-100 HP", "101-125 HP", "126-150 HP", "151-175 HP", "176-200 HP", "201-225 HP", "226-250 HP", "251-275 HP", "276-300 HP", "301 HP ve üzeri"],
    engine_volumes: ["1.2 lt'ye kadar", "1.3 - 1.6 lt", "1.7 - 2.0 lt", "2.0 lt ve üzeri", "Elektrikli"],
    exchange: ["Takaslı", "Takassız"],
    conditions: ["İkinci El", "Sıfır", "Hasarlı", "Klasik"]
};

// Map hierarchy keys to manual data keys if needed (usually same)
const CATEGORY_MAP = {
    'otomobil': 'otomobil',
    'suv': 'suv',
    'motosiklet': 'motosiklet', // Will be overwritten by update script
    'minivan': 'minivan',
    'ticari': 'ticari',
    'kiralik': 'kiralik',
    'karavan': 'karavan',
    'deniz': 'deniz',
    'hava': 'hava',
    'atv': 'atv',
    'traktor': 'traktor'
};

function reconstruct() {
    console.log('Reading hierarchy...');
    const hierarchy = JSON.parse(fs.readFileSync(HIERARCHY_PATH, 'utf8'));
    
    const manualData = {
        common_attributes
    };

    for (const [hKey, hData] of Object.entries(hierarchy)) {
        // Skip 'others' or unknown keys
        if (!CATEGORY_MAP[hKey] && hKey !== 'others') {
            console.log(`Skipping unknown hierarchy key: ${hKey}`);
            continue;
        }
        
        const manualKey = CATEGORY_MAP[hKey] || hKey;
        
        // Extract brands
        const brands = Object.keys(hData).sort((a,b) => a.localeCompare(b, 'tr'));
        
        // Extract models
        const models = {};
        for (const brand of brands) {
            models[brand] = Object.keys(hData[brand]).sort((a,b) => a.localeCompare(b, 'tr'));
        }
        
        manualData[manualKey] = {
            brands,
            models,
            attributes: {} // Placeholder, can be filled with defaults if needed
        };
    }

    // Ensure motosiklet exists even if hierarchy didn't have it (it should)
    if (!manualData.motosiklet) {
        manualData.motosiklet = { brands: [], models: {}, attributes: {} };
    }

    // Write file
    const fileContent = `
module.exports = ${JSON.stringify(manualData, null, 4)};
`;

    fs.writeFileSync(OUTPUT_PATH, fileContent);
    console.log('Successfully reconstructed manual-vehicle-data.js');
}

reconstruct();
