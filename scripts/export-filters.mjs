import { PrismaClient } from '@prisma/client';
import XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function exportFilters() {
  try {
    console.log('Fetching categories and subcategories...');
    
    // Fetch all subcategories with their attributes and parent category
    const subCategories = await prisma.subCategory.findMany({
      include: {
        category: true,
        attributes: {
          orderBy: {
            order: 'asc'
          }
        }
      },
      orderBy: [
        { category: { name: 'asc' } },
        { name: 'asc' }
      ]
    });

    console.log(`Found ${subCategories.length} subcategories.`);

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
      
      indexData.push({
        'Category': sub.category.name,
        'SubCategory': sub.name,
        'Sheet Name': sheetName,
        'Attribute Count': sub.attributes.length,
        'ID': sub.id
      });

      const rows = sub.attributes.map(attr => {
        let optionsStr = '';
        if (attr.optionsJson) {
          try {
            const parsed = JSON.parse(attr.optionsJson);
            if (Array.isArray(parsed)) {
              optionsStr = parsed.join(', ');
            }
          } catch (e) {
            console.warn(`Failed to parse options for ${attr.name}: ${e.message}`);
          }
        }

        return {
          'Attribute Name': attr.name,
          'Slug (System ID)': attr.slug,
          'Type (text/number/select/checkbox)': attr.type,
          'Options (Comma Separated)': optionsStr,
          'Required (TRUE/FALSE)': attr.required,
          'Order': attr.order,
          'Show In Offer (TRUE/FALSE)': attr.showInOffer,
          'Show In Request (TRUE/FALSE)': attr.showInRequest,
          'Action (UPDATE/DELETE)': 'UPDATE',
          'ID (Do Not Touch)': attr.id
        };
      });

      // If no attributes, add a template row
      if (rows.length === 0) {
        rows.push({
          'Attribute Name': 'Örnek Özellik (Silin)',
          'Slug (System ID)': 'ornek_ozellik',
          'Type (text/number/select/checkbox)': 'text',
          'Options (Comma Separated)': '',
          'Required (TRUE/FALSE)': false,
          'Order': 1,
          'Show In Offer (TRUE/FALSE)': true,
          'Show In Request (TRUE/FALSE)': true,
          'Action (UPDATE/DELETE)': 'CREATE',
          'ID (Do Not Touch)': ''
        });
      }

      const ws = XLSX.utils.json_to_sheet(rows);
      
      // Set column widths
      ws['!cols'] = [
        { wch: 25 }, // Name
        { wch: 20 }, // Slug
        { wch: 15 }, // Type
        { wch: 40 }, // Options
        { wch: 10 }, // Required
        { wch: 8 },  // Order
        { wch: 15 }, // ShowInOffer
        { wch: 15 }, // ShowInRequest
        { wch: 15 }, // Action
        { wch: 25 }  // ID
      ];

      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    }

    // Add Index sheet at the beginning
    const wsIndex = XLSX.utils.json_to_sheet(indexData);
    wsIndex['!cols'] = [{ wch: 20 }, { wch: 20 }, { wch: 30 }, { wch: 10 }, { wch: 25 }];
    
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

    const fileName = 'kategori-filtreleri.xlsx';
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
