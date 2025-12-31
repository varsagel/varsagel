import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(PROJECT_ROOT, 'public', 'images', 'brands');
const DATA_DIR = path.join(PROJECT_ROOT, 'src', 'data');
const SCHEMAS_FILE = path.join(PROJECT_ROOT, 'src', 'data', 'attribute-schemas.ts');
const SUBSCHEMAS_FILE = path.join(PROJECT_ROOT, 'src', 'data', 'attribute-overrides.ts');

// Helper to download image
const downloadImage = (url, filepath) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 200) {
        const file = fs.createWriteStream(filepath);
        res.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve(true);
        });
      } else {
        resolve(false); // Not found or other error
      }
    }).on('error', (err) => {
      resolve(false);
    });
  });
};

// Helper to extract brands from file content
const extractBrands = (content) => {
  const brands = new Set();
  // Match pattern: key: 'marka', options: ['A', 'B', ...]
  // We'll use a regex that captures the options array content
  const regex = /key:\s*'marka',\s*options:\s*\[(.*?)\]/g;
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    const optionsStr = match[1];
    // Split by comma and clean quotes
    const options = optionsStr.split(',').map(s => {
      return s.trim().replace(/^['"]|['"]$/g, ''); // Remove quotes
    });
    options.forEach(o => brands.add(o));
  }
  return brands;
};

// Turkish char mapping for filenames/domain search
const normalizeBrand = (brand) => {
  const trMap = {
    'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
    'Ç': 'c', 'Ğ': 'g', 'İ': 'i', 'Ö': 'o', 'Ş': 's', 'Ü': 'u'
  };
  return brand.split('').map(c => trMap[c] || c).join('').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
};

const main = async () => {
  console.log('Reading schema files...');
  
  const schemasContent = fs.readFileSync(SCHEMAS_FILE, 'utf8');
  const subschemasContent = fs.readFileSync(SUBSCHEMAS_FILE, 'utf8');
  
  const allBrands = new Set([
    ...extractBrands(schemasContent),
    ...extractBrands(subschemasContent)
  ]);
  
  console.log(`Found ${allBrands.size} unique brands.`);
  
  const brandMap = {};
  let successCount = 0;
  let failCount = 0;
  
  for (const brand of allBrands) {
    if (!brand) continue;
    
    const cleanName = normalizeBrand(brand);
    const filename = `${cleanName}.png`;
    const filepath = path.join(PUBLIC_DIR, filename);
    const url = `https://logo.clearbit.com/${cleanName}.com`;
    
    process.stdout.write(`Downloading ${brand} (${url})... `);
    
    // Check if exists first to avoid re-downloading if run multiple times
    if (fs.existsSync(filepath)) {
      console.log('Exists.');
      brandMap[brand] = `/images/brands/${filename}`;
      successCount++;
      continue;
    }
    
    const success = await downloadImage(url, filepath);
    if (success) {
      console.log('Done.');
      brandMap[brand] = `/images/brands/${filename}`;
      successCount++;
    } else {
      console.log('Failed.');
      failCount++;
      // Try .com.tr for some local brands? Or just leave it blank.
      // For now we just log it.
    }
    
    // Be nice to the API
    await new Promise(r => setTimeout(r, 100));
  }
  
  // Write index file
  fs.writeFileSync(
    path.join(DATA_DIR, 'brand-logos.json'),
    JSON.stringify(brandMap, null, 2)
  );
  
  console.log(`\nSummary:`);
  console.log(`Total: ${allBrands.size}`);
  console.log(`Downloaded: ${successCount}`);
  console.log(`Failed: ${failCount}`);
  console.log(`Index saved to src/data/brand-logos.json`);
};

main();
