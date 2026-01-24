import { PrismaClient } from '@prisma/client';
import XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

function parseArgs(argv) {
  const out = { file: null, dryRun: false, report: null };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--file') out.file = argv[++i] || null;
    else if (a === '--dry-run') out.dryRun = true;
    else if (a === '--report') out.report = argv[++i] || null;
  }
  return out;
}

function parseBoolCell(v) {
  if (v === null || v === undefined) return null;
  const s = String(v).trim().toLowerCase();
  if (!s) return null;
  if (s === 'true' || s === '1' || s === 'evet' || s === 'yes') return true;
  if (s === 'false' || s === '0' || s === 'hayır' || s === 'hayir' || s === 'no') return false;
  return null;
}

async function main() {
  const args = parseArgs(process.argv);
  const defaultFile = path.resolve(__dirname, '../public/exports/alan-gorunurluk.xlsx');
  const xlsxPath = path.resolve(args.file || defaultFile);
  const defaultReport = path.resolve(__dirname, '../public/exports/alan-gorunurluk-import-report.json');
  const reportPath = path.resolve(args.report || defaultReport);

  const wb = XLSX.readFile(xlsxPath);
  const sheet = wb.Sheets.ALL;
  if (!sheet) {
    throw new Error('ALL sheet bulunamadı');
  }

  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

  const desiredById = new Map();
  for (const r of rows) {
    const id = String(r.attributeId || '').trim();
    if (!id) continue;

    const reqNew = parseBoolCell(r.showInRequest_new);
    const offNew = parseBoolCell(r.showInOffer_new);
    if (reqNew === null && offNew === null) continue;

    desiredById.set(id, { reqNew, offNew });
  }

  const ids = Array.from(desiredById.keys());
  const before = ids.length
    ? await prisma.categoryAttribute.findMany({
        where: { id: { in: ids } },
        select: { id: true, slug: true, name: true, showInRequest: true, showInOffer: true },
      })
    : [];
  const beforeById = new Map(before.map((a) => [a.id, a]));

  const updates = [];
  const changes = [];
  for (const id of ids) {
    const prev = beforeById.get(id);
    const desired = desiredById.get(id);
    if (!prev || !desired) continue;

    const nextShowInRequest = desired.reqNew !== null ? desired.reqNew : prev.showInRequest;
    const nextShowInOffer = desired.offNew !== null ? desired.offNew : prev.showInOffer;
    const differs = nextShowInRequest !== prev.showInRequest || nextShowInOffer !== prev.showInOffer;
    if (!differs) continue;

    const data = {};
    if (nextShowInRequest !== prev.showInRequest) data.showInRequest = nextShowInRequest;
    if (nextShowInOffer !== prev.showInOffer) data.showInOffer = nextShowInOffer;
    if (Object.keys(data).length === 0) continue;

    updates.push({ id, data });
    changes.push({
      id,
      slug: prev.slug || null,
      name: prev.name || null,
      before: {
        showInRequest: prev.showInRequest ?? null,
        showInOffer: prev.showInOffer ?? null,
      },
      after: {
        showInRequest: nextShowInRequest ?? null,
        showInOffer: nextShowInOffer ?? null,
      },
    });
  }

  if (!args.dryRun && updates.length > 0) {
    await prisma.$transaction(
      updates.map((u) =>
        prisma.categoryAttribute.update({
          where: { id: u.id },
          data: u.data,
        })
      )
    );
  }

  const report = {
    file: xlsxPath,
    dryRun: args.dryRun,
    changedCount: updates.length,
    changesPreview: changes.slice(0, 200),
  };
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');

  console.log(args.dryRun ? `DRY RUN: ${updates.length} satır güncellenecek` : `OK: ${updates.length} satır güncellendi`);
  console.log(`Rapor: ${reportPath}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
