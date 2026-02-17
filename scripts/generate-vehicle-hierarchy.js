const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const manualData = require('./data/manual-vehicle-data.js');

const DATA_FULL_PATH = path.join(__dirname, '../sahibinden_data_full.xlsx');
const DATA_OTHERS_PATH = path.join(__dirname, '../sahibinden_data_others.xlsx');
const OUTPUT_PATH = path.join(__dirname, '../src/data/vehicle-hierarchy.json');
const SATARIZ_CSV = process.argv.includes('--satarizCsv')
    ? path.resolve(process.cwd(), process.argv[process.argv.indexOf('--satarizCsv') + 1] || '')
    : '';
const SATARIZ_DIR = process.argv.includes('--satarizDir')
    ? path.resolve(process.cwd(), process.argv[process.argv.indexOf('--satarizDir') + 1] || '')
    : '';

// Hierarchy Structure:
// {
//   "otomobil": {
//      "Brand": {
//          "Model": {
//              "Seri": ["Paket1", "Paket2"]
//          }
//      }
//   },
//   ...
// }

const hierarchy = {
    otomobil: {},
    suv: {},
    motosiklet: {},
    minivan: {},
    ticari: {},
    karavan: {},
    deniz: {},
    hava: {},
    atv: {},
    traktor: {},
    kiralik: {},
    others: {}
};

function clean(str) {
    return str ? str.toString().trim() : '';
}

function parseCsvLine(line) {
    const res = [];
    let cur = '';
    let inQuote = false;
    for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (c === '"') {
            if (inQuote && line[i + 1] === '"') {
                cur += '"';
                i++;
            } else {
                inQuote = !inQuote;
            }
        } else if (c === ',' && !inQuote) {
            res.push(cur);
            cur = '';
        } else {
            cur += c;
        }
    }
    res.push(cur);
    return res;
}

const TICARI_SUBCATEGORIES = new Set([
    'Minibüs & Midibüs',
    'Otobüs',
    'Kamyon & Kamyonet',
    'Çekici',
    'Dorse',
    'Römork',
    'Karoser & Üst Yapı',
    'Oto Kurtarıcı & Taşıyıcı',
    'Ticari Hat & Ticari Plaka'
]);

function normalizeSatarizRow(subcategory, brand, model, series, paket) {
    const cat = clean(subcategory).toLowerCase();
    const isTicari = cat === 'ticari araçlar' || cat === 'ticari araclar';
    const subcat = clean(brand);
    if (isTicari && TICARI_SUBCATEGORIES.has(subcat)) {
        return {
            subcategory,
            brand: model,
            model: series,
            series: paket,
            paket: ''
        };
    }
    return { subcategory, brand, model, series, paket };
}

function addRow(target, brand, model, series, paket) {
    const finalBrand = clean(brand) || 'Genel';
    const finalModel = clean(model) || 'Genel';
    const seriKey = clean(series) || 'Genel';
    const finalPaket = clean(paket);
    if (!target[finalBrand]) target[finalBrand] = {};
    if (!target[finalBrand][finalModel]) target[finalBrand][finalModel] = {};
    if (!target[finalBrand][finalModel][seriKey]) target[finalBrand][finalModel][seriKey] = [];
    if (finalPaket && !target[finalBrand][finalModel][seriKey].includes(finalPaket)) {
        target[finalBrand][finalModel][seriKey].push(finalPaket);
    }
}

function mapSatarizCategory(label) {
    const v = clean(label).toLowerCase();
    if (v === 'araç' || v === 'arac') return hierarchy.otomobil;
    if (v === 'motosiklet') return hierarchy.motosiklet;
    if (v === 'ticari araçlar' || v === 'ticari araclar') return hierarchy.ticari;
    if (v === 'kiralık araçlar' || v === 'kiralik araclar') return hierarchy.kiralik;
    if (v === 'karavan') return hierarchy.karavan;
    if (v === 'deniz araçları' || v === 'deniz araclari') return hierarchy.deniz;
    if (v === 'hava araçları' || v === 'hava araclari') return hierarchy.hava;
    if (v === 'klasik araçlar' || v === 'klasik araclar') return hierarchy.otomobil;
    if (v === 'hasarlı araçlar' || v === 'hasarli araclar') return hierarchy.others;
    return hierarchy.others;
}

if (SATARIZ_DIR && fs.existsSync(SATARIZ_DIR)) {
    const files = fs.readdirSync(SATARIZ_DIR).filter(f => f.endsWith('.csv') && !f.endsWith('all.csv'));
    files.forEach(file => {
        const raw = fs.readFileSync(path.join(SATARIZ_DIR, file), 'utf-8');
        const lines = raw.split(/\r?\n/).filter(Boolean);
        lines.slice(1).forEach(line => {
            const [subcategory, brand, model, series, paket] = parseCsvLine(line).map(clean);
            const normalized = normalizeSatarizRow(subcategory, brand, model, series, paket);
            const target = mapSatarizCategory(normalized.subcategory);
            addRow(target, normalized.brand, normalized.model, normalized.series, normalized.paket);
        });
    });
} else if (SATARIZ_CSV && fs.existsSync(SATARIZ_CSV)) {
    const raw = fs.readFileSync(SATARIZ_CSV, 'utf-8');
    const lines = raw.split(/\r?\n/).filter(Boolean);
    lines.slice(1).forEach(line => {
        const [subcategory, brand, model, series, paket] = parseCsvLine(line).map(clean);
        const normalized = normalizeSatarizRow(subcategory, brand, model, series, paket);
        const target = mapSatarizCategory(normalized.subcategory);
        addRow(target, normalized.brand, normalized.model, normalized.series, normalized.paket);
    });
} else {
// 1. Process Cars (Full Data)
if (fs.existsSync(DATA_FULL_PATH)) {
    console.log('Processing Cars Data...');
    const wb = XLSX.readFile(DATA_FULL_PATH);
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1 });
    
    rows.slice(1).forEach(row => {
        const marka = clean(row[0]);
        const model = clean(row[1]);
        const seri = clean(row[2]);
        const paket = clean(row[3]); 
        
        if (!marka || !model) return;

        if (!hierarchy.otomobil[marka]) hierarchy.otomobil[marka] = {};
        if (!hierarchy.otomobil[marka][model]) hierarchy.otomobil[marka][model] = {};
        
        const seriKey = seri || 'Genel';
        
        if (!hierarchy.otomobil[marka][model][seriKey]) {
            hierarchy.otomobil[marka][model][seriKey] = [];
        }
        
        if (paket && !hierarchy.otomobil[marka][model][seriKey].includes(paket)) {
            hierarchy.otomobil[marka][model][seriKey].push(paket);
        }
    });
}

// 2. Process Others
if (fs.existsSync(DATA_OTHERS_PATH)) {
    console.log('Processing Others Data...');
    const wb = XLSX.readFile(DATA_OTHERS_PATH);
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1 });
    
    rows.slice(1).forEach(row => {
        const catPath = clean(row[0]); 
        const parts = catPath.split(' > ');
        
        let target = hierarchy.others;
        if (catPath.includes('Otomobil')) target = hierarchy.otomobil;
        else if (catPath.includes('Arazi') || catPath.includes('SUV')) target = hierarchy.suv;
        else if (catPath.includes('Motosiklet')) target = hierarchy.motosiklet;
        else if (catPath.includes('Minivan')) target = hierarchy.minivan;
        else if (catPath.includes('Ticari')) target = hierarchy.ticari;
        else if (catPath.includes('Karavan')) target = hierarchy.karavan;
        else if (catPath.includes('Deniz')) target = hierarchy.deniz;
        else if (catPath.includes('Hava')) target = hierarchy.hava;
        else if (catPath.includes('ATV') || catPath.includes('UTV')) target = hierarchy.atv;
        else if (catPath.includes('Traktör')) target = hierarchy.traktor;
        
        if (parts.length >= 3) {
            const marka = parts[2];
            const model = parts[3] || 'Genel';
            const seri = parts[4] || 'Genel'; 
            
            const excelModel = clean(row[3]);
            const excelSeri = clean(row[4]);
            const excelPaket = clean(row[5]);
            
            const finalMarka = marka; 
            const finalModel = excelModel || model;
            const finalSeri = excelSeri || seri;
            
            if (!target[finalMarka]) target[finalMarka] = {};
            if (!target[finalMarka][finalModel]) target[finalMarka][finalModel] = {};
            
            const seriKey = finalSeri || 'Genel';
            if (!target[finalMarka][finalModel][seriKey]) {
                target[finalMarka][finalModel][seriKey] = [];
            }
            
            if (excelPaket && !target[finalMarka][finalModel][seriKey].includes(excelPaket)) {
                target[finalMarka][finalModel][seriKey].push(excelPaket);
            }
        }
    });
}

// 3. Process Manual Data
console.log('Processing Manual Data...');

const manualMappings = [
    { source: manualData.motosiklet, target: hierarchy.motosiklet },
    { source: manualData.minivan_panelvan, target: hierarchy.minivan },
    { source: manualData.ticari, target: hierarchy.ticari },
    { source: manualData.suv, target: hierarchy.suv },
    { source: manualData.karavan, target: hierarchy.karavan },
    { source: manualData.deniz_araclari, target: hierarchy.deniz },
    { source: manualData.hava_araclari, target: hierarchy.hava },
    { source: manualData.atv_utv, target: hierarchy.atv },
    { source: manualData.traktor, target: hierarchy.traktor }
];

manualMappings.forEach(({ source, target }) => {
    if (source && source.models) {
        // Determine Series and Packages from manual source attributes
        let seriesList = ['Genel'];
        if (source.attributes && source.attributes.seri && source.attributes.seri.length > 0) {
             // If seri is ["-"], treat as ["Genel"] or ["Standart"]. Let's use "Genel" to match existing fallback.
             if (source.attributes.seri.length === 1 && source.attributes.seri[0] === '-') {
                 seriesList = ['Genel'];
             } else {
                 seriesList = source.attributes.seri;
             }
        }

        const packageList = (source.attributes && source.attributes.paket) ? source.attributes.paket : [];

        for (const [brand, models] of Object.entries(source.models)) {
            if (!target[brand]) target[brand] = {};
            
            const modelList = Array.isArray(models) ? models : [];
            for (const model of modelList) {
                if (!target[brand][model]) target[brand][model] = {};
                
                // Populate each series
                for (const s of seriesList) {
                    if (!target[brand][model][s]) {
                        target[brand][model][s] = [];
                    }
                    
                    // Populate packages for this series
                    for (const p of packageList) {
                        if (!target[brand][model][s].includes(p)) {
                            target[brand][model][s].push(p);
                        }
                    }
                }
            }
        }
    }
});

// 4. Populate Kiralik from Otomobil, SUV, Minivan (Real Data)
console.log('Populating Kiralik from Real Data...');
const kiralikSources = [hierarchy.otomobil, hierarchy.suv, hierarchy.minivan];
kiralikSources.forEach(source => {
    for (const brand in source) {
        if (!hierarchy.kiralik[brand]) hierarchy.kiralik[brand] = {};
        for (const model in source[brand]) {
            if (!hierarchy.kiralik[brand][model]) hierarchy.kiralik[brand][model] = {};
            // Deep copy series/packages
            for (const series in source[brand][model]) {
                if (!hierarchy.kiralik[brand][model][series]) {
                     hierarchy.kiralik[brand][model][series] = [...source[brand][model][series]];
                } else {
                     // Merge packages if series exists
                     source[brand][model][series].forEach(p => {
                         if (!hierarchy.kiralik[brand][model][series].includes(p)) {
                             hierarchy.kiralik[brand][model][series].push(p);
                         }
                     });
                }
            }
        }
    }
});
}

const dir = path.dirname(OUTPUT_PATH);
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}

fs.writeFileSync(OUTPUT_PATH, JSON.stringify(hierarchy, null, 2));
console.log(`Hierarchy written to ${OUTPUT_PATH}`);
