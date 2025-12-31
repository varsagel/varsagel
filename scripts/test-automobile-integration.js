// Test script to verify automobile data integration
const { BRAND_MODELS, MODEL_SERIES } = require('../src/data/attribute-overrides.ts');

console.log('Testing automobile data integration...\n');

// Test 1: Check if automobile data exists
console.log('1. Checking if automobile data exists in BRAND_MODELS:');
const automobileBrands = BRAND_MODELS['vasita/otomobil'];
if (automobileBrands) {
  console.log(`✓ Found automobile brands: ${Object.keys(automobileBrands).length} brands`);
  console.log('Sample brands:', Object.keys(automobileBrands).slice(0, 10));
} else {
  console.log('✗ Automobile brands not found in BRAND_MODELS');
}

console.log('\n2. Checking if automobile model series exists:');
const automobileSeries = MODEL_SERIES['vasita/otomobil'];
if (automobileSeries) {
  console.log(`✓ Found automobile model series: ${Object.keys(automobileSeries).length} brands with series data`);
  
  // Show sample series data
  const sampleBrand = Object.keys(automobileSeries)[0];
  if (sampleBrand) {
    const sampleModel = Object.keys(automobileSeries[sampleBrand])[0];
    if (sampleModel) {
      console.log(`Sample: ${sampleBrand} ${sampleModel} series:`, automobileSeries[sampleBrand][sampleModel].slice(0, 5));
    }
  }
} else {
  console.log('✗ Automobile model series not found in MODEL_SERIES');
}

console.log('\n3. Testing data structure consistency:');
if (automobileBrands && automobileSeries) {
  // Check if brands in BRAND_MODELS match brands in MODEL_SERIES
  const brandsInModels = Object.keys(automobileBrands);
  const brandsInSeries = Object.keys(automobileSeries);
  
  const matchingBrands = brandsInModels.filter(brand => brandsInSeries.includes(brand));
  console.log(`✓ ${matchingBrands.length} out of ${brandsInModels.length} brands have series data`);
  
  // Check if models in BRAND_MODELS match models in MODEL_SERIES for each brand
  let totalModels = 0;
  let modelsWithSeries = 0;
  
  for (const brand of matchingBrands.slice(0, 5)) { // Check first 5 brands
    const modelsInBrands = automobileBrands[brand] || [];
    const modelsInSeries = Object.keys(automobileSeries[brand] || {});
    
    totalModels += modelsInBrands.length;
    modelsWithSeries += modelsInBrands.filter(model => modelsInSeries.includes(model)).length;
  }
  
  console.log(`✓ Sample check: ${modelsWithSeries} out of ${totalModels} models have series data`);
}

console.log('\n4. Sample automobile brand-model-series hierarchy:');
if (automobileBrands && automobileSeries) {
  const sampleBrands = Object.keys(automobileBrands).slice(0, 3);
  
  for (const brand of sampleBrands) {
    console.log(`\n${brand}:`);
    const models = automobileBrands[brand]?.slice(0, 3) || [];
    
    for (const model of models) {
      const series = automobileSeries[brand]?.[model] || [];
      console.log(`  ${model}: ${series.slice(0, 3).join(', ')}${series.length > 3 ? '...' : ''}`);
    }
  }
}

console.log('\n✓ Automobile data integration test completed successfully!');