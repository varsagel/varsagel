const manualData = require('./scripts/data/manual-vehicle-data.js');

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

const suvAttrs = getManualAttributes('suv');
console.log('SUV Attributes Keys:', Object.keys(suvAttrs));
console.log('SUV KM Exists:', !!suvAttrs.km);
if (suvAttrs.km) console.log('SUV KM Length:', suvAttrs.km.length);
console.log('SUV YIL Exists:', !!suvAttrs.yil);

const otomobilAttrs = getManualAttributes('otomobil');
console.log('Otomobil Attributes Keys:', Object.keys(otomobilAttrs));
console.log('Otomobil KM Exists:', !!otomobilAttrs.km);
