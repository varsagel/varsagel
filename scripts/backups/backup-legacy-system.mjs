import fs from "node:fs";
import path from "node:path";
import xlsx from "xlsx";
import { PrismaClient } from "@prisma/client";

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function nowStamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

async function main() {
  const stamp = process.env.BACKUP_STAMP || nowStamp();
  const dir =
    process.env.BACKUP_DIR ||
    path.join(process.cwd(), "public", "exports", "backups", `legacy_${stamp}`);

  const prisma = new PrismaClient({ log: ["error"] });
  try {
    const categories = await prisma.category.findMany({
      include: {
        subcategories: { orderBy: { name: "asc" } },
        attributes: { include: { subCategory: true }, orderBy: [{ subCategoryId: "asc" }, { order: "asc" }] },
      },
      orderBy: { name: "asc" },
    });

    const flatCategories = categories.map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      icon: c.icon || "",
      createdAt: c.createdAt?.toISOString?.() || "",
      updatedAt: c.updatedAt?.toISOString?.() || "",
    }));

    const flatSubCategories = categories.flatMap((c) =>
      (c.subcategories || []).map((s) => ({
        id: s.id,
        categoryId: c.id,
        categorySlug: c.slug,
        categoryName: c.name,
        slug: s.slug,
        name: s.name,
        createdAt: s.createdAt?.toISOString?.() || "",
        updatedAt: s.updatedAt?.toISOString?.() || "",
      })),
    );

    const flatAttrs = categories.flatMap((c) =>
      (c.attributes || []).map((a) => ({
        id: a.id,
        categoryId: c.id,
        categorySlug: c.slug,
        categoryName: c.name,
        subCategoryId: a.subCategoryId || "",
        subCategorySlug: a.subCategory?.slug || "",
        subCategoryName: a.subCategory?.name || "",
        name: a.name,
        slug: a.slug,
        type: a.type,
        optionsJson: a.optionsJson || "",
        required: a.required,
        order: a.order,
        showInOffer: a.showInOffer,
        showInRequest: a.showInRequest,
        createdAt: a.createdAt?.toISOString?.() || "",
        updatedAt: a.updatedAt?.toISOString?.() || "",
      })),
    );

    ensureDir(dir);

    const jsonPath = path.join(dir, "legacy-taxonomy-backup.json");
    fs.writeFileSync(
      jsonPath,
      JSON.stringify({ stamp, categories: flatCategories, subcategories: flatSubCategories, attributes: flatAttrs }, null, 2),
      "utf8",
    );

    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, xlsx.utils.json_to_sheet(flatCategories), "Categories");
    xlsx.utils.book_append_sheet(wb, xlsx.utils.json_to_sheet(flatSubCategories), "SubCategories");
    xlsx.utils.book_append_sheet(wb, xlsx.utils.json_to_sheet(flatAttrs), "Attributes");

    const xlsxPath = path.join(dir, "legacy-taxonomy-backup.xlsx");
    xlsx.writeFile(wb, xlsxPath);

    process.stdout.write(`OK\n${jsonPath}\n${xlsxPath}\n`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  process.stderr.write(String(e?.message || e) + "\n");
  process.exit(1);
});

