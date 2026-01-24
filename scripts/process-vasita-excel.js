const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const manualData = require('./data/manual-vehicle-data.js');
console.log('[DEBUG] Manual Data Keys:', Object.keys(manualData));
if (manualData.common_attributes) console.log('[DEBUG] Common Attributes found:', Object.keys(manualData.common_attributes));
else console.log('[DEBUG] Common Attributes NOT found');

const prisma = new PrismaClient();
const VASITA_SLUG = 'vasita';
const EXCEL_PATH = path.join(__dirname, '../kategoriler/VASITA KATEGORİ ÇALIŞMASI.xlsx');
const DATA_FULL_PATH = path.join(__dirname, '../sahibinden_data_full.xlsx');
const DATA_OTHERS_PATH = path.join(__dirname, '../sahibinden_data_others.xlsx');
const OUTPUT_EXCEL_PATH = path.join(__dirname, '../kategoriler/VASITA_FULL_DATA.xlsx');

// ----------------------------------------------------------------------------
// 1. ATTRIBUTE DEFINITIONS
// ----------------------------------------------------------------------------
const ATTRIBUTES = {
  MARKA: { name: 'Marka', slug: 'marka', type: 'select', options: [] },
  MODEL: { name: 'Model', slug: 'model', type: 'select', options: [] },
  SERI: { name: 'Seri', slug: 'seri', type: 'select', options: [] }, // Motor/Seri
  PAKET: { name: 'Paket', slug: 'paket', type: 'select', options: [] }, // Donanım/Paket
  YIL: { name: 'Yıl', slug: 'yil', type: 'range-number', minKey: 'yilMin', maxKey: 'yilMax' }, // Model Yılı
  KM: { name: 'KM', slug: 'km', type: 'range-number', minKey: 'kmMin', maxKey: 'kmMax' },
  RENK: { name: 'Renk', slug: 'renk', type: 'select', options: [] },
  VITES: { name: 'Vites', slug: 'vites', type: 'select', options: ['Manuel', 'Otomatik', 'Yarı Otomatik'] },
  YAKIT: { name: 'Yakıt', slug: 'yakit', type: 'select', options: ['Benzin', 'Dizel', 'LPG & Benzin', 'Elektrik', 'Hibrit'] },
  KASA_TIPI: { name: 'Kasa Tipi', slug: 'kasa-tipi', type: 'select', options: [] },
  MOTOR_GUCU: { name: 'Motor Gücü', slug: 'motor-gucu', type: 'range-number', minKey: 'motorGucuMin', maxKey: 'motorGucuMax' },
  MOTOR_HACMI: { name: 'Motor Hacmi', slug: 'motor-hacmi', type: 'range-number', minKey: 'motorHacmiMin', maxKey: 'motorHacmiMax' },
  CEKIS: { name: 'Çekiş', slug: 'cekis', type: 'select', options: ['Önden Çekiş', 'Arkadan İtiş', '4WD (Sürekli)', 'AWD (Elektronik)'] },
  KAPI: { name: 'Kapı', slug: 'kapi', type: 'select', options: ['2', '3', '4', '5'] },
  GARANTI: { name: 'Garanti', slug: 'garanti', type: 'boolean' },
  HASAR_DURUMU: { name: 'Hasar Durumu', slug: 'hasar-durumu', type: 'select', options: ['Hasarsız', 'Hasarlı', 'Ağır Hasarlı'] }, // Plaka / Uyruk?
  PLAKA_UYRUK: { name: 'Plaka / Uyruk', slug: 'plaka-uyruk', type: 'select', options: ['Türkiye (TR) Plakalı', 'Yabancı Plakalı', 'Mavi Plakalı'] },
  TAKASLI: { name: 'Takaslı', slug: 'takasli', type: 'boolean' },
  DURUMU: { name: 'Durumu', slug: 'durumu', type: 'select', options: ['İkinci El', 'Sıfır'] },
  KIMDEN: { name: 'Kimden', slug: 'kimden', type: 'select', options: ['Sahibinden', 'Galeriden', 'Yetkili Bayiden'] },
  GORUNTULU_ARAMA: { name: 'Görüntülü Arama', slug: 'goruntulu-arama', type: 'boolean' },
  
  // Karavan Attributes
  ARAC_MARKASI: { name: 'Araç Markası', slug: 'arac-markasi', type: 'select', options: [] },
  URETICI_FIRMA: { name: 'Üretici Firma', slug: 'uretici-firma', type: 'select', options: [] },
  YATAK_KAPASITESI: { name: 'Yatak Kapasitesi', slug: 'yatak-kapasitesi', type: 'select', options: [] },
  TIPI: { name: 'Tipi', slug: 'tipi', type: 'select', options: [] },
  AGIRLIK: { name: 'Ağırlık', slug: 'agirlik', type: 'select', options: [] },
  MONOBLOK: { name: 'Monoblok', slug: 'monoblok', type: 'select', options: [] },
  MOVER: { name: 'Mover', slug: 'mover', type: 'select', options: [] },
  KOLTUK_SAYISI: { name: 'Koltuk Sayısı', slug: 'koltuk-sayisi', type: 'select', options: [] },
  MOTOR_SAATI: { name: 'Motor Saati', slug: 'motor-saati', type: 'range-number', minKey: 'motorSaatiMin', maxKey: 'motorSaatiMax' },
  SAAT: { name: 'Saat', slug: 'saat', type: 'range-number', minKey: 'saatMin', maxKey: 'saatMax' },
  CALISMA_SAATI: { name: 'Çalışma Saati', slug: 'calisma-saati', type: 'range-number', minKey: 'calismaSaatiMin', maxKey: 'calismaSaatiMax' },
  GOVDE_MALZEMESI: { name: 'Gövde Malzemesi', slug: 'govde-malzemesi', type: 'select', options: [] },
};

// ----------------------------------------------------------------------------
// 2. AUXILIARY DATA LOADING
// ----------------------------------------------------------------------------
function loadAuxiliaryData() {
    console.log('Loading auxiliary data...');
    const data = {
        cars: { brands: new Set(), models: new Set(), series: new Set(), packages: new Set() },
        suv: { brands: new Set(), models: new Set(), series: new Set(), packages: new Set() },
        motorcycle: { brands: new Set(), models: new Set(), series: new Set(), packages: new Set() },
        others: { brands: new Set(), models: new Set(), series: new Set(), packages: new Set() } // Fallback
    };

    // 1. Load Cars Data (Full)
    if (fs.existsSync(DATA_FULL_PATH)) {
        const wb = XLSX.readFile(DATA_FULL_PATH);
        const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1 });
        // Row: Marka, Model, Seri, Motor/Paket, Donanım
        rows.slice(1).forEach(row => {
            if (row[0]) data.cars.brands.add(row[0].toString().trim());
            if (row[1]) data.cars.models.add(row[1].toString().trim());
            if (row[2]) data.cars.series.add(row[2].toString().trim());
            if (row[3]) data.cars.packages.add(row[3].toString().trim());
            if (row[4]) data.cars.packages.add(row[4].toString().trim()); // Donanım is also package
        });
        console.log(`Loaded ${data.cars.brands.size} brands and ${data.cars.models.size} models for Cars.`);
    }

    // 2. Load Others Data
    if (fs.existsSync(DATA_OTHERS_PATH)) {
        const wb = XLSX.readFile(DATA_OTHERS_PATH);
        const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1 });
        // Header: Kategori, Seviye 1, URL, Seviye 2, Seviye 3, Seviye 4, Seviye 5
        // Kategori: Arazi, SUV & Pickup, Motosiklet, etc.
        rows.slice(1).forEach(row => {
            const cat = row[0] ? row[0].toString().trim() : '';
            let target = data.others;
            if (cat.includes('Arazi') || cat.includes('SUV')) target = data.suv;
            else if (cat.includes('Motosiklet')) target = data.motorcycle;

            // Seviye 1 -> Brand? (Col 1)
            if (row[1]) target.brands.add(row[1].toString().trim());

            // Seviye 2 -> Model (Col 3)
            if (row[3]) target.models.add(row[3].toString().trim());
            // Seviye 3 -> Seri (Col 4)
            if (row[4]) target.series.add(row[4].toString().trim());
            // Seviye 4 -> Paket (Col 5)
            if (row[5]) target.packages.add(row[5].toString().trim());
        });
        console.log(`Loaded ${data.suv.brands.size} brands and ${data.suv.models.size} models for SUV.`);
        console.log(`Loaded ${data.motorcycle.brands.size} brands and ${data.motorcycle.models.size} models for Motorcycle.`);
    }

    return data;
}

const AUX_DATA = loadAuxiliaryData();

// ----------------------------------------------------------------------------
// 3. MAPPING HELPERS
// ----------------------------------------------------------------------------
function mapAttribute(excelName) {
  if (!excelName) return null;
  const upper = excelName.toString().toLocaleUpperCase('tr-TR').trim();
  
  // Skip Category Headers if they appear in attribute column
  if (['VASITA', 'OTOMOBİL', 'ARAZİ', 'SUV', 'MOTOSİKLET'].some(k => upper === k)) return null;

  if (upper === 'MARKA') return ATTRIBUTES.MARKA;
  if (upper === 'MODEL') return ATTRIBUTES.MODEL;
  if (upper.includes('SERİ') || upper.includes('SERI')) return ATTRIBUTES.SERI;
  if (upper.includes('PAKET') || upper.includes('DONANIM')) return ATTRIBUTES.PAKET;
  
  if (upper.includes('YIL') || upper.includes('MODEL YILI')) return ATTRIBUTES.YIL;
  if (upper.includes('KM')) return ATTRIBUTES.KM;
  if (upper.includes('RENK')) return ATTRIBUTES.RENK;
  if (upper.includes('VİTES') || upper.includes('VITES')) return ATTRIBUTES.VITES;
  if (upper.includes('YAKIT')) return ATTRIBUTES.YAKIT;
  if (upper.includes('KASA')) return ATTRIBUTES.KASA_TIPI;
  if (upper.includes('MOTOR GÜCÜ')) return ATTRIBUTES.MOTOR_GUCU;
  if (upper.includes('MOTOR HACMİ')) return ATTRIBUTES.MOTOR_HACMI;
  if (upper.includes('ÇEKİŞ') || upper.includes('CEKIS')) return ATTRIBUTES.CEKIS;
  if (upper.includes('KAPI')) return ATTRIBUTES.KAPI;
  if (upper.includes('GARANTİ')) return ATTRIBUTES.GARANTI;
  if (upper.includes('HASAR')) return ATTRIBUTES.HASAR_DURUMU;
  if (upper.includes('PLAKA') || upper.includes('UYRUK')) return ATTRIBUTES.PLAKA_UYRUK;
  if (upper.includes('TAKAS')) return ATTRIBUTES.TAKASLI;
  if (upper.includes('DURUMU')) return ATTRIBUTES.DURUMU;
  if (upper.includes('KİMDEN') || upper.includes('KIMDEN')) return ATTRIBUTES.KIMDEN;
  if (upper.includes('GÖRÜNTÜLÜ') || upper.includes('GORUNTULU')) return ATTRIBUTES.GORUNTULU_ARAMA;

  // Karavan
  if (upper === 'ARAÇ MARKASI' || upper === 'ARAC MARKASI') return ATTRIBUTES.ARAC_MARKASI;
  if (upper === 'ÜRETİCİ FİRMA' || upper === 'URETICI FIRMA') return ATTRIBUTES.URETICI_FIRMA;
  if (upper.includes('YATAK KAPASİTESİ') || upper.includes('YATAK KAPASITESI')) return ATTRIBUTES.YATAK_KAPASITESI;
  if (upper === 'TİPİ' || upper === 'TIPI') return ATTRIBUTES.TIPI;
  if (upper === 'AĞIRLIK' || upper === 'AGIRLIK') return ATTRIBUTES.AGIRLIK;
  if (upper === 'MONOBLOK') return ATTRIBUTES.MONOBLOK;
  if (upper === 'MOVER') return ATTRIBUTES.MOVER;
  if (upper.includes('KOLTUK SAYISI') || upper.includes('KOLTUK SAYISI')) return ATTRIBUTES.KOLTUK_SAYISI;

  // Fallback - DISABLE to avoid picking up values as attributes
  // console.log(`Skipping unknown attribute candidate: ${excelName}`);
  
  // Debug Karavan "Tipi" etc
  if (excelName.toString().includes('Tipi')) {
      console.log(`Debug Map: ${excelName} -> Upper: ${upper} -> Match Tipi? ${upper === 'TİPİ'}`);
  }

  return null;
  /*
  return {
    name: excelName,
    slug: trSlug(excelName.toString()),
    type: 'text',
    isFallback: true 
  };
  */
}

function detectRangeAttribute(colValue) {
    if (!colValue) return null;
    const upper = colValue.toString().toLocaleUpperCase('tr-TR').trim();

    if (upper.includes('YIL') && (upper.includes('MIN') || upper.includes('MİN'))) return ATTRIBUTES.YIL;
    if (upper.includes('KM') && (upper.includes('MIN') || upper.includes('MİN'))) return ATTRIBUTES.KM;
    if (upper.includes('MOTOR GÜCÜ') && (upper.includes('MIN') || upper.includes('MİN'))) return ATTRIBUTES.MOTOR_GUCU;
    if (upper.includes('MOTOR HACMİ') && (upper.includes('MIN') || upper.includes('MİN'))) return ATTRIBUTES.MOTOR_HACMI;
    
    return null;
}

function trSlug(text) {
  const trMap = { 'ç': 'c', 'ğ': 'g', 'ı': 'i', 'İ': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u', 'Ç': 'c', 'Ğ': 'g', 'Ö': 'o', 'Ş': 's', 'Ü': 'u' };
  return text
    .replace(/[çğıİöşüÇĞÖŞÜ]/g, (match) => trMap[match])
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

// ----------------------------------------------------------------------------
// 4. MAIN PROCESS
// ----------------------------------------------------------------------------
const getManualAttributes = (key) => {
    let attrs = {};
    
    // 1. Merge Common Attributes
    if (manualData.common_attributes) {
            Object.entries(manualData.common_attributes).forEach(([k, v]) => {
                attrs[k] = v;
            });
    }

    // 2. Merge Subcategory Attributes
    if (manualData[key] && manualData[key].attributes) {
        Object.entries(manualData[key].attributes).forEach(([k, v]) => {
            attrs[k] = v;
        });
    }
    
    // 3. Map common keys to Turkish slugs if missing
    if (attrs.years && !attrs.yil) attrs.yil = attrs.years;
    if (attrs.colors && !attrs.renk) attrs.renk = attrs.colors;
    if (attrs.fuels && !attrs.yakit) attrs.yakit = attrs.fuels;
    if (attrs.gears && !attrs.vites) attrs.vites = attrs.gears;
    
    return attrs;
};

async function main() {
  console.log('Starting Vasita Excel Processing...');
  
  if (!fs.existsSync(EXCEL_PATH)) {
    console.error('File not found:', EXCEL_PATH);
    process.exit(1);
  }

  const workbook = XLSX.readFile(EXCEL_PATH);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  // 1. Find or Create VASITA Category
  let category = await prisma.category.findUnique({ where: { slug: VASITA_SLUG } });
  if (!category) {
    console.log('Creating VASITA category...');
    category = await prisma.category.create({
      data: { name: 'Vasıta', slug: VASITA_SLUG, icon: '🚗' }
    });
  }
  
  // 2. Clear Existing Subcategories and Attributes for VASITA
  console.log('Cleaning existing subcategories...');
  await prisma.subCategory.deleteMany({ where: { categoryId: category.id } });
  await prisma.categoryAttribute.deleteMany({ where: { categoryId: category.id } });

  // 3. Parse Hierarchy
  let lastL1 = '';
  let lastL2 = '';
  let lastL3 = '';
  let currentSubCategory = null;
  let subCategoriesMap = new Map();

  // Excel structure: Col 0 is "VASITA" (L0). Col 1 is L1 (OTOMOBIL). Col 2 is L2. Col 3 is L3.
  // Col 10 (K) is Attribute Name. Col 11+ Options.

  // NOTE: Excel index is 0-based.
  // Col 0: "VASITA"
  // Col 1: "OTOMOBİL"
  // ...
  // Col 10: Attribute Name (e.g. "MARKA")
  // Col 11: Option 1

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;

    const col1 = row[1] ? row[1].toString().trim() : undefined; // OTOMOBİL
    const col2 = row[2] ? row[2].toString().trim() : undefined;
    const col3 = row[3] ? row[3].toString().trim() : undefined;
    
    // Update Hierarchy
    if (col1 && col1 !== lastL1) { 
        lastL1 = col1; 
        lastL2 = ''; 
        lastL3 = ''; 
    } else if (col1) {
        lastL1 = col1;
    }

    if (col2 && col2 !== lastL2) {
         lastL2 = col2; 
         lastL3 = ''; 
    } else if (col2) {
         lastL2 = col2;
    }

    if (col3) {
         lastL3 = col3; 
    }

    // Define SubCategory
    const parts = [lastL1, lastL2, lastL3].filter(Boolean);
    
    if (parts.length > 0) {
        const slug = parts.map(p => trSlug(p)).join('-');
        const name = parts.map(p => p.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')).join(' ');

        if (!subCategoriesMap.has(slug)) {
            subCategoriesMap.set(slug, {
                name: name,
                slug: slug,
                attributes: [],
                lastAttribute: null,
                categoryType: lastL1 // Store L1 to know which aux data to use
            });
        }
        currentSubCategory = subCategoriesMap.get(slug);
    }

    if (lastL1 === 'KARAVAN' && i < 50) { // Limit logs
         // console.log(`Processing Karavan Row ${i}. Col 4: "${row[4]}"`);
    }

    // Process Attribute
    // Scan columns 4 to 20 to find Attribute Name
    let colAttributeName = null;
    let colOption = null;
    let colIndexFound = -1;

    for (let c = 4; c < 20; c++) {
        if (row[c]) {
             // Check if it looks like an attribute
             const possibleAttr = mapAttribute(row[c]);
             if (possibleAttr) {
                 colAttributeName = row[c];
                 colOption = row[c+1]; // Option is usually in the next column
                 colIndexFound = c;
                 break;
             }
        }
    }

    if (currentSubCategory) {
        if (colAttributeName) {
            // New Attribute
            const attrGlobal = mapAttribute(colAttributeName);
            if (attrGlobal) {
                // Check if attribute with this slug already exists in current subcategory
                let existingAttr = currentSubCategory.attributes.find(a => a.slug === attrGlobal.slug);
                let targetAttr;

                if (existingAttr) {
                     targetAttr = existingAttr;
                } else {
                    // Create new instance by cloning global config
                    // IMPORTANT: Clone options array to avoid shared state
                    targetAttr = { ...attrGlobal, options: [] };
                    currentSubCategory.attributes.push(targetAttr);
                    currentSubCategory.lastAttribute = targetAttr;
                }

                // Add Option if found
                if (colOption) {
                    if (targetAttr.type !== 'range-number' && targetAttr.type !== 'boolean') {
                        if (!targetAttr.options.includes(colOption.toString())) {
                             targetAttr.options.push(colOption.toString());
                        }
                    }
                }
            }
        } 
        // If we didn't find an attribute name in this row, maybe it's a continuation of options?
        // But we need to know WHICH column the options are in.
        // If we processed previous rows, we might know the attribute column index for this subcategory?
        // But the script is row-by-row.
        
        // For OTOMOBİL, Attribute Name is repeated in every row (e.g. "MARKA").
        // So `colAttributeName` will be found.
        
        // Is there a case where Attribute Name is NOT repeated?
        // Inspection showed:
        // Row 2: "MARKA"
        // Row 3: "MARKA", "Abarth"
        // Row 4: "MARKA", "Aion"
        // So Attribute Name IS repeated.
        
        // So dynamic scanning per row should work.
    }
  }

  // 4. Post-Processing: Fill Empty Attributes with Real Data
  console.log('Post-processing attributes...');
  const missingReport = [];

  // Helper to extract manual models
  const getManualModels = (key) => {
      if (manualData[key] && manualData[key].models) {
          const models = [];
          if (Array.isArray(manualData[key].models)) {
              models.push(...manualData[key].models);
          } else {
              Object.values(manualData[key].models).forEach(list => models.push(...list));
          }
          return models;
      }
      return [];
  };

  const getManualBrands = (key) => {
      if (manualData[key] && manualData[key].brands) {
          return manualData[key].brands;
      }
      return [];
  };

  // REMOVED duplicate getManualAttributes definition here to use the one defined globally

  for (const [slug, subCat] of subCategoriesMap) {
      const type = subCat.categoryType.toUpperCase();
      let manualAttrs = {};

      // Ensure Standard Attributes Exist for Vehicle Types
      if (['OTOMOBİL', 'ARAZİ', 'SUV', 'MİNİVAN', 'PANELVAN', 'TİCARİ', 'KİRALIK', 'MOTOSİKLET', 'KARAVAN', 'ATV', 'UTV', 'TRAKTÖR'].some(t => type.includes(t))) {
           if (!subCat.attributes.find(a => a.slug === 'marka')) subCat.attributes.push({ ...ATTRIBUTES.MARKA, options: [] });
           if (!subCat.attributes.find(a => a.slug === 'model')) subCat.attributes.push({ ...ATTRIBUTES.MODEL, options: [] });
           if (!subCat.attributes.find(a => a.slug === 'seri') && !type.includes('ATV') && !type.includes('UTV')) subCat.attributes.push({ ...ATTRIBUTES.SERI, options: [] });
           if (!subCat.attributes.find(a => a.slug === 'paket') && !type.includes('ATV') && !type.includes('UTV')) subCat.attributes.push({ ...ATTRIBUTES.PAKET, options: [] });
           
           // Ensure Common Filters Exist (Year, KM, Color, etc.)
           if (!subCat.attributes.find(a => a.slug === 'yil')) subCat.attributes.push({ ...ATTRIBUTES.YIL, options: [] });
           if (!subCat.attributes.find(a => a.slug === 'km') && !type.includes('TRAKTÖR')) subCat.attributes.push({ ...ATTRIBUTES.KM, options: [] });
           if (!subCat.attributes.find(a => a.slug === 'renk')) subCat.attributes.push({ ...ATTRIBUTES.RENK, options: [] });
           if (!subCat.attributes.find(a => a.slug === 'vites') && !type.includes('ATV') && !type.includes('UTV')) subCat.attributes.push({ ...ATTRIBUTES.VITES, options: [] });
           if (!subCat.attributes.find(a => a.slug === 'yakit') && !type.includes('ATV') && !type.includes('UTV')) subCat.attributes.push({ ...ATTRIBUTES.YAKIT, options: [] });
      }

      // Specific Attributes for Deniz & Hava
      if (type.includes('DENİZ')) {
           if (!subCat.attributes.find(a => a.slug === 'marka')) subCat.attributes.push({ ...ATTRIBUTES.MARKA, options: [] });
           if (!subCat.attributes.find(a => a.slug === 'model')) subCat.attributes.push({ ...ATTRIBUTES.MODEL, options: [] });
           if (!subCat.attributes.find(a => a.slug === 'yil')) subCat.attributes.push({ ...ATTRIBUTES.YIL, options: [] });
           if (!subCat.attributes.find(a => a.slug === 'motor-saati')) subCat.attributes.push({ ...ATTRIBUTES.MOTOR_SAATI, options: [] });
           if (!subCat.attributes.find(a => a.slug === 'govde-malzemesi')) subCat.attributes.push({ ...ATTRIBUTES.GOVDE_MALZEMESI, options: [] });
           if (!subCat.attributes.find(a => a.slug === 'yakit')) subCat.attributes.push({ ...ATTRIBUTES.YAKIT, options: [] });
      }

      if (type.includes('HAVA')) {
           if (!subCat.attributes.find(a => a.slug === 'marka')) subCat.attributes.push({ ...ATTRIBUTES.MARKA, options: [] });
           if (!subCat.attributes.find(a => a.slug === 'model')) subCat.attributes.push({ ...ATTRIBUTES.MODEL, options: [] });
           if (!subCat.attributes.find(a => a.slug === 'yil')) subCat.attributes.push({ ...ATTRIBUTES.YIL, options: [] });
           if (!subCat.attributes.find(a => a.slug === 'saat')) subCat.attributes.push({ ...ATTRIBUTES.SAAT, options: [] });
      }

      // Determine Aux Data Source
      let auxSource = { brands: new Set(), models: new Set(), series: new Set(), packages: new Set() };
      
      if (type.includes('OTOMOBİL')) {
          auxSource = AUX_DATA.cars;
          // Also load manual attributes for common fields (Year, KM, Color, etc.)
          manualAttrs = getManualAttributes('otomobil'); // Will mostly use common_attributes
      } else if (type.includes('KİRALIK') || type.includes('KIRALIK')) {
          const manualBrands = getManualBrands('kiralik');
          const manualModels = getManualModels('kiralik');
          auxSource = { brands: new Set(manualBrands), models: new Set(manualModels), series: new Set(), packages: new Set() };
          manualAttrs = getManualAttributes('kiralik');
      } else if (type.includes('ARAZİ') || type.includes('SUV')) {
          auxSource = AUX_DATA.suv;
          const mBrands = getManualBrands('suv');
          const mModels = getManualModels('suv');
          mBrands.forEach(b => auxSource.brands.add(b));
          mModels.forEach(m => auxSource.models.add(m));
          manualAttrs = getManualAttributes('suv');
      } else if (type.includes('MOTOSİKLET')) {
          auxSource = AUX_DATA.motorcycle;
          const mBrands = getManualBrands('motosiklet');
          const mModels = getManualModels('motosiklet');
          mBrands.forEach(b => auxSource.brands.add(b));
          mModels.forEach(m => auxSource.models.add(m));
          manualAttrs = getManualAttributes('motosiklet');
          console.log(`DEBUG: Motosiklet manualAttrs keys: ${Object.keys(manualAttrs).join(', ')}`);
          console.log(`DEBUG: Motosiklet manualAttrs.yil length: ${manualAttrs.yil ? manualAttrs.yil.length : 'undefined'}`);
      } else if (type.includes('MİNİVAN') || type.includes('PANELVAN')) {
           const manualModels = getManualModels('minivan_panelvan');
           const manualBrands = getManualBrands('minivan_panelvan');
           const commonSeries = manualData.common_commercial_series || [];
           auxSource = { brands: new Set(manualBrands), models: new Set(manualModels), series: new Set(commonSeries), packages: new Set() };
           manualAttrs = getManualAttributes('minivan_panelvan');
      }
      
      if (type.includes('KARAVAN')) {
          const manualBrands = getManualBrands('karavan');
          const manualModels = getManualModels('karavan');
          manualAttrs = getManualAttributes('karavan');
          auxSource = { brands: new Set(manualBrands), models: new Set(manualModels), series: new Set(), packages: new Set() };
      } else if (type.includes('DENİZ')) {
          const manualBrands = getManualBrands('deniz_araclari');
          const manualModels = getManualModels('deniz_araclari');
          manualAttrs = getManualAttributes('deniz_araclari');
          auxSource = { brands: new Set(manualBrands), models: new Set(manualModels), series: new Set(), packages: new Set() };
      } else if (type.includes('HAVA')) {
          const manualBrands = getManualBrands('hava_araclari');
          const manualModels = getManualModels('hava_araclari');
          manualAttrs = getManualAttributes('hava_araclari');
          auxSource = { brands: new Set(manualBrands), models: new Set(manualModels), series: new Set(), packages: new Set() };
      } else if (type.includes('ATV') || type.includes('UTV')) {
          const manualBrands = getManualBrands('atv_utv');
          const manualModels = getManualModels('atv_utv');
          manualAttrs = getManualAttributes('atv_utv');
          auxSource = { brands: new Set(manualBrands), models: new Set(manualModels), series: new Set(), packages: new Set() };
      } else if (type.includes('TRAKTÖR')) {
          const manualBrands = getManualBrands('traktor');
          const manualModels = getManualModels('traktor');
          manualAttrs = getManualAttributes('traktor');
          auxSource = { brands: new Set(manualBrands), models: new Set(manualModels), series: new Set(), packages: new Set() };
      } else if (type.includes('TİCARİ') || type.includes('KAMYON') || type.includes('OTOBÜS') || type.includes('ÇEKİCİ')) {
           const manualModels = getManualModels('ticari');
           const manualBrands = getManualBrands('ticari');
           manualAttrs = getManualAttributes('ticari');
           const commonSeries = manualData.common_commercial_series || [];
           auxSource = { brands: new Set(manualBrands), models: new Set(manualModels), series: new Set(commonSeries), packages: new Set() };
      } else if (type.includes('MİNİVAN')) {
          const manualModels = getManualModels('minivan_panelvan');
          const manualBrands = getManualBrands('minivan_panelvan');
          manualAttrs = getManualAttributes('minivan_panelvan');
          auxSource = { brands: new Set(manualBrands), models: new Set(manualModels), series: new Set(), packages: new Set() };
      }
      
      // 4. Post-process attributes
      // Map aux/manual data to attributes
      for (const attr of subCat.attributes) {
          if (attr.type === 'select' && (!attr.options || attr.options.length === 0)) {
              // Try to fill from manual attributes first by slug matching
              const slug = attr.slug.replace(/-/g, '_');
              if (manualAttrs[slug]) {
                  attr.options = manualAttrs[slug];
              }
              
              // Specific handling for 'tipi' which might be ambiguous
              if (attr.slug === 'tipi') {
                  if (subCat.slug.includes('motokaravan') && manualAttrs.tipi_motokaravan) attr.options = manualAttrs.tipi_motokaravan;
                  else if (subCat.slug.includes('cekme-karavan') && manualAttrs.tipi_cekme) attr.options = manualAttrs.tipi_cekme;
                  else if (subCat.slug.includes('motoryat') && manualAttrs.tipi_motoryat) attr.options = manualAttrs.tipi_motoryat;
                  else if (subCat.slug.includes('yelkenli') && manualAttrs.tipi_yelkenli) attr.options = manualAttrs.tipi_yelkenli;
                  else if (subCat.slug.includes('katamaran') && manualAttrs.tipi_katamaran) attr.options = manualAttrs.tipi_katamaran;
              }

              if (attr.options && attr.options.length > 0) continue; // Skip if filled

              // It's empty. Try to fill.
              if (attr.slug === 'marka' || attr.slug === 'arac-markasi') {
                  attr.options = Array.from(auxSource.brands);
                  if (attr.options.length === 0) missingReport.push(`${subCat.name} - Marka`);
              } else if (attr.slug === 'model') {
                  attr.options = Array.from(auxSource.models);
                  if (attr.options.length === 0) missingReport.push(`${subCat.name} - Model`);
              } else if (attr.slug === 'seri') {
                  attr.options = Array.from(auxSource.series);
                  if (attr.options.length === 0) missingReport.push(`${subCat.name} - Seri`);
              } else if (attr.slug === 'paket') {
                  attr.options = Array.from(auxSource.packages);
                  if (attr.options.length === 0) missingReport.push(`${subCat.name} - Paket`);
              }
          }

          const manualOptions = (typeof manualAttrs !== 'undefined' && manualAttrs[attr.slug.replace(/-/g, '_')]) || null;
          
          if (manualOptions) {
              attr.sampleData = manualOptions;
              if (subCat.slug.includes('motosiklet') && attr.slug === 'yil') {
                  console.log(`DEBUG: Motosiklet Yil assigned sampleData. Length: ${attr.sampleData.length}`);
              }
          } else if (attr.options && attr.options.length > 0) {
              attr.sampleData = attr.options;
          }
      }
  }

  // 5. Save to Database
  console.log(`Saving ${subCategoriesMap.size} subcategories...`);
  let order = 1;
  for (const [slug, subCat] of subCategoriesMap) {
      console.log(`Processing: ${subCat.name} (${slug}) with ${subCat.attributes.length} attributes`);
      
      const subCategory = await prisma.subCategory.create({
          data: {
              name: subCat.name,
              slug: slug,
              categoryId: category.id
          }
      });

      let attrOrder = 1;
      for (const attr of subCat.attributes) {
          await prisma.categoryAttribute.create({
              data: {
                  categoryId: category.id,
                  subCategoryId: subCategory.id,
                  name: attr.name.toString(),
                  slug: attr.slug,
                  type: attr.type,
                  optionsJson: attr.options ? JSON.stringify(attr.options) : 
                               (attr.minKey || attr.maxKey) ? JSON.stringify({ minKey: attr.minKey, maxKey: attr.maxKey }) : null,
                  order: attrOrder++,
                  showInOffer: true,
                  showInRequest: true
              }
          });
      }
      order++;
  }

  console.log('Migration completed successfully.');
  
  // 6. Generate Filled Excel
  console.log('Generating filled Excel file...');
  const newWb = XLSX.utils.book_new();
  
  // Create a summary sheet
  const summaryData = [['SubCategory', 'Slug', 'Attribute Count']];
  
  for (const [slug, subCat] of subCategoriesMap) {
      summaryData.push([subCat.name, slug, subCat.attributes.length]);
      
      // Create a sheet for each subcategory (limit name length to 31 chars)
      const sheetName = slug.substring(0, 31);
      const sheetData = [];
      
      // Header: Attribute Names
      const headers = subCat.attributes.map(a => a.name);
      sheetData.push(headers);
      
      // Find max options length to know how many rows
      let maxRows = 0;
      subCat.attributes.forEach(a => {
          const len = (a.sampleData || a.options || []).length;
          if (len > maxRows) maxRows = len;
      });
      
      // Fill rows
      for (let r = 0; r < maxRows; r++) {
          const row = [];
          subCat.attributes.forEach(a => {
              const data = a.sampleData || a.options || [];
              if (data[r]) row.push(data[r]);
              else if (data.length > 0) row.push(data[r % data.length]); // Cycle through data if short
              else row.push('');
          });
          sheetData.push(row);
      }
      
      const ws = XLSX.utils.aoa_to_sheet(sheetData);
      XLSX.utils.book_append_sheet(newWb, ws, sheetName);
  }
  
  XLSX.utils.book_append_sheet(newWb, XLSX.utils.aoa_to_sheet(summaryData), 'Summary');
  XLSX.writeFile(newWb, OUTPUT_EXCEL_PATH);
  console.log(`Filled Excel saved to: ${OUTPUT_EXCEL_PATH}`);

  if (missingReport.length > 0) {
      console.log('\n--- MISSING DATA REPORT ---');
      console.log('The following attributes were found empty in Excel and no real data could be found in auxiliary files:');
      missingReport.forEach(item => console.log(`- ${item}`));
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
