const fs = require('fs');
const data = require('./src/data/generated-automobil.json');

console.log('Keys in brandModels:', Object.keys(data.BRAND_MODELS || {}));
console.log('Keys in modelSeries:', Object.keys(data.MODEL_SERIES || {}));
