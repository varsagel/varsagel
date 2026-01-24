const fs = require('fs');
const path = require('path');

const categoriesPath = path.join(__dirname, '../src/data/categories.ts');
const emlakJsonPath = path.join(__dirname, 'emlak-structure.json');

try {
    const categoriesContent = fs.readFileSync(categoriesPath, 'utf8');
    const emlakJson = fs.readFileSync(emlakJsonPath, 'utf8');
    const emlakObj = JSON.parse(emlakJson);

    // Find the start of Emlak category
    // Look for slug instead, might be safer, but we need the opening brace BEFORE it.
    let emlakIndex = categoriesContent.indexOf('"slug": "emlak"');
    if (emlakIndex === -1) {
        emlakIndex = categoriesContent.indexOf('slug: "emlak"');
    }
    if (emlakIndex === -1) {
        throw new Error('Could not find Emlak category slug');
    }

    // Find the opening brace before it
    const openBraceIndex = categoriesContent.lastIndexOf('{', emlakIndex);

    // Find the start of Vasıta category to know where Emlak ends
    let vasitaIndex = categoriesContent.indexOf('"slug": "vasita"');
    if (vasitaIndex === -1) {
         vasitaIndex = categoriesContent.indexOf('slug: "vasita"');
    }
    if (vasitaIndex === -1) {
        throw new Error('Could not find Vasıta category slug');
    }
    const vasitaOpenBraceIndex = categoriesContent.lastIndexOf('{', vasitaIndex);

    // Find the closing brace of Emlak category
    // It should be the last '}' before vasitaOpenBraceIndex
    const strBetween = categoriesContent.substring(openBraceIndex, vasitaOpenBraceIndex);
    const lastClosingBraceRel = strBetween.lastIndexOf('}');
    if (lastClosingBraceRel === -1) {
        throw new Error('Could not find closing brace for Emlak category');
    }
    const endReplaceIndex = openBraceIndex + lastClosingBraceRel + 1;

    const before = categoriesContent.substring(0, openBraceIndex);
    const after = categoriesContent.substring(endReplaceIndex);

    const newEmlakStr = JSON.stringify(emlakObj, null, 2);

    const newContent = before + newEmlakStr + after;

    fs.writeFileSync(categoriesPath, newContent);
    console.log('Successfully updated categories.ts');

} catch (error) {
    console.error('Error updating categories.ts:', error.message);
    process.exit(1);
}
