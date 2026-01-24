
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/yedek-parca-structure.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

console.log('Root Subcategories:');
if (data.subcategories) {
    data.subcategories.forEach((sub, index) => {
        console.log(`${index + 1}. ${sub.name} (${sub.slug})`);
    });
} else {
    console.log('No subcategories found at root.');
}
