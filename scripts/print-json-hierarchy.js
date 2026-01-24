
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/yedek-parca-structure.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

function printHierarchy(node, level = 0) {
    console.log('  '.repeat(level) + node.name);
    if (node.subcategories) {
        node.subcategories.forEach(sub => printHierarchy(sub, level + 1));
    }
}

console.log('Hierarchy:');
if (data.subcategories) {
    data.subcategories.forEach(sub => printHierarchy(sub, 1));
}
