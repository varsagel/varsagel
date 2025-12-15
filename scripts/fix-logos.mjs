
import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOGO_DIR = path.join(__dirname, '../public/images/brands');
const BRAND_LOGOS_JSON = path.join(__dirname, '../src/data/brand-logos.json');

// Ensure directory exists
if (!fs.existsSync(LOGO_DIR)) {
  fs.mkdirSync(LOGO_DIR, { recursive: true });
}

// Map of brands to their official domains or logo sources
const BRAND_DOMAINS = {
  // Vehicles
  'BMW': 'bmw.com.tr',
  'Mercedes': 'mercedes-benz.com.tr',
  'Audi': 'audi.com.tr',
  'Volkswagen': 'vw.com.tr',
  'Renault': 'renault.com.tr',
  'Peugeot': 'peugeot.com.tr',
  'Citroën': 'citroen.com.tr',
  'Toyota': 'toyota.com.tr',
  'Honda': 'honda.com.tr',
  'Hyundai': 'hyundai.com.tr',
  'Kia': 'kia.com.tr',
  'Ford': 'ford.com.tr',
  'Fiat': 'fiat.com.tr',
  'Opel': 'opel.com.tr',
  'Skoda': 'skoda.com.tr',
  'Volvo': 'volvocars.com',
  'Nissan': 'nissan.com.tr',
  'Seat': 'seat.com.tr',
  'Alfa Romeo': 'alfaromeo.com.tr',
  'Subaru': 'subaru.com.tr',
  'Mazda': 'mazda.com.tr',
  'Mini': 'mini.com.tr',
  'Land Rover': 'landrover.com.tr',
  'Porsche': 'porsche.com.tr',
  'Jaguar': 'jaguar.com.tr',
  'Bentley': 'bentleymotors.com',
  'Rolls-Royce': 'rolls-roycemotorcars.com',
  'Aston Martin': 'astonmartin.com',
  'Ferrari': 'ferrari.com',
  'Lamborghini': 'lamborghini.com',
  'Maserati': 'maserati.com',
  'Dacia': 'dacia.com.tr',
  'Jeep': 'jeep.com',
  'Mitsubishi': 'mitsubishi-motors.com.tr',
  'Isuzu': 'isuzu.com.tr',
  'Tesla': 'tesla.com',
  'BYD': 'byd.com',
  'Chery': 'cherytr.com',
  'MG': 'mg-turkey.com',
  'Geely': 'geely.com.tr',
  'GWM': 'gwm.com.tr',
  'SsangYong': 'ssangyong.com.tr',
  'NIO': 'nio.com',
  'Rivian': 'rivian.com',
  'TOGG': 'togg.com.tr',
  'Cupra': 'cupraofficial.com.tr',
  'Smart': 'smart.com',
  
  // Spare Parts
  'Bosch': 'bosch.com.tr',
  'Valeo': 'valeo.com',
  'NGK': 'ngkntk.com',
  'Brembo': 'brembo.com',
  'MANN': 'mann-filter.com',
  'Michelin': 'michelin.com.tr',
  'Pirelli': 'pirelli.com',
  'Continental': 'continental.com',

  // Electronics & Shopping
  'Apple': 'apple.com',
  'Samsung': 'samsung.com',
  'Xiaomi': 'mi.com',
  'Huawei': 'huawei.com',
  'LG': 'lg.com',
  'Sony': 'sony.com',
  'Arçelik': 'arcelik.com.tr',
  'Vestel': 'vestel.com.tr',
  'Philips': 'philips.com.tr',
  'Asus': 'asus.com',
  'HP': 'hp.com',
  'Dell': 'dell.com',
  'Lenovo': 'lenovo.com',

  // Construction Machinery
  'Caterpillar': 'caterpillar.com',
  'Komatsu': 'komatsu.eu',
  'Hitachi': 'hitachi.com',
  'Doosan': 'doosan.com',
  'JCB': 'jcb.com',
  'Liebherr': 'liebherr.com',

  // Home & Garden
  'IKEA': 'ikea.com.tr',
  'Koçtaş': 'koctas.com.tr',
  'Bauhaus': 'bauhaus.com.tr',
  'Fiskars': 'fiskars.com',
  'Black+Decker': 'blackanddecker.com',

  // Fashion & Sports
  'Nike': 'nike.com',
  'Adidas': 'adidas.com.tr',
  'Puma': 'puma.com',
  'LC Waikiki': 'lcwaikiki.com',
  'Zara': 'zara.com',
  'H&M': 'hm.com',
  'Mavi': 'mavi.com',
  'Decathlon': 'decathlon.com.tr',
  'Under Armour': 'underarmour.com.tr',
  'Reebok': 'reebok.com',

  // Office
  'Canon': 'canon.com.tr',
  'Epson': 'epson.com.tr',
  'Brother': 'brother.com.tr',
  'Logitech': 'logitech.com',
  'Microsoft': 'microsoft.com',

  // Baby
  'Chicco': 'chicco.com',
  'Fisher-Price': 'fisher-price.com',
  'BabyBjörn': 'babybjorn.com',
  'Kraft': 'kraftbaby.com',
  'Ebebek': 'ebebek.com',
  'Jungle': 'junglebaby.com', // Best guess
  'Mam': 'mambaby.com',

  // Agriculture
  'John Deere': 'deere.com',
  'New Holland': 'newholland.com',
  'Massey Ferguson': 'masseyferguson.com',
  'Case IH': 'caseih.com',
  'Kubota': 'kubota.com',
  'Deutz-Fahr': 'deutz-fahr.com',

  // Hobby
  'DJI': 'dji.com',
  'Lego': 'lego.com',
  'Tamiya': 'tamiya.com',
  'Fender': 'fender.com',
  'Yamaha': 'yamaha.com',
  'Nikon': 'nikon.com.tr'
};

const normalizeBrand = (brand) => {
  const trMap = {
    'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
    'Ç': 'c', 'Ğ': 'g', 'İ': 'i', 'Ö': 'o', 'Ş': 's', 'Ü': 'u',
    'ë': 'e', 'Ë': 'e', 'é': 'e', 'É': 'e', 'á': 'a', 'Á': 'a',
    'í': 'i', 'Í': 'i', 'ó': 'o', 'Ó': 'o', 'ú': 'u', 'Ú': 'u',
    'ñ': 'n', 'Ñ': 'n'
  };
  return brand.split('').map(c => trMap[c] || c).join('').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
};

const downloadImage = (url, filepath) => {
  return new Promise((resolve, reject) => {
    const options = {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    };
    
    const request = https.get(url, options, (res) => {
      if (res.statusCode === 200) {
        const file = fs.createWriteStream(filepath);
        res.pipe(file);
        file.on('finish', () => {
          file.close();
          // Check file size - updated minimum size to avoid empty/tiny files
          try {
            const stats = fs.statSync(filepath);
            if (stats.size < 500) { // < 500 bytes is likely an error page or empty
               fs.unlinkSync(filepath);
               resolve(false);
            } else {
               resolve(true);
            }
          } catch (e) {
            resolve(false);
          }
        });
      } else if (res.statusCode === 301 || res.statusCode === 302) {
        if (res.headers.location) {
            // Handle relative redirects if necessary, though usually they are absolute
            let newUrl = res.headers.location;
            if (newUrl.startsWith('/')) {
                const u = new URL(url);
                newUrl = `${u.protocol}//${u.host}${newUrl}`;
            }
            downloadImage(newUrl, filepath).then(resolve).catch(() => resolve(false));
        } else {
            resolve(false);
        }
      } else {
        resolve(false);
      }
    });
    
    request.on('error', (err) => {
      resolve(false);
    });
    
    request.setTimeout(10000, () => {
        request.destroy();
        resolve(false);
    });
  });
};

const extractBrands = (content) => {
  const brands = new Set();
  // Look for objects with key: 'marka' and extract their options
  // We use a regex that looks for key: 'marka' and then finds the associated options array
  // We assume options array comes after key: 'marka' within the same object (before })
  const brandRegex = /key:\s*'marka'[^}]*?options:\s*\[(.*?)\]/gs;
  
  let match;
  while ((match = brandRegex.exec(content)) !== null) {
     const optionsStr = match[1];
     // Split by comma, looking for quoted strings
     const itemRegex = /['"]([^'"]+)['"]/g;
     let itemMatch;
     while ((itemMatch = itemRegex.exec(optionsStr)) !== null) {
         const item = itemMatch[1];
         if (item.length > 1) {
             brands.add(item);
         }
     }
  }
  
  return brands;
};

const main = async () => {
  console.log('Scanning for brands...');
  const schemaPath = path.join(__dirname, '../src/data/attribute-schemas.ts');
  if (!fs.existsSync(schemaPath)) {
      console.error('Schema file not found!');
      return;
  }
  
  const content = fs.readFileSync(schemaPath, 'utf-8');
  const brands = extractBrands(content);
  
  console.log(`Found ${brands.size} potential brands.`);
  
  const brandLogos = {};

  for (const brand of brands) {
    // Skip if it's likely not a brand (simple heuristic)
    // But we want to be inclusive. We will check against BRAND_DOMAINS or try to find a logo.
    
    // If we don't have a domain for it, we can try a generic search or skip.
    // For this script, let's prioritize ones we know or can guess.
    
    const normalized = normalizeBrand(brand);
    const filename = `${normalized}.png`;
    const filepath = path.join(LOGO_DIR, filename);
    
    // Add to map
    brandLogos[brand] = `/images/brands/${filename}`;

    if (fs.existsSync(filepath)) {
      // process.stdout.write('.');
      continue;
    }

    console.log(`Downloading logo for: ${brand}`);
    
    let domain = BRAND_DOMAINS[brand];
    let success = false;
    
    if (domain) {
        // Try Clearbit first
        success = await downloadImage(`https://logo.clearbit.com/${domain}?size=512`, filepath);
        
        // Try favicon if Clearbit fails
        if (!success) {
             success = await downloadImage(`https://${domain}/favicon.ico`, filepath.replace('.png', '.ico'));
             // If ico, we might want to convert or just keep it. 
             // But ListingCard expects image. Browsers handle .ico but .png is better.
             // For now, let's stick to clearbit or google favicon
             if (success) {
                 // Rename .ico to .png (it won't be a real png but browsers might handle it or we fail)
                 // Actually, let's use google favicon service which returns PNG
                 fs.unlinkSync(filepath.replace('.png', '.ico'));
                 success = await downloadImage(`https://www.google.com/s2/favicons?domain=${domain}&sz=512`, filepath);
             }
        }
    } else {
        // Try guessing domain .com, .com.tr
        const domainsToTry = [`${normalized}.com`, `${normalized}.com.tr`];
        for (const d of domainsToTry) {
            success = await downloadImage(`https://logo.clearbit.com/${d}?size=512`, filepath);
            if (success) break;
        }
        if (!success) {
            // Try Google Favicon as fallback
             for (const d of domainsToTry) {
                success = await downloadImage(`https://www.google.com/s2/favicons?domain=${d}&sz=512`, filepath);
                if (success) break;
             }
        }
    }

    if (!success) {
      console.log(`Failed to download logo for ${brand}`);
      // Remove from map if we couldn't get it
      delete brandLogos[brand];
    }
  }
  
  console.log('\nGenerating brand-logos.json...');
  fs.writeFileSync(BRAND_LOGOS_JSON, JSON.stringify(brandLogos, null, 2));
  console.log('Done!');
};

main().catch(console.error);
