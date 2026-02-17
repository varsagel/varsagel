const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const EMLAK_SLUG = 'emlak';
const EXCEL_PATH = 'c:\\varsagel\\varsagel\\kategoriler\\EMLAK kategori çalışması en son.xlsx';

// ----------------------------------------------------------------------------
// 1. ATTRIBUTE DEFINITIONS (Expanded)
// ----------------------------------------------------------------------------
const ATTRIBUTES = {
  // Existing
  ODA_SAYISI: { name: 'Oda Sayısı', slug: 'oda-sayisi', type: 'select', options: ['1+0', '1+1', '2+0', '2+1', '2+2', '3+1', '3+2', '4+1', '4+2', '4+3', '4+4', '5+1', '5+2', '5+3', '5+4', '6+1', '6+2', '6+3', '7+1', '7+2', '7+3', '8+1', '8+2', '8+3', '9+1', '10+ Üzeri'] },
  BINA_YASI: { name: 'Bina Yaşı', slug: 'bina-yasi', type: 'select', options: ['0', '1', '2', '3', '4', '5-10 Arası', '11-15 Arası', '16-20 Arası', '21-25 Arası', '26-30 Arası', '31 ve Üzeri'] },
  BULUNDUGU_KAT: { name: 'Bulunduğu Kat', slug: 'bulundugu-kat', type: 'select', options: ['Kot 1', 'Kot 2', 'Kot 3', 'Bodrum Kat', 'Zemin Kat', 'Bahçe Katı', 'Giriş Katı', 'Yüksek Giriş', 'Müstakil', 'Villa Tipi', 'Çatı Katı', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21-30 Arası', '30 ve Üzeri'] },
  KAT_SAYISI: { name: 'Kat Sayısı', slug: 'kat-sayisi', type: 'number' },
  ISITMA: { name: 'Isıtma', slug: 'isitma', type: 'select', options: ['Kombi (Doğalgaz)', 'Kombi (Elektrik)', 'Merkezi', 'Merkezi (Pay Ölçer)', 'Soba (Doğalgaz)', 'Soba (Kömür)', 'Kat Kaloriferi', 'Klima', 'Yerden Isıtma', 'Jeotermal', 'Güneş Enerjisi', 'VRV', 'Isı Pompası', 'Yok'] },
  BANYO_SAYISI: { name: 'Banyo Sayısı', slug: 'banyo-sayisi', type: 'select', options: ['1', '2', '3', '4', '5', '6', 'Yok'] },
  BALKON: { name: 'Balkon', slug: 'balkon', type: 'boolean' },
  ESYALI: { name: 'Eşyalı', slug: 'esyali', type: 'boolean' },
  SITE_ICERISINDE: { name: 'Site İçerisinde', slug: 'site-icerisinde', type: 'boolean' },
  KREDIYE_UYGUN: { name: 'Krediye Uygun', slug: 'krediye-uygun', type: 'boolean' },
  METREKARE_BRUT: { name: 'Metrekare (Brüt)', slug: 'metrekare-brut', type: 'number' },
  METREKARE_NET: { name: 'Metrekare (Net)', slug: 'metrekare-net', type: 'range-number', minKey: 'metrekareMin', maxKey: 'metrekareMax' }, 
  METREKARE: { name: 'Metrekare', slug: 'metrekare', type: 'range-number', minKey: 'metrekareMin', maxKey: 'metrekareMax' }, // Changed to range-number
  IMAR_DURUMU: { name: 'İmar Durumu', slug: 'imar-durumu', type: 'select', options: ['Ada', 'Konut', 'Ticari', 'Ticari + Konut', 'Turizm + Konut', 'Sanayi', 'Tarla', 'Bağ & Bahçe', 'Zeytinlik', 'Depo', 'Eğitim', 'Sağlık', 'Spor Alanı', 'Park', 'Diğer'] },
  KAKS_EMSAL: { name: 'Kaks (Emsal)', slug: 'kaks-emsal', type: 'select', options: ['0.10', '0.15', '0.20', '0.25', '0.30', '0.35', '0.40', '0.45', '0.50', '0.60', '0.70', '0.80', '0.90', '1.00', '1.10', '1.20', '1.25', '1.30', '1.40', '1.50', '1.60', '1.75', '2.00', '2.25', '2.50', '2.75', '3.00', 'Belirtilmemiş'] },
  GABARI: { name: 'Gabari', slug: 'gabari', type: 'select', options: ['Serbest', '3.50', '6.50', '9.50', '12.50', '15.50', '18.50', '21.50', '24.50', '27.50', '30.50', 'Belirtilmemiş'] },
  TAPU_DURUMU: { name: 'Tapu Durumu', slug: 'tapu-durumu', type: 'select', options: ['Müstakil Parsel', 'Hisseli Tapu', 'Zilyetlik', 'Tahsis', 'Bilinmiyor', 'Kat Mülkiyetli', 'Kat İrtifaklı'] },
  TESIS_TIPI: { name: 'Tesis Tipi', slug: 'tesis-tipi', type: 'select', options: ['Otel', 'Butik Otel', 'Pansiyon', 'Apart Otel', 'Motel', 'Camping', 'Tatil Köyü', 'Plaj', 'Restoran'] },
  YILDIZ_SAYISI: { name: 'Yıldız Sayısı', slug: 'yildiz-sayisi', type: 'select', options: ['1', '2', '3', '4', '5', '7', 'Belirtilmemiş'] },
  YATAK_KAPASITESI: { name: 'Yatak Kapasitesi', slug: 'yatak-kapasitesi', type: 'number' },
  ACIK_ALAN: { name: 'Açık Alan (m²)', slug: 'acik-alan', type: 'range-number', minKey: 'acikAlanMin', maxKey: 'acikAlanMax' },
  KAPALI_ALAN: { name: 'Kapalı Alan (m²)', slug: 'kapali-alan', type: 'range-number', minKey: 'kapaliAlanMin', maxKey: 'kapaliAlanMax' },
  ODA_BOLUM_SAYISI: { name: 'Oda/Bölüm Sayısı', slug: 'oda-bolum-sayisi', type: 'select', options: ['Tek Bölüm', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10+'] },
  AIDAT: { name: 'Aidat (TL)', slug: 'aidat', type: 'number' },
  DEPOZITO: { name: 'Depozito (TL)', slug: 'depozito', type: 'number' },
  MAHALLE: { name: 'Mahalle', slug: 'mahalle', type: 'text' },
  
  // New Attributes
  ASANSOR: { name: 'Asansör', slug: 'asansor', type: 'boolean' },
  OTOPARK: { name: 'Otopark', slug: 'otopark', type: 'select', options: ['Açık', 'Kapalı', 'Açık & Kapalı', 'Yok'] },
  KULLANIM_DURUMU: { name: 'Kullanım Durumu', slug: 'kullanim-durumu', type: 'select', options: ['Boş', 'Kiracılı', 'Mülk Sahibi Oturuyor'] },
  TAKASLI: { name: 'Takaslı', slug: 'takasli', type: 'boolean' },
  REZIDANS: { name: 'Rezidans', slug: 'rezidans', type: 'boolean' },

  // Added based on analysis
  ARAZI_M2: { name: 'Arazi M2', slug: 'arazi-m2', type: 'range-number', minKey: 'araziM2Min', maxKey: 'araziM2Max' },
  GIRIS_YUKSEKLIGI: { name: 'Giriş Yüksekliği (m)', slug: 'giris-yuksekligi', type: 'number' },
  KISI_KAPASITESI: { name: 'Kişi Kapasitesi', slug: 'kisi-kapasitesi', type: 'number' },
  MASA_SAYISI: { name: 'Masa Sayısı', slug: 'masa-sayisi', type: 'number' },
  ARAC_KAPASITESI: { name: 'Araç Kapasitesi', slug: 'arac-kapasitesi', type: 'number' },
  DEVRE_MULK_ADI: { name: 'Devre Mülk Adı', slug: 'devre-mulk-adi', type: 'select', options: [] },
  DONEM: { name: 'Dönem', slug: 'donem', type: 'select', options: [] },
  SURE: { name: 'Süre', slug: 'sure', type: 'select', options: [] },
  YAPI_DURUMU: { name: 'Yapı Durumu', slug: 'yapi-durumu', type: 'select', options: ['İkinci El', 'Sıfır', 'İnşaat Halinde'] },
  YAPI_TIPI: { name: 'Yapı Tipi', slug: 'yapi-tipi', type: 'select', options: ['Ahşap', 'Kütük', 'Çelik', 'Prefabrik', 'Betonarme'] },
  BINA_TIPI: { name: 'Bina Tipi', slug: 'bina-tipi', type: 'select', options: [] },
  RUHSAT_DURUMU: { name: 'Ruhsat Durumu', slug: 'ruhsat-durumu', type: 'text' },
  ALKOL_RUHSATI: { name: 'Alkol Ruhsatı', slug: 'alkol-ruhsati', type: 'boolean' },
  BINA_ADEDI: { name: 'Bina Adedi', slug: 'bina-adedi', type: 'number' },
  BIR_KATTAKI_DAIRE: { name: 'Bir Kattaki Daire', slug: 'bir-kattaki-daire', type: 'select', options: [] },
  TAVAN_YUKSEKLIGI: { name: 'Tavan Yüksekliği', slug: 'tavan-yuksekligi', type: 'number' },
  
  // New Range Attributes
  ADA_NO: { name: 'Ada No', slug: 'ada-no', type: 'range-number', minKey: 'adaNoMin', maxKey: 'adaNoMax' },
  PARSEL_NO: { name: 'Parsel No', slug: 'parsel-no', type: 'range-number', minKey: 'parselNoMin', maxKey: 'parselNoMax' },
  METREKARE_FIYATI: { name: 'Metrekare Fiyatı', slug: 'metrekare-fiyati', type: 'range-number', minKey: 'metrekareFiyatiMin', maxKey: 'metrekareFiyatiMax' },

  // Turistik Tesis Ranges
  ODA_SAYISI_RANGE: { name: 'Oda Sayısı', slug: 'oda-sayisi-range', type: 'range-number', minKey: 'odaSayisiMin', maxKey: 'odaSayisiMax' },
  YATAK_SAYISI_RANGE: { name: 'Yatak Sayısı', slug: 'yatak-sayisi-range', type: 'range-number', minKey: 'yatakSayisiMin', maxKey: 'yatakSayisiMax' },
  KAT_SAYISI_RANGE: { name: 'Kat Sayısı', slug: 'kat-sayisi-range', type: 'range-number', minKey: 'katSayisiMin', maxKey: 'katSayisiMax' },
  BINA_YASI_RANGE: { name: 'Bina Yaşı', slug: 'bina-yasi-range', type: 'range-number', minKey: 'binaYasiMin', maxKey: 'binaYasiMax' },
  APART_SAYISI: { name: 'Apart Sayısı', slug: 'apart-sayisi', type: 'range-number', minKey: 'apartSayisiMin', maxKey: 'apartSayisiMax' },
  TOPLAM_ARAZI: { name: 'Toplam Arazi (Dönüm)', slug: 'toplam-arazi', type: 'range-number', minKey: 'toplamAraziMin', maxKey: 'toplamAraziMax' },

  // Generic fallback
  TEXT: { type: 'text' }
};

// Helper to map Excel headers/values to Attribute Config
function mapAttribute(excelName) {
  if (!excelName) return null;
  const upper = excelName.toString().toLocaleUpperCase('tr-TR').trim();
  
  // Skip if attribute name matches a category name (likely data error)
  if (['APART OTEL', 'BUTİK OTEL', 'MOTEL', 'OTEL', 'PANSİYON', 'TATİL KÖYÜ', 'KAMP YERİ'].some(k => upper.includes(k))) return null;

  if (upper.includes('ODA SAYISI') || upper.includes('ORDA SAYISI') || upper.includes('BÖLÜM ODA')) return ATTRIBUTES.ODA_SAYISI;
  if (upper.includes('BİNA YAŞI') || upper.includes('BINA YASI')) return ATTRIBUTES.BINA_YASI;
  if (upper.includes('BULUNDUĞU KAT') || upper.includes('BULUDNUĞU KAT')) return ATTRIBUTES.BULUNDUGU_KAT;
  if (upper.includes('KAT SAYISI')) return ATTRIBUTES.KAT_SAYISI;
  if (upper.includes('ISITMA')) return ATTRIBUTES.ISITMA;
  if (upper.includes('BANYO')) return ATTRIBUTES.BANYO_SAYISI;
  if (upper.includes('BALKON')) return ATTRIBUTES.BALKON;
  if (upper.includes('EŞYALI') || upper.includes('ESYALI')) return ATTRIBUTES.ESYALI;
  if (upper.includes('SİTE')) return ATTRIBUTES.SITE_ICERISINDE;
  if (upper.includes('KREDİ')) return ATTRIBUTES.KREDIYE_UYGUN;
  
  // Area Mappings
  if (upper.includes('ARAZİ M2')) return ATTRIBUTES.ARAZI_M2;
  if (upper.includes('AÇIK ALAN')) return ATTRIBUTES.ACIK_ALAN;
  if (upper.includes('KAPALI ALAN')) return ATTRIBUTES.KAPALI_ALAN;
  if (upper.includes('M2') && upper.includes('NET')) return ATTRIBUTES.METREKARE_NET;
  if (upper.includes('M2') && upper.includes('BRÜT')) return ATTRIBUTES.METREKARE_BRUT;
  if (upper.includes('M2')) return ATTRIBUTES.METREKARE; 
  
  if (upper.includes('İMAR') || upper.includes('IMAR')) return ATTRIBUTES.IMAR_DURUMU;
  if (upper.includes('KAKS') || upper.includes('EMSAL')) return ATTRIBUTES.KAKS_EMSAL;
  if (upper.includes('GABARİ')) return ATTRIBUTES.GABARI;
  if (upper.includes('TAPU')) return ATTRIBUTES.TAPU_DURUMU;
  if (upper.includes('ASANSÖR') && !upper.includes('SAYISI')) return ATTRIBUTES.ASANSOR; // Avoid matching 'Asansör Sayısı' if we want that separate?
  if (upper.includes('ASANSÖR SAYISI')) return { name: 'Asansör Sayısı', slug: 'asansor-sayisi', type: 'number' };
  
  if (upper.includes('OTOPARK')) return ATTRIBUTES.OTOPARK;
  if (upper.includes('KULLANIM') || upper.includes('KİRACILI')) return ATTRIBUTES.KULLANIM_DURUMU;
  if (upper.includes('TAKAS')) return ATTRIBUTES.TAKASLI;
  if (upper.includes('MAHALLE')) return ATTRIBUTES.MAHALLE;
  if (upper.includes('AİDAT')) return ATTRIBUTES.AIDAT;
  if (upper.includes('DEPOZİTO')) return ATTRIBUTES.DEPOZITO;
  if (upper.includes('DEVREN')) return { name: 'Devren', slug: 'devren', type: 'boolean' };
  
  // Range Mappings (Explicit names in col4)
  if (upper.includes('ADA') && !upper.includes('ADEDİ')) return ATTRIBUTES.ADA_NO;
  if (upper.includes('PARSEL')) return ATTRIBUTES.PARSEL_NO;
  if (upper.includes('M2') && upper.includes('FİYAT')) return ATTRIBUTES.METREKARE_FIYATI;

  
  // New Mappings
  if (upper.includes('GİRİŞ YÜKSEKLİĞİ') || upper.includes('GİRİŞ YÜKSELİĞİ')) return ATTRIBUTES.GIRIS_YUKSEKLIGI;
  if (upper.includes('KİŞİ KAPASİTESİ')) return ATTRIBUTES.KISI_KAPASITESI;
  if (upper.includes('MASA SAYISI')) return ATTRIBUTES.MASA_SAYISI;
  if (upper.includes('ARAÇ KAPASİTESİ')) return ATTRIBUTES.ARAC_KAPASITESI;
  if (upper.includes('DEVRE MÜLK ADI')) return ATTRIBUTES.DEVRE_MULK_ADI;
  if (upper.includes('DÖNEM')) return ATTRIBUTES.DONEM;
  if (upper.includes('SÜRE')) return ATTRIBUTES.SURE;
  if (upper.includes('YAPI DURUMU') || upper.includes('YAPININ DURUMU')) return ATTRIBUTES.YAPI_DURUMU;
  if (upper.includes('YAPI TİPİ')) return ATTRIBUTES.YAPI_TIPI;
  if (upper.includes('BİNA TİPİ') || upper.includes('BİNA TİP')) return ATTRIBUTES.BINA_TIPI;
  if (upper.includes('RUHSAT')) return ATTRIBUTES.RUHSAT_DURUMU; // Catch generic Ruhsat
  if (upper.includes('ALKOL')) return ATTRIBUTES.ALKOL_RUHSATI;
  if (upper.includes('BİNA ADEDİ')) return ATTRIBUTES.BINA_ADEDI;
  if (upper.includes('TAVAN YÜKSEKLİĞİ')) return ATTRIBUTES.TAVAN_YUKSEKLIGI;
  if (upper.includes('YATAK')) return ATTRIBUTES.YATAK_KAPASITESI;
  if (upper.includes('BİR KATTAKİ DAİRE') || upper.includes('BIR KATTAKI DAIRE')) return ATTRIBUTES.BIR_KATTAKI_DAIRE;

  if (upper.includes('DEVAM EDIYOR')) return { name: 'Devam Ediyor', slug: 'devam-ediyor', type: 'boolean' };
  if (upper.includes('TAMAMLANDI')) return { name: 'Tamamlandı', slug: 'tamamlandi', type: 'boolean' };

  // Fallback: Create a text attribute
  return {
    name: excelName,
    slug: trSlug(excelName.toString()),
    type: 'text',
    isFallback: true 
  };
}

// Helper to detect Range Attributes from Col 5 (when Col 4 is empty)
        function detectRangeAttribute(colValue) {
            if (!colValue) return null;
            const upper = colValue.toString().toLocaleUpperCase('tr-TR').trim();

            // Specific M2 types first
            if (upper.includes('AÇIK ALAN') && upper.includes('M2')) return ATTRIBUTES.ACIK_ALAN;
            if (upper.includes('KAPALI ALAN') && upper.includes('M2')) return ATTRIBUTES.KAPALI_ALAN;

            if (upper.includes('M2 FİYATI')) return ATTRIBUTES.METREKARE_FIYATI;
            if (upper.includes('M2')) return ATTRIBUTES.METREKARE;
            if (upper.includes('ADA NO')) return ATTRIBUTES.ADA_NO;
            if (upper.includes('PARSEL NO')) return ATTRIBUTES.PARSEL_NO;
            
            // Turistik Tesis Ranges
            if (upper.includes('ODA SAYISI')) return ATTRIBUTES.ODA_SAYISI_RANGE;
            if (upper.includes('YATAK SAYISI')) return ATTRIBUTES.YATAK_SAYISI_RANGE;
            if (upper.includes('KAT SAYISI')) return ATTRIBUTES.KAT_SAYISI_RANGE;
            if (upper.includes('BİNA YAŞI')) return ATTRIBUTES.BINA_YASI_RANGE;
            if (upper.includes('APART SAYISI')) return ATTRIBUTES.APART_SAYISI;
            if (upper.includes('TOPLAM ARAZİ')) return ATTRIBUTES.TOPLAM_ARAZI;

            return null;
        }

function trSlug(text) {
  const trMap = { 'ç': 'c', 'ğ': 'g', 'ı': 'i', 'İ': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u', 'Ç': 'c', 'Ğ': 'g', 'Ö': 'o', 'Ş': 's', 'Ü': 'u' };
  return text
    .replace(/[çğıİöşüÇĞÖŞÜ]/g, (match) => trMap[match])
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function normalizeCell(value) {
  return value ? value.toString().trim() : '';
}

function isRangeToken(value) {
  if (!value) return false;
  return /\bmin\b|\bmax\b/i.test(value);
}

async function main() {
  console.log('Starting Emlak Excel Processing...');
  
  if (!fs.existsSync(EXCEL_PATH)) {
    console.error('File not found:', EXCEL_PATH);
    process.exit(1);
  }

  const workbook = XLSX.readFile(EXCEL_PATH);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  // 1. Find or Create EMLAK Category
  let category = await prisma.category.findUnique({ where: { slug: EMLAK_SLUG } });
  if (!category) {
    console.log('Creating EMLAK category...');
    category = await prisma.category.create({
      data: { name: 'Emlak', slug: EMLAK_SLUG, icon: '🏠' }
    });
  }
  
  // 2. Clear Existing Subcategories and Attributes for EMLAK
  console.log('Cleaning existing subcategories...');
  await prisma.subCategory.deleteMany({ where: { categoryId: category.id } });
  await prisma.categoryAttribute.deleteMany({ where: { categoryId: category.id } });

  // 3. Parse Hierarchy
  let lastL1 = '';
  let lastL2 = '';
  let lastL3 = '';
  let currentSubCategory = null;
  let subCategoriesMap = new Map(); // slug -> { name, attributes: [] }

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;

    const raw0 = normalizeCell(row[0]);
    const shifted = raw0 && raw0.toLocaleUpperCase('tr-TR') !== 'EMLAK';
    const baseIndex = shifted ? 0 : 1;

    const col1 = normalizeCell(row[baseIndex]); // Level 1 (KONUT)
    const col2 = normalizeCell(row[baseIndex + 1]); // Level 2 (SATILIK)
    const col3 = normalizeCell(row[baseIndex + 2]); // Level 3 (DAİRE)
    const col4 = normalizeCell(row[baseIndex + 3]); // Attribute Name
    const col5 = normalizeCell(row[baseIndex + 4]);
    const col6 = normalizeCell(row[baseIndex + 5]);
    const col7 = normalizeCell(row[baseIndex + 6]);
    
    // Update Hierarchy
    if (col1 && col1 !== lastL1) { 
        lastL1 = col1; 
        lastL2 = ''; 
        lastL3 = ''; 
    } else if (col1) {
        lastL1 = col1;
    }
    
    // Determine Group based on Root Category (L1)
    
    let attributeName = col4;
    let optionCells = [];

    if (attributeName) {
      optionCells = [col5, col6, col7].filter(Boolean);
    } else {
      const attributeCandidates = [col5, col6, col7].filter(Boolean);
      let attributeIndex = -1;
      for (let i = 0; i < attributeCandidates.length; i++) {
        const candidate = attributeCandidates[i];
        if (isRangeToken(candidate)) {
          attributeIndex = i;
          break;
        }
        const mapped = mapAttribute(candidate);
        if (mapped && !mapped.isFallback) {
          attributeIndex = i;
          break;
        }
      }
      if (attributeIndex >= 0) {
        attributeName = attributeCandidates[attributeIndex];
        optionCells = attributeCandidates.slice(attributeIndex + 1);
      } else {
        attributeName = '';
        optionCells = attributeCandidates;
      }
    }

    // Depth 3: L1 -> L2 -> L3
    if (col2 && col2 !== lastL2) {
         lastL2 = col2; 
         lastL3 = ''; 
    } else if (col2) {
         lastL2 = col2;
    }

    if (col3) { 
         // Ignore "Proje Durumu" for Konut Projeleri
         if (lastL1 === 'Konut Projeleri' && col3 === 'Proje Durumu') {
             // Skip
         } else if (col3.includes('Harita G')) {
             // Skip
         } else {
             lastL3 = col3; 
         }
    }

    // Define SubCategory
    const parts = [lastL1, lastL2, lastL3].filter(Boolean);
    
    if (parts.length > 0) {
        const slug = parts.map(p => trSlug(p)).join('-');
        const name = parts.map(p => p.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')).join(' ');

        if (!subCategoriesMap.has(slug)) {
            subCategoriesMap.set(slug, {
                name: name,
                slug: slug,
                attributes: [],
                lastAttribute: null
            });
        }
        currentSubCategory = subCategoriesMap.get(slug);
    }

    // Process Attribute
    if (currentSubCategory) {
        if (attributeName) {
            // New Attribute
            const attrConfig = mapAttribute(attributeName);
            if (attrConfig) {
                // If options found in next column, add it
                if (optionCells.length > 0) {
                    // Check if we should append options
                    // If type is range-number, usually no options, but we might check
                    if (attrConfig.type !== 'range-number' && attrConfig.type !== 'boolean') {
                        if (!attrConfig.options) attrConfig.options = [];
                        const filteredOptions = optionCells.filter((opt) => opt && !isRangeToken(opt));
                        for (const opt of filteredOptions) {
                          if (!attrConfig.options.includes(opt.toString())) {
                            attrConfig.options.push(opt.toString());
                          }
                        }
                    }
                }
                
                // Check if attribute with this slug already exists
                let existingAttr = currentSubCategory.attributes.find(a => a.slug === attrConfig.slug);

                if (existingAttr) {
                     // Merge options
                     if (attrConfig.options) {
                         if (!existingAttr.options) existingAttr.options = [];
                         for (const opt of attrConfig.options) {
                             if (!existingAttr.options.includes(opt)) {
                                 existingAttr.options.push(opt);
                             }
                         }
                     }
                     if (existingAttr.type !== 'range-number' && existingAttr.type !== 'boolean') {
                       currentSubCategory.lastAttribute = existingAttr;
                     }
                } else {
                    currentSubCategory.attributes.push(attrConfig);
                    if (attrConfig.type !== 'range-number' && attrConfig.type !== 'boolean') {
                      currentSubCategory.lastAttribute = attrConfig;
                    }
                }
            }
        } else if (optionCells.length > 0 && currentSubCategory.lastAttribute) {
            const lastAttr = currentSubCategory.lastAttribute;
            if (lastAttr.type !== 'range-number' && lastAttr.type !== 'boolean') {
                if (!lastAttr.options) lastAttr.options = [];
                const filteredOptions = optionCells.filter((opt) => opt && !isRangeToken(opt));
                for (const opt of filteredOptions) {
                  if (!lastAttr.options.includes(opt.toString())) {
                      lastAttr.options.push(opt.toString());
                  }
                }
            }
        }
    }
  }

  for (const subCatData of subCategoriesMap.values()) {
    if (!subCatData.attributes.some((attr) => attr.slug === ATTRIBUTES.MAHALLE.slug)) {
      subCatData.attributes.push(ATTRIBUTES.MAHALLE);
    }
  }

  // 4. Write to DB
  console.log(`Found ${subCategoriesMap.size} subcategories.`);
  
  for (const [slug, subCatData] of subCategoriesMap) {
    console.log(`Processing: ${subCatData.name} (${slug}) with ${subCatData.attributes.length} attributes`);
    
    // Create SubCategory
    const subCategory = await prisma.subCategory.create({
        data: {
            name: subCatData.name,
            slug: slug,
            categoryId: category.id
        }
    });

    // Create Attributes
    let order = 1;
    for (const attr of subCatData.attributes) {
        
        const data = {
            categoryId: category.id,
            subCategoryId: subCategory.id,
            name: attr.name.toString(),
            slug: attr.slug,
            type: attr.type,
            optionsJson: attr.options ? JSON.stringify(attr.options) : 
                         (attr.minKey || attr.maxKey) ? JSON.stringify({ minKey: attr.minKey, maxKey: attr.maxKey }) : null,
            order: order++,
            showInOffer: true,
            showInRequest: true
        };

        await prisma.categoryAttribute.create({ data });
    }
  }

  console.log('Migration completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
