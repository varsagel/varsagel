
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const filePath = 'c:/varsagel/varsagel/kategoriler/Yedek Parça, Aksesuar, Donanım & Tuning.xlsx';
const outputStructurePath = 'c:/varsagel/varsagel/src/data/yedek-parca-structure.json';
const outputAttributesPath = 'c:/varsagel/varsagel/src/data/yedek-parca-attributes.json';

// Helper for Turkish Slug
const trMap = {
    'ç': 'c', 'Ç': 'c',
    'ğ': 'g', 'Ğ': 'g',
    'ş': 's', 'Ş': 's',
    'ü': 'u', 'Ü': 'u',
    'ı': 'i', 'İ': 'i',
    'ö': 'o', 'Ö': 'o'
};
function trSlug(str) {
    if (!str) return '';
    return str.toLowerCase()
        .replace(/[çÇğĞşŞüÜıİöÖ]/g, c => trMap[c])
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

if (!fs.existsSync(filePath)) {
    console.error('File not found:', filePath);
    process.exit(1);
}

const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

const root = {
    name: 'Yedek Parça, Aksesuar, Donanım & Tuning',
    slug: 'yedek-parca-aksesuar-donanim-tuning',
    fullSlug: 'yedek-parca-aksesuar-donanim-tuning',
    subcategories: []
};

// Map to store attributes: fullSlug -> { label -> Set(values) }
const attributesMap = {};

// Skip header
for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const mainCategory = (row[0] || '').toString().trim();
    if (mainCategory && mainCategory !== root.name) continue;
    let currentNode = root;
    let currentPath = root.fullSlug;

    // Iterate columns 1 to 5 (Subcategories)
    // Handle gaps: if a column is empty, skip it but continue to next column
    for (let col = 1; col <= 5; col++) {
        const rawName = (row[col] || '').toString().trim();
        if (!rawName) continue;

        const slugPart = trSlug(rawName);
        if (!slugPart) continue;
        const fullSlug = `${currentPath}-${slugPart}`;

        if (!currentNode.subcategories) currentNode.subcategories = [];

        let child = currentNode.subcategories.find(c => c.slug === slugPart);
        if (!child) {
            child = {
                name: rawName,
                slug: slugPart,
                fullSlug,
                subcategories: [],
            };
            currentNode.subcategories.push(child);
        } else if (!child.fullSlug) {
            child.fullSlug = fullSlug;
        }

        currentNode = child;
        currentPath = fullSlug;
    }

    // Now currentNode is the deepest category for this row.
    // Collect attributes (Col 6 and 7)
    // Col 6: Attribute Name (e.g. "Ürün")
    // Col 7: Attribute Value (e.g. "Buji")
    
    const attrName = row[6];
    const attrValue = row[7];

    if (attrName && attrValue) {
        const key = currentNode.fullSlug || currentNode.slug;
        if (!attributesMap[key]) {
            attributesMap[key] = {};
        }
        if (!attributesMap[key][attrName]) {
            attributesMap[key][attrName] = new Set();
        }
        attributesMap[key][attrName].add(attrValue);
    }
}

// Write Structure
fs.writeFileSync(outputStructurePath, JSON.stringify(root, null, 2));
console.log('Structure written to:', outputStructurePath);

// Process Attributes for Output
const attributesOutput = {};
Object.entries(attributesMap).forEach(([slug, attrs]) => {
    attributesOutput[slug] = Object.entries(attrs).map(([label, valuesSet]) => {
        return {
            key: trSlug(label),
            label: label,
            options: Array.from(valuesSet).sort()
        };
    });
});

fs.writeFileSync(outputAttributesPath, JSON.stringify(attributesOutput, null, 2));
console.log('Attributes written to:', outputAttributesPath);
