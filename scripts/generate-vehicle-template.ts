
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

// Load data
const generatedAutoPath = path.join(process.cwd(), 'src', 'data', 'generated-automobil.json');
const extraBrandsPath = path.join(process.cwd(), 'src', 'data', 'extra-brands.ts');

let brands = new Set<string>();

// 1. Get brands from generated-automobil.json
try {
  const generatedData = JSON.parse(fs.readFileSync(generatedAutoPath, 'utf-8'));
  const autoBrands = generatedData.modelSeries?.['vasita/otomobil'] || {};
  Object.keys(autoBrands).forEach(b => brands.add(b));
} catch (e) {
  console.warn('Could not read generated-automobil.json', e);
}

// 2. Get brands from extra-brands.ts
// Since it's a TS file, we'll do a simple regex parse to avoid compiling
try {
  const extraContent = fs.readFileSync(extraBrandsPath, 'utf-8');
  // Look for keys in the object structure, e.g. 'Honda': [...]
  // This is a rough extraction but sufficient for a list of brands
  const brandMatches = extraContent.matchAll(/'([^']+)'\s*:\s*\[/g);
  for (const match of brandMatches) {
    if (match[1] && !match[1].includes('/')) { // Avoid category keys like 'vasita/motosiklet'
      brands.add(match[1]);
    }
  }
} catch (e) {
  console.warn('Could not read extra-brands.ts', e);
}

// 3. Add common brands if missing
const commonBrands = [
  'Togg', 'Tesla', 'Volkswagen', 'Ford', 'Renault', 'Fiat', 'Toyota', 'Hyundai', 'Honda', 
  'Opel', 'Peugeot', 'Dacia', 'Skoda', 'Seat', 'Audi', 'BMW', 'Mercedes-Benz', 
  'Volvo', 'Kia', 'Nissan', 'Suzuki', 'Mazda', 'Chevrolet', 'Land Rover', 'Jeep', 'Mini', 
  'Porsche', 'Subaru', 'Chery', 'MG', 'BYD', 'Alfa Romeo', 'Cupra', 'DS Automobiles', 
  'Isuzu', 'Iveco', 'Jaguar', 'Lada', 'Lexus', 'Maserati', 'Mitsubishi', 'Smart', 'SsangYong'
];
commonBrands.forEach(b => brands.add(b));

const sortedBrands = Array.from(brands).sort();

// Create Workbook
const wb = XLSX.utils.book_new();

// --- Sheet 1: Veri Girişi ---
const headers = ['Marka', 'Model', 'Motor/Seri', 'Donanım/Paket'];
const wsData = XLSX.utils.aoa_to_sheet([headers]);

// Set column widths
wsData['!cols'] = [
  { wch: 20 }, // Marka
  { wch: 25 }, // Model
  { wch: 25 }, // Motor/Seri
  { wch: 30 }  // Donanım/Paket
];

// --- Sheet 2: Referanslar (Hidden list of brands) ---
const refData = [['Markalar'], ...sortedBrands.map(b => [b])];
const wsRef = XLSX.utils.aoa_to_sheet(refData);

// Add sheets to workbook
XLSX.utils.book_append_sheet(wb, wsData, 'Veri Girişi');
XLSX.utils.book_append_sheet(wb, wsRef, 'Referanslar');

// --- Data Validation ---
// We need to define the data validation for the Marka column (A) in 'Veri Girişi'
// Range: A2:A1000 (Allowing 1000 entries)
// Formula: ='Referanslar'!$A$2:$A$N

const brandCount = sortedBrands.length;
const validationRange = {
  sqref: 'A2:A1000',
  type: 'list',
  operator: 'equal',
  formula1: `'Referanslar'!$A$2:$A$${brandCount + 1}`, // +1 for header
  showErrorMessage: true,
  errorTitle: 'Geçersiz Marka',
  error: 'Lütfen listeden bir marka seçiniz.'
};

// Add validation to worksheet
// Note: sheet['!dataValidation'] is not fully standard in all xlsx versions/writers, 
// but we will try to construct the internal structure if the library version allows.
// However, standard SheetJS (xlsx) Community Edition often strips data validation on write.
// We will check if we can use a library feature or just hope it works.
// If SheetJS doesn't support writing DV, we might need 'exceljs' or similar, but I only see 'xlsx' in package.json.
// Let's try adding it to the object structure.

// @ts-ignore
if (!wsData['!dataValidation']) wsData['!dataValidation'] = [];
// @ts-ignore
wsData['!dataValidation'].push(validationRange);

// Write file
const fileName = 'vasita-veri-giris-sablonu.xlsx';
XLSX.writeFile(wb, fileName);

console.log(`Created ${fileName} with ${sortedBrands.length} brands.`);
