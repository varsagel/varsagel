
import * as XLSX from 'xlsx';
import { CATEGORIES } from '../src/data/categories';
import { ATTR_SCHEMAS } from '../src/data/attribute-schemas';

// Helper to sanitize data for Excel
const sanitize = (val: any) => {
  if (val === undefined || val === null) return '';
  if (Array.isArray(val)) return val.join(', ');
  return String(val);
};

// Sheet 1: Categories
const categoryRows: any[] = [];
CATEGORIES.forEach(cat => {
  // Add category row even if no subcategories (though usually there are)
  if (cat.subcategories.length === 0) {
    categoryRows.push({
      'Category Name': cat.name,
      'Category Slug': cat.slug,
      'Category Icon': cat.icon || '',
      'Subcategory Name': '',
      'Subcategory Slug': ''
    });
  } else {
    cat.subcategories.forEach(sub => {
      categoryRows.push({
        'Category Name': cat.name,
        'Category Slug': cat.slug,
        'Category Icon': cat.icon || '',
        'Subcategory Name': sub.name,
        'Subcategory Slug': sub.slug
      });
    });
  }
});

// Sheet 2: Attributes
const attributeRows: any[] = [];
Object.entries(ATTR_SCHEMAS).forEach(([scopeKey, fields]) => {
  fields.forEach(field => {
    attributeRows.push({
      'Scope Key (Category/Subcategory Slug)': scopeKey,
      'Label': field.label,
      'Key': field.key || '',
      'Type': field.type,
      'Required': field.required ? 'Yes' : 'No',
      'Options': sanitize(field.options),
      'Min Key': field.minKey || '',
      'Max Key': field.maxKey || '',
      'Min Value': field.min !== undefined ? field.min : '',
      'Max Value': field.max !== undefined ? field.max : ''
    });
  });
});

// Create Workbook
const wb = XLSX.utils.book_new();

const wsCategories = XLSX.utils.json_to_sheet(categoryRows);
XLSX.utils.book_append_sheet(wb, wsCategories, 'Categories');

const wsAttributes = XLSX.utils.json_to_sheet(attributeRows);
XLSX.utils.book_append_sheet(wb, wsAttributes, 'Attributes');

// Write to file
const fileName = 'kategoriler.xlsx';
XLSX.writeFile(wb, fileName);

console.log(`Successfully exported categories to ${fileName}`);
