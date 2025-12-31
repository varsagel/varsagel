
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

// --- Load Data Sources ---
const generatedAutoPath = path.join(process.cwd(), 'src', 'data', 'generated-automobil.json');
const extraBrandsPath = path.join(process.cwd(), 'src', 'data', 'extra-brands.ts');

// Helper to extract brands from extra-brands.ts (simple regex parsing)
function getBrandsFromExtra(key: string): string[] {
  try {
    const content = fs.readFileSync(extraBrandsPath, 'utf-8');
    // Find the section for the key
    const sectionRegex = new RegExp(`'${key}':\\s*{([^}]+)}`, 's');
    const match = content.match(sectionRegex);
    if (!match) return [];
    
    const block = match[1];
    const brands: string[] = [];
    const brandRegex = /'([^']+)'\s*:\s*\[/g;
    let brandMatch;
    while ((brandMatch = brandRegex.exec(block)) !== null) {
      brands.push(brandMatch[1]);
    }
    return brands;
  } catch (e) {
    return [];
  }
}

// 1. Otomobil
let carBrands: string[] = [];
try {
  const data = JSON.parse(fs.readFileSync(generatedAutoPath, 'utf-8'));
  carBrands = Object.keys(data.modelSeries?.['vasita/otomobil'] || {}).sort();
} catch (e) { console.warn('Automobil data missing'); }

// 2. SUV
const suvBrands = getBrandsFromExtra('vasita/arazi-suv-pickup').sort();

// 3. Motosiklet
const motoBrands = getBrandsFromExtra('vasita/motosiklet').sort();

// 4. Minivan & Panelvan
const minivanBrands = getBrandsFromExtra('vasita/minivan-panelvan').sort();

// 5. Kamyon & Çekici
const truckBrands = getBrandsFromExtra('vasita/kamyon-cekici').sort();

// 6. Traktör
const tractorBrands = getBrandsFromExtra('vasita/traktor').sort();

// --- Manual Lists for Missing Categories ---

const busBrands = ['Mercedes-Benz', 'MAN', 'Temsa', 'Otokar', 'Isuzu', 'Mitsubishi', 'Setra', 'Neoplan', 'Volvo', 'Scania', 'BMC', 'Karsan', 'Güleryüz'].sort();

const minibusBrands = ['Mercedes-Benz', 'Volkswagen', 'Ford', 'Fiat', 'Peugeot', 'Citroen', 'Iveco', 'Isuzu', 'Karsan', 'Renault', 'Opel', 'Otokar', 'BMC'].sort();

const atvUtvBrands = ['Polaris', 'Can-Am', 'CFMoto', 'Kuba', 'Segway', 'Yamaha', 'Honda', 'Kawasaki', 'Arctic Cat', 'Mondial', 'Arora', 'RKS', 'TGB', 'Access Motor'].sort();

const marineBrands = ['Yamaha', 'Sea-Doo', 'Jeanneau', 'Beneteau', 'Bavaria', 'Azimut', 'Princess', 'Sunseeker', 'Fairline', 'Bayliner', 'Boston Whaler', 'Mercury', 'Honda Marine', 'Tohatsu', 'Suzuki Marine', 'Volvo Penta', 'Yanmar', 'Custom', 'Yerli Yapım'].sort();

const airBrands = ['Cessna', 'Piper', 'Beechcraft', 'Boeing', 'Airbus', 'Bombardier', 'Gulfstream', 'Bell', 'Robinson', 'Diamond', 'Cirrus', 'Pilatus', 'Embraer', 'Dassault', 'AgustaWestland', 'Eurocopter'].sort();

const caravanBrands = ['Hymer', 'Adria', 'Eriba', 'Crawler', 'Erba', 'Saly', 'Başoğlu', 'Hotomobil', 'Shantigo', 'Knaus', 'Bürstner', 'Dethleffs', 'Hobby', 'Fendt', 'Tabbert', 'Weinsberg', 'Challenger', 'Chausson', 'Winnebago', 'Airstream'].sort();

// Categories that use the "Car + SUV" list (Rental, Damaged, Classic, Electric, Disabled)
// We'll combine Car + SUV + Minivan for these generally
const generalBrands = Array.from(new Set([...carBrands, ...suvBrands, ...minivanBrands])).sort();
const electricBrands = ['Tesla', 'Togg', 'BYD', 'MG', 'Skywell', 'Leapmotor', 'Seres', 'Renault', 'Zoe', 'BMW i', 'Mercedes-EQ', 'Audi e-tron', 'Porsche Taycan', 'Citroen Ami', 'Opel', 'Peugeot', 'Volvo Recharge', 'Kia EV', 'Hyundai Ioniq', 'Mini Electric'].sort();

// --- Category Configuration ---
const categories = [
  { name: 'Otomobil', brands: carBrands },
  { name: 'Arazi, SUV & Pickup', brands: suvBrands },
  { name: 'Motosiklet', brands: motoBrands },
  { name: 'Minivan & Panelvan', brands: minivanBrands },
  { name: 'Ticari Araçlar', brands: minivanBrands }, // Use minivan list as base
  { name: 'Kamyon & Çekici', brands: truckBrands },
  { name: 'Otobüs', brands: busBrands },
  { name: 'Minibüs & Midibüs', brands: minibusBrands },
  { name: 'Traktör', brands: tractorBrands },
  { name: 'Kiralık Araçlar', brands: generalBrands },
  { name: 'Hasarlı Araçlar', brands: generalBrands },
  { name: 'Klasik Araçlar', brands: generalBrands },
  { name: 'Elektrikli Araçlar', brands: electricBrands },
  { name: 'Deniz Araçları', brands: marineBrands },
  { name: 'Hava Araçları', brands: airBrands },
  { name: 'ATV & UTV', brands: atvUtvBrands },
  { name: 'Karavan', brands: caravanBrands },
  { name: 'Engelli Plakalı Araçlar', brands: generalBrands },
];

// --- Create Workbook ---
const wb = XLSX.utils.book_new();
const headers = ['Marka', 'Model', 'Motor/Seri', 'Donanım/Paket'];

// Prepare Reference Sheet Data
// We will put each category's brands in a column in the "Referanslar" sheet
// Row 1: Category Name (Header)
// Row 2+: Brands
const refSheetData: any[][] = [];
const maxBrandCount = Math.max(...categories.map(c => c.brands.length));

// Initialize ref sheet with headers
const refHeaders = categories.map(c => c.name);
refSheetData.push(refHeaders);

// Fill rows
for (let i = 0; i < maxBrandCount; i++) {
  const row: string[] = [];
  categories.forEach(cat => {
    row.push(cat.brands[i] || ''); // Add brand or empty string
  });
  refSheetData.push(row);
}

const wsRef = XLSX.utils.aoa_to_sheet(refSheetData);
XLSX.utils.book_append_sheet(wb, wsRef, 'Referanslar');

// --- Create Category Sheets ---
categories.forEach((cat, index) => {
  const ws = XLSX.utils.aoa_to_sheet([headers]);
  
  // Set column widths
  ws['!cols'] = [{ wch: 20 }, { wch: 25 }, { wch: 25 }, { wch: 30 }];

  // Add Data Validation for 'Marka' (Column A)
  // The brands for this category are in the 'Referanslar' sheet at column index `index`
  // Excel columns: A=0, B=1, C=2, ...
  const colLetter = XLSX.utils.encode_col(index); // e.g., 'A', 'B', ...
  const brandCount = cat.brands.length;
  
  if (brandCount > 0) {
    const validation = {
      sqref: 'A2:A1000',
      type: 'list',
      operator: 'equal',
      formula1: `'Referanslar'!$${colLetter}$2:$${colLetter}$${brandCount + 1}`,
      showErrorMessage: true,
      errorTitle: 'Geçersiz Marka',
      error: 'Lütfen listeden bir marka seçiniz.'
    };
    
    // @ts-ignore
    if (!ws['!dataValidation']) ws['!dataValidation'] = [];
    // @ts-ignore
    ws['!dataValidation'].push(validation);
  }

  // Sanitize sheet name (Excel limit 31 chars, no special chars like : \ / ? * [ ])
  let safeName = cat.name.replace(/[\/\\\?\*\[\]]/g, '-').substring(0, 31);
  
  // Handle duplicate names if any (unlikely here)
  if (wb.SheetNames.includes(safeName)) {
    safeName = safeName.substring(0, 28) + '_' + index;
  }

  XLSX.utils.book_append_sheet(wb, ws, safeName);
});

// Write file
const fileName = 'vasita-kategorili-sablon.xlsx';
XLSX.writeFile(wb, fileName);

console.log(`Created ${fileName} with ${categories.length} category sheets.`);
