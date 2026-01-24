const fs = require('fs');
const path = require('path');

// Read vehicle-schema.json
const schemaPath = path.join(__dirname, '../src/data/vehicle-schema.json');
const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
// Normalize brands for comparison (uppercase)
const validBrands = new Set(schema['vasita/otomobil'].brands.map(b => b.trim()));
console.log(`Loaded ${validBrands.size} valid brands from schema.`);

// Read automobile-data.ts
const dataPath = path.join(__dirname, '../src/data/automobile-data.ts');
const dataContent = fs.readFileSync(dataPath, 'utf8');

// Extract the object content
// We look for the start and end of the object
const startIndex = dataContent.indexOf('export const AUTOMOBILE_TRIM_EQUIPMENTS = {');
if (startIndex === -1) {
    console.error('Could not find start of object');
    process.exit(1);
}

// Simple parser to reconstruct the object or filter lines
// Since parsing the whole TS file as JSON is hard (keys not quoted sometimes, comments, etc)
// We will process it line by line.

const lines = dataContent.split('\n');
const newLines = [];
let insideObject = false;
let currentBrand = null;
let keepCurrentBrand = false;
let objectDepth = 0;

let keptBrands = 0;
let removedBrands = 0;
let removedBrandNames = [];

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (line.includes('export const AUTOMOBILE_TRIM_EQUIPMENTS = {')) {
        insideObject = true;
        newLines.push(line);
        objectDepth = 1;
        continue;
    }

    if (!insideObject) {
        newLines.push(line);
        continue;
    }

    // Check for end of main object
    if (trimmed === '};' && objectDepth === 1) {
        insideObject = false;
        newLines.push(line);
        continue;
    }

    // DEBUG
    if (i < 20 && objectDepth === 1) {
        console.log(`Line ${i}: ${line}, Depth: ${objectDepth}`);
    }

    // Identify Brand Keys (depth 1 properties)
    // Matches: "Brand": {  or  Brand: {
    const brandMatch = line.match(/^\s*["']?([^"':]+)["']?:\s*\{/);
    
    // We determine depth by braces count in the line
    // But since we are processing line by line, and we know the structure is pretty standard
    // We can track indentation or braces.
    // However, tracking "currentBrand" scope is safer.

    // If we are at depth 1 (inside main object), this line might be a brand definition
    // But we need to track braces carefully to know if we are at depth 1.
    // Let's count braces in the line.
    const openBraces = (line.match(/\{/g) || []).length;
    const closeBraces = (line.match(/\}/g) || []).length;
    
    // Determine if this line STARTS a brand definition
    // It must be inside the main object (depth 1) and increase depth to 2
    if (objectDepth === 1 && openBraces > 0) {
         if (brandMatch) {
             const brandName = brandMatch[1].trim();
             // Check if this brand is valid
             // Case insensitive check might be safer, but exact match is preferred if data is clean
             // Let's try exact first, then case insensitive
             let isValid = validBrands.has(brandName);
             
             console.log(`Checking brand: "${brandName}" (Depth: ${objectDepth}) -> Valid: ${isValid}`);

             if (isValid) {
                 keepCurrentBrand = true;
                 keptBrands++;
             } else {
                 keepCurrentBrand = false;
                 removedBrands++;
                 removedBrandNames.push(brandName);
             }
             
             currentBrand = brandName;
         }
    }

    // If we are inside a brand (keepCurrentBrand is true), we keep the line
    // If keepCurrentBrand is false, we skip the line
    // BUT we must always keep lines that change depth correctly?
    // No, if we skip a brand, we skip EVERYTHING inside it.
    
    if (keepCurrentBrand) {
        newLines.push(line);
    }
    
    // Update depth AFTER processing the line
    objectDepth += openBraces - closeBraces;
    
    // If we just closed a brand (depth went back to 1), reset currentBrand
    if (objectDepth === 1 && closeBraces > 0) {
        currentBrand = null;
        // keepCurrentBrand remains true for the closing brace line itself?
        // Yes, if we were keeping the brand, we keep the closing brace.
        // If we were skipping, we skip the closing brace.
        // But wait, if keepCurrentBrand was false, we didn't push the line.
        // So we are good.
    }
}

console.log(`Kept ${keptBrands} brands`);
console.log(`Removed ${removedBrands} brands`);
console.log('Removed Brands:', removedBrandNames);

// Write the new content
const outputPath = path.join(__dirname, '../src/data/automobile-data-clean.ts');
fs.writeFileSync(outputPath, newLines.join('\n'));
console.log(`Cleaned data written to ${outputPath}`);
