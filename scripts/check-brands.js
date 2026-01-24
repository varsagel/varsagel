const fs = require('fs');
const path = require('path');

// Read vehicle-schema.json
const schemaPath = path.join(__dirname, '../src/data/vehicle-schema.json');
const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
const validBrands = new Set(schema['vasita/otomobil'].brands);

// Read automobile-data.ts (this is a TS file, so we need to be careful)
// We'll read it as text and extract keys using regex or simple parsing
const dataPath = path.join(__dirname, '../src/data/automobile-data.ts');
const dataContent = fs.readFileSync(dataPath, 'utf8');

// Extract keys from AUTOMOBILE_TRIM_EQUIPMENTS
const match = dataContent.match(/export const AUTOMOBILE_TRIM_EQUIPMENTS = ({[\s\S]*?});/);
if (!match) {
    console.error('Could not find AUTOMOBILE_TRIM_EQUIPMENTS object');
    process.exit(1);
}

// Evaluate the object (dangerous but quick for this purpose, assuming trusted content)
// We need to handle the variable declaration part
const objectString = match[1];
// We can't easily eval because it might not be valid JSON (keys without quotes)
// So let's just parse the top-level keys manually

const lines = objectString.split('\n');
const brandsInData = [];
let depth = 0;

lines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed.includes('{')) depth++;
    if (trimmed.includes('}')) depth--;
    
    // Top level keys are depth 1 (inside the main object)
    if (depth === 1 && trimmed.includes(': {')) {
        const key = trimmed.split(':')[0].replace(/['"]/g, '').trim();
        brandsInData.push(key);
    }
});

console.log(`Found ${brandsInData.length} brands in automobile-data.ts`);

const excessBrands = brandsInData.filter(b => !validBrands.has(b));
const missingBrands = [...validBrands].filter(b => !brandsInData.includes(b));

console.log('Excess Brands (to be removed):', excessBrands);
console.log('Missing Brands (in schema but not in data):', missingBrands.length);
if (missingBrands.length > 0) {
    console.log('Sample missing:', missingBrands.slice(0, 5));
}
