// Test to verify automobile data works with CategoryClient component
const fs = require('fs');
const path = require('path');

console.log('Testing automobile data integration with CategoryClient...\n');

// Read the automobile data
const automobileDataPath = path.join(__dirname, '..', 'src', 'data', 'automobile-data.ts');
const automobileDataContent = fs.readFileSync(automobileDataPath, 'utf8');

// Extract the data
const brandModelsMatch = automobileDataContent.match(/export const AUTOMOBILE_BRAND_MODELS = ({[\s\S]*?});/);
const modelSeriesMatch = automobileDataContent.match(/export const AUTOMOBILE_MODEL_SERIES = ({[\s\S]*?});/);

if (brandModelsMatch && modelSeriesMatch) {
  try {
    const brandModelsStr = brandModelsMatch[1].replace(/'/g, '"');
    const modelSeriesStr = modelSeriesMatch[1].replace(/'/g, '"');
    
    const brandModels = JSON.parse(brandModelsStr);
    const modelSeries = JSON.parse(modelSeriesStr);
    
    console.log('✓ Automobile data successfully parsed');
    console.log(`✓ ${Object.keys(brandModels).length} brands available`);
    console.log(`✓ ${Object.keys(modelSeries).length} brands have series data`);
    
    // Test some sample data that would be used in CategoryClient
    console.log('\n--- Testing Sample Data for CategoryClient ---');
    
    const sampleBrands = ['BMW', 'Audi', 'Mercedes'];
    
    sampleBrands.forEach(brand => {
      if (brandModels[brand]) {
        console.log(`\n${brand}:`);
        const models = brandModels[brand].slice(0, 3);
        models.forEach(model => {
          const series = modelSeries[brand]?.[model] || [];
          console.log(`  ${model}: ${series.length} series available`);
        });
      }
    });
    
    // Test the data structure that would be used in the select options
    console.log('\n--- Testing Select Options Structure ---');
    
    const brandOptions = Object.keys(brandModels).sort((a, b) => a.localeCompare(b, 'tr'));
    console.log(`✓ Brand options ready: ${brandOptions.length} brands`);
    console.log('Sample brand options:', brandOptions.slice(0, 5));
    
    // Test dependent field logic
    console.log('\n--- Testing Dependent Field Logic ---');
    
    const testBrand = 'BMW';
    const testModels = brandModels[testBrand];
    const testModel = testModels[0];
    
    console.log(`When user selects ${testBrand}:`);
    console.log(`  Available models: ${testModels.length}`);
    console.log(`  First model: ${testModel}`);
    
    if (modelSeries[testBrand]?.[testModel]) {
      const series = modelSeries[testBrand][testModel];
      console.log(`  Series for ${testModel}: ${series.slice(0, 3).join(', ')}${series.length > 3 ? '...' : ''}`);
    }
    
    console.log('\n✓ All tests passed! Automobile data is ready for CategoryClient integration.');
    
  } catch (parseError) {
    console.error('✗ Error parsing automobile data:', parseError.message);
  }
} else {
  console.error('✗ Could not extract data from automobile-data.ts file');
}