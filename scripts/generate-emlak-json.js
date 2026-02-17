const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const EXCEL_PATH = 'c:\\varsagel\\varsagel\\kategoriler\\EMLAK kategori çalışması en son.xlsx';
const OUTPUT_PATH = 'c:\\varsagel\\varsagel\\src\\data\\emlak-structure.json';

function trSlug(text) {
  const trMap = { 'ç': 'c', 'ğ': 'g', 'ı': 'i', 'İ': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u', 'Ç': 'c', 'Ğ': 'g', 'Ö': 'o', 'Ş': 's', 'Ü': 'u' };
  return text
    .replace(/[çğıİöşüÇĞÖŞÜ]/g, (match) => trMap[match])
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function generate() {
    try {
        const workbook = XLSX.readFile(EXCEL_PATH);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(sheet, {header: 1});

        const root = {
            name: 'EMLAK',
            slug: 'emlak',
            icon: '🏠',
            subcategories: []
        };

        let lastL1 = null; // Konut
        let lastL2 = null; // Satılık

        // Start from row 2 (index 2)
        for (let i = 2; i < data.length; i++) {
            const row = data[i];
            const c1 = row[1]; // Konut
            const c2 = row[2]; // Satılık
            const c3 = row[3]; // Daire

            if (c1) {
                lastL1 = findOrCreate(root.subcategories, c1, null);
                lastL2 = null; // Reset L2 when L1 changes
            }
            
            if (c2 && lastL1) {
                lastL2 = findOrCreate(lastL1.subcategories, c2, lastL1.slug);
            }

            if (c3 && lastL2) {
                // Leaf node (Daire)
                const rawSlug = trSlug(c3);
                // Composite slug: parent_slug + '-' + raw_slug
                // parent_slug is lastL2.slug which is like 'konut-satilik'
                const fullSlug = `${lastL2.slug}-${rawSlug}`;
                
                if (!lastL2.subcategories.find(n => n.slug === fullSlug)) {
                    lastL2.subcategories.push({ name: c3, slug: fullSlug });
                }
            }
        }

        // Clean up empty subcategories arrays
        const clean = (node) => {
            if (node.subcategories && node.subcategories.length === 0) {
                delete node.subcategories;
            } else if (node.subcategories) {
                node.subcategories.forEach(clean);
            }
        };
        clean(root);

        fs.writeFileSync(OUTPUT_PATH, JSON.stringify(root, null, 2));
        console.log(`JSON written to ${OUTPUT_PATH}`);

    } catch (error) {
        console.error('Error:', error);
    }
}

// Helper to find or create node
function findOrCreate(parentArray, name, parentSlug) {
    if (!name) return null;
    const rawSlug = trSlug(name);
    const slug = parentSlug ? `${parentSlug}-${rawSlug}` : rawSlug;
    
    let node = parentArray.find(n => n.slug === slug);
    if (!node) {
        node = { name: name, slug: slug, subcategories: [] };
        parentArray.push(node);
    }
    return node;
}

generate();
