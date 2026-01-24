import { PrismaClient } from '@prisma/client';
import XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function boolToCell(v) {
  return v === true ? 'true' : v === false ? 'false' : '';
}

async function main() {
  const outDir = path.resolve(__dirname, '../public/exports');
  ensureDir(outDir);

  const outXlsxPath = path.join(outDir, 'alan-gorunurluk.xlsx');
  const outCsvPath = path.join(outDir, 'alan-gorunurluk.csv');

  const attrs = await prisma.categoryAttribute.findMany({
    include: {
      category: { select: { id: true, slug: true, name: true } },
      subCategory: { select: { id: true, slug: true, name: true } },
    },
    orderBy: [
      { category: { name: 'asc' } },
      { subCategoryId: 'asc' },
      { order: 'asc' },
      { name: 'asc' },
    ],
  });

  const rows = attrs.map((a) => ({
    categorySlug: a.category?.slug || '',
    categoryName: a.category?.name || '',
    subcategorySlug: a.subCategory?.slug || '',
    subcategoryName: a.subCategory?.name || '',
    attributeId: a.id,
    attributeSlug: a.slug,
    attributeName: a.name,
    type: a.type,
    required: boolToCell(a.required),
    order: typeof a.order === 'number' ? a.order : '',
    showInRequest: boolToCell(a.showInRequest),
    showInOffer: boolToCell(a.showInOffer),
    showInRequest_new: boolToCell(a.showInRequest),
    showInOffer_new: boolToCell(a.showInOffer),
  }));

  const wb = XLSX.utils.book_new();

  const infoRows = [
    {
      key: 'Kullanım',
      value:
        'showInRequest_new / showInOffer_new kolonları başlangıçta mevcut değerle dolu gelir. Değiştirmek istediklerinizi true/false yapıp import çalıştırın.',
    },
    { key: 'Dosya', value: 'Bu dosyayı düzenledikten sonra import-attribute-visibility.mjs çalıştırın.' },
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(infoRows), 'INFO');

  const allSheet = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, allSheet, 'ALL');

  const summary = new Map();
  for (const r of rows) {
    const key = `${r.categoryName} (${r.categorySlug})`;
    const prev = summary.get(key) || 0;
    summary.set(key, prev + 1);
  }
  const summaryRows = Array.from(summary.entries())
    .sort((a, b) => String(a[0]).localeCompare(String(b[0]), 'tr'))
    .map(([k, count]) => ({ category: k, attributeCount: count }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summaryRows), 'CATEGORIES');

  XLSX.writeFile(wb, outXlsxPath);

  const csv = XLSX.utils.sheet_to_csv(allSheet);
  fs.writeFileSync(outCsvPath, csv, 'utf8');

  console.log(`OK: ${outXlsxPath}`);
  console.log(`OK: ${outCsvPath}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
