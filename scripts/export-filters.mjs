import { PrismaClient } from '@prisma/client';
import XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

function safeParseOptions(optionsJson) {
  if (!optionsJson) return [];
  try {
    const parsed = JSON.parse(optionsJson);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function toUiType(dbType) {
  if (dbType === 'checkbox') return 'boolean';
  return dbType;
}

function stableFieldId(attr) {
  const uiType = toUiType(attr.type);
  if (uiType === 'range-number') return `r:${attr.slug}`;
  return `k:${attr.slug}`;
}

function isReservedField(attr) {
  const reservedKeys = new Set(['minPrice', 'maxPrice', 'minBudget', 'budget']);
  if (reservedKeys.has(attr.slug)) return true;

  const uiType = toUiType(attr.type);
  if (uiType !== 'range-number') return false;

  const minKey = `${attr.slug}Min`;
  const maxKey = `${attr.slug}Max`;
  if (minKey === 'minPrice' && maxKey === 'maxPrice') return true;
  if (minKey === 'minBudget' && maxKey === 'budget') return true;

  return false;
}

function computeVisibleFields({ attrsForCategory, subCategoryId, mode }) {
  const visible = attrsForCategory.filter((attr) => {
    if (mode === 'request' && attr.showInRequest === false) return false;
    if (mode === 'offer' && attr.showInOffer === false) return false;
    if (!attr.subCategoryId) return true;
    return attr.subCategoryId === subCategoryId;
  });

  const ordered = visible.slice().sort((a, b) => {
    const aSpecific = a.subCategoryId ? 1 : 0;
    const bSpecific = b.subCategoryId ? 1 : 0;
    if (aSpecific !== bSpecific) return aSpecific - bSpecific;
    return (a.order ?? 0) - (b.order ?? 0);
  });

  const uniq = new Map();
  for (const attr of ordered) {
    if (isReservedField(attr)) continue;
    uniq.set(stableFieldId(attr), attr);
  }

  return Array.from(uniq.values()).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

async function exportFilters() {
  try {
    console.log('Fetching categories, subcategories and attributes...');

    const subCategories = await prisma.subCategory.findMany({
      include: {
        category: true,
      },
      orderBy: [
        { category: { name: 'asc' } },
        { name: 'asc' }
      ]
    });

    console.log(`Found ${subCategories.length} subcategories.`);

    const allAttributes = await prisma.categoryAttribute.findMany({
      orderBy: [{ categoryId: 'asc' }, { order: 'asc' }, { name: 'asc' }],
    });

    const attrsByCategoryId = new Map();
    for (const attr of allAttributes) {
      const list = attrsByCategoryId.get(attr.categoryId) || [];
      list.push(attr);
      attrsByCategoryId.set(attr.categoryId, list);
    }

    const wb = XLSX.utils.book_new();
    const usedSheetNames = new Set();

    // Helper to sanitize and ensure unique sheet names
    function getUniqueSheetName(subCategory) {
      // Base name: Category - SubCategory (to avoid "Bilgisayar" vs "Bilgisayar")
      // But 31 chars limit is tight. 
      // Strategy: Try "SubName" first. If taken, try "CatName-SubName". If taken, append ID.
      
      let baseName = subCategory.name.replace(/[\\/?*[\]]/g, ' ').trim();
      
      // Try just subcategory name first (cleanest)
      let candidate = baseName.substring(0, 31);
      
      if (usedSheetNames.has(candidate)) {
        // Try Cat-Sub format
        const catPrefix = subCategory.category.name.substring(0, 5).replace(/[\\/?*[\]]/g, '');
        candidate = `${catPrefix}-${baseName}`.substring(0, 31);
      }

      if (usedSheetNames.has(candidate)) {
        // Fallback to ID suffix
        const idSuffix = subCategory.id.substring(subCategory.id.length - 4);
        candidate = `${baseName.substring(0, 26)}-${idSuffix}`;
      }

      // Final fail-safe
      let counter = 1;
      while (usedSheetNames.has(candidate)) {
        candidate = `Sheet${counter++}`;
      }

      usedSheetNames.add(candidate);
      return candidate;
    }

    // 1. Create an Index Sheet
    const indexData = [];
    
    // We'll process subcategories and build index simultaneously to get correct sheet names
    for (const sub of subCategories) {
      const sheetName = getUniqueSheetName(sub);
      const attrsForCategory = attrsByCategoryId.get(sub.categoryId) || [];

      const requestFields = computeVisibleFields({
        attrsForCategory,
        subCategoryId: sub.id,
        mode: 'request',
      });

      const offerFields = computeVisibleFields({
        attrsForCategory,
        subCategoryId: sub.id,
        mode: 'offer',
      });

      indexData.push({
        'Category': sub.category.name,
        'SubCategory': sub.name,
        'Sheet Name': sheetName,
        'Visible Request Count': requestFields.length,
        'Visible Offer Count': offerFields.length,
        'ID': sub.id
      });

      const rows = [];

      const addRows = (mode, fields) => {
        for (const attr of fields) {
          const options = safeParseOptions(attr.optionsJson);
          const uiType = toUiType(attr.type);
          const isRange = uiType === 'range-number';

          rows.push({
            'Form': mode === 'request' ? 'TALEP' : 'TEKLIF',
            'Attribute Name': attr.name,
            'Slug (System ID)': attr.slug,
            'DB Type': attr.type,
            'UI Type': uiType,
            'Options (Comma Separated)': options.join(', '),
            'Required (TRUE/FALSE)': attr.required,
            'Order': attr.order,
            'Scope': attr.subCategoryId ? 'SUBCATEGORY' : 'GLOBAL',
            'Show In Offer (TRUE/FALSE)': attr.showInOffer,
            'Show In Request (TRUE/FALSE)': attr.showInRequest,
            'Range Min Key': isRange ? `${attr.slug}Min` : '',
            'Range Max Key': isRange ? `${attr.slug}Max` : '',
            'Range Min Label': isRange ? 'En az' : '',
            'Range Max Label': isRange ? 'En çok' : '',
            'ID': attr.id,
          });
        }
      };

      addRows('request', requestFields);
      addRows('offer', offerFields);

      if (rows.length === 0) {
        rows.push({
          'Form': 'TALEP',
          'Attribute Name': 'Örnek Özellik (Silin)',
          'Slug (System ID)': 'ornek_ozellik',
          'DB Type': 'text',
          'UI Type': 'text',
          'Options (Comma Separated)': '',
          'Required (TRUE/FALSE)': false,
          'Order': 1,
          'Scope': 'GLOBAL',
          'Show In Offer (TRUE/FALSE)': true,
          'Show In Request (TRUE/FALSE)': true,
          'Range Min Key': '',
          'Range Max Key': '',
          'Range Min Label': '',
          'Range Max Label': '',
          'ID': '',
        });
      }

      const ws = XLSX.utils.json_to_sheet(rows);
      
      // Set column widths
      ws['!cols'] = [
        { wch: 10 }, // Form
        { wch: 25 }, // Name
        { wch: 20 }, // Slug
        { wch: 14 }, // DB Type
        { wch: 14 }, // UI Type
        { wch: 40 }, // Options
        { wch: 10 }, // Required
        { wch: 8 },  // Order
        { wch: 12 }, // Scope
        { wch: 15 }, // ShowInOffer
        { wch: 15 }, // ShowInRequest
        { wch: 18 }, // Range Min Key
        { wch: 18 }, // Range Max Key
        { wch: 12 }, // Range Min Label
        { wch: 12 }, // Range Max Label
        { wch: 25 }, // ID
      ];

      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    }

    // Add Index sheet at the beginning
    const wsIndex = XLSX.utils.json_to_sheet(indexData);
    wsIndex['!cols'] = [{ wch: 20 }, { wch: 24 }, { wch: 18 }, { wch: 22 }, { wch: 20 }, { wch: 25 }];
    
    // Move Index to first position if possible, but xlsx usually appends. 
    // Creating a new workbook to order it correctly is cleaner.
    const finalWb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(finalWb, wsIndex, 'INDEX');
    
    // Copy sheets from temp wb to final wb
    wb.SheetNames.forEach(sheetName => {
      XLSX.utils.book_append_sheet(finalWb, wb.Sheets[sheetName], sheetName);
    });

    // Ensure directory exists
    const exportDir = path.join(process.cwd(), 'public', 'exports');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    const fileName = 'alt-kategori-formlari.xlsx';
    const filePath = path.join(exportDir, fileName);
    
    XLSX.writeFile(finalWb, filePath);
    
    console.log(`Export completed successfully!`);
    console.log(`File saved to: ${filePath}`);

  } catch (error) {
    console.error('Error exporting filters:', error);
  } finally {
    await prisma.$disconnect();
  }
}

exportFilters();
