
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const filePath = 'c:\\varsagel\\varsagel\\kategoriler\\VASITA KATEGORİ ÇALIŞMASI.xlsx';
const outputPath = 'c:\\varsagel\\varsagel\\src\\data\\vehicle-schema.json';

try {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, range: 0, defval: null });

  const result = {};
  let currentCategory = null;
  let currentSection = null; // 'brands', 'attributes'
  let currentAttribute = null;

  const categoryMap = {
    'OTOMOBİL': 'vasita/otomobil',
    'MOTOSİKLET': 'vasita/motosiklet',
    'ARAZİ, SUV & PICKUP': 'vasita/arazi-suv-pickup',
    'MİNİVAN & PANELVAN': 'vasita/minivan-panelvan',
    'MİNİVAN': 'vasita/minivan-panelvan', // Extra safety
    'PANELVAN': 'vasita/minivan-panelvan', // Extra safety
    'TİCARİ ARAÇLAR': 'vasita/ticari-araclar',
    'KAMYON & KAMYONET': 'vasita/kamyon-kamyonet',
    'ÇEKİCİ': 'vasita/cekici',
    'DORSE': 'vasita/dorse'
  };

  // Helper to normalize strings
  const normalize = (str) => str ? str.trim() : null;
  const normalizeKey = (str) => str.toLowerCase()
    .replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ü/g, 'u')
    .replace(/İ/g, 'i')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row) continue;

    let possibleCategory = row[1];
    if (possibleCategory && typeof possibleCategory === 'string') {
        possibleCategory = possibleCategory.trim();
        // Check if it matches known categories or looks like one
        // Try exact match first
        let code = categoryMap[possibleCategory];
        
        if (!code) {
             // Fallback normalization
             if (['OTOMOBİL', 'MOTOSİKLET', 'ARAZİ', 'SUV', 'PICKUP', 'MİNİVAN', 'PANELVAN', 'KAMYON', 'KAMYONET', 'TİCARİ'].some(k => possibleCategory.includes(k))) {
                code = 'vasita/' + normalizeKey(possibleCategory);
             }
        }

        if (code) {
            // Start new category
            currentCategory = code;
            result[currentCategory] = {
                name: possibleCategory,
                brands: [],
                attributes: {}
            };
            currentSection = null;
            currentAttribute = null;
            continue;
        }
    }

    if (!currentCategory) continue;

    // Check for "MARKA" header
    // Row 3: [null, null, "MARKA"] -> Index 2
    // Row 265: [null, null, "MARKA"] -> Index 2
    if (row[2] === 'MARKA') {
        currentSection = 'brands';
        continue;
    }

    // Check for Attribute Headers
    // They seem to be in Index 2 as well, e.g. "ARAÇ DURUMU", "MODEL", "İL"
    // But some are in Index 1? "MOTOR HACMİ" (Row 461 in prev output was [null,null,"MOTOR HACMİ"])
    
    // Let's assume if we see a string in Index 2 that is NOT a brand (how to distinguish?), it might be an attribute header.
    // Actually, "MARKA" was followed by brands in Index 3.
    // Row 4: [null, null, null, "Abarth"]
    // Row 260: [null, null, "ARAÇ DURUMU"]
    // Row 261: [null, null, null, "İkinci El"]
    
    // So:
    // Header is in Col 2.
    // Values are in Col 3.
    
    const col2 = normalize(row[2]);
    const col3 = normalize(row[3]);

    if (col2 && !col3) {
        // This is likely an attribute header (e.g. "ARAÇ DURUMU")
        // But wait, "MARKA" was also like this.
        if (col2 !== 'MARKA') {
            currentSection = 'attributes';
            currentAttribute = col2;
            result[currentCategory].attributes[currentAttribute] = [];
        }
    } else if (col3) {
        // This is a value
        if (currentSection === 'brands') {
            result[currentCategory].brands.push(col3);
        } else if (currentSection === 'attributes' && currentAttribute) {
            result[currentCategory].attributes[currentAttribute].push(col3);
        }
    }
  }

  // Post-processing to clean up
  // Some brands might have been captured as attributes if logic was loose?
  // No, brands section is explicit.
  
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
  console.log('Schema generated at:', outputPath);
  console.log('Categories found:', Object.keys(result));
  Object.keys(result).forEach(k => {
      console.log(`${k}: ${result[k].brands.length} brands, ${Object.keys(result[k].attributes).length} attributes`);
  });

} catch (error) {
  console.error('Error:', error);
}
