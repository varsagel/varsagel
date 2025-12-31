// Test script to verify automobile data integration
const fs = require('fs');
const path = require('path');

console.log('Testing automobile data integration...\n');

// Read the generated automobile data file
const automobileDataPath = path.join(__dirname, '..', 'src', 'data', 'automobile-data.ts');
const automobileDataContent = fs.readFileSync(automobileDataPath, 'utf8');

// Extract the data objects using regex
const brandModelsMatch = automobileDataContent.match(/export const AUTOMOBILE_BRAND_MODELS = ({[\s\S]*?});/);
const modelSeriesMatch = automobileDataContent.match(/export const AUTOMOBILE_MODEL_SERIES = ({[\s\S]*?});/);

if (brandModelsMatch && modelSeriesMatch) {
  try {
    // Parse the JSON data (this is a bit hacky but works for testing)
    const brandModelsStr = brandModelsMatch[1].replace(/'/g, '"');
    const modelSeriesStr = modelSeriesMatch[1].replace(/'/g, '"');
    
    const brandModels = JSON.parse(brandModelsStr);
    const modelSeries = JSON.parse(modelSeriesStr);
    
    console.log('1. Automobile data file structure:');
    console.log(`✓ AUTOMOBILE_BRAND_MODELS: ${Object.keys(brandModels).length} brands`);
    console.log(`✓ AUTOMOBILE_MODEL_SERIES: ${Object.keys(modelSeries).length} brands with series data`);
    
    console.log('\n2. Sample brand-model mapping:');
    const sampleBrands = Object.keys(brandModels).slice(0, 5);
    sampleBrands.forEach(brand => {
      const models = brandModels[brand];
      console.log(`${brand}: ${models.slice(0, 3).join(', ')}${models.length > 3 ? '...' : ''} (${models.length} models)`);
    });
    
    console.log('\n3. Sample model-series mapping:');
    const sampleSeriesBrands = Object.keys(modelSeries).slice(0, 3);
    sampleSeriesBrands.forEach(brand => {
      console.log(`\n${brand}:`);
      const models = Object.keys(modelSeries[brand]).slice(0, 2);
      models.forEach(model => {
        const series = modelSeries[brand][model];
        console.log(`  ${model}: ${series.slice(0, 3).join(', ')}${series.length > 3 ? '...' : ''} (${series.length} series)`);
      });
    });
    
    console.log('\n4. Data consistency check:');
    let brandsWithSeries = 0;
    let totalModels = 0;
    let modelsWithSeries = 0;
    
    Object.keys(brandModels).forEach(brand => {
      if (modelSeries[brand]) {
        brandsWithSeries++;
        const modelsInBrand = brandModels[brand];
        const modelsInSeries = Object.keys(modelSeries[brand]);
        
        totalModels += modelsInBrand.length;
        modelsWithSeries += modelsInBrand.filter(model => modelsInSeries.includes(model)).length;
      }
    });
    
    console.log(`✓ ${brandsWithSeries} out of ${Object.keys(brandModels).length} brands have series data`);
    console.log(`✓ ${modelsWithSeries} out of ${totalModels} models have series data`);
    
    console.log('\n✓ Automobile data integration test completed successfully!');
    
  } catch (parseError) {
    console.error('Error parsing automobile data:', parseError.message);
  }
} else {
  console.error('✗ Could not extract data from automobile-data.ts file');
}