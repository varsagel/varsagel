import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { CATEGORIES } from "@/data/categories";
import { getSubcategoryImage } from "@/data/subcategory-images";
import fs from "node:fs";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function collectSubcategories() {
  const rows: {
    category: string;
    name: string;
    slug: string;
    fullSlug: string;
    requiredFileName: string;
    imageFile: string;
    imagePath: string;
    resolvedPath: string;
  }[] = [];

  const walk = (categoryName: string, categorySlug: string, subs: any[], parentPath: string[] = []) => {
    for (const s of subs || []) {
      const name = String(s.name || "").trim();
      const slug = String(s.slug || "").trim();
      const fullSlug = String(s.fullSlug || (parentPath.length ? [...parentPath, slug].join("-") : slug));
      const requiredFileName = `${fullSlug}.webp`;
      const imageFile = requiredFileName;
      const imagePath = `/images/defaults/${imageFile}`;
      const resolvedPath = getSubcategoryImage(fullSlug, categorySlug || categoryName);
      rows.push({
        category: categoryName,
        name,
        slug,
        fullSlug,
        requiredFileName,
        imageFile,
        imagePath,
        resolvedPath,
      });
      if (Array.isArray(s.subcategories) && s.subcategories.length) {
        walk(categoryName, categorySlug, s.subcategories, [...parentPath, slug]);
      }
    }
  };

  for (const c of CATEGORIES) {
    const cname = String(c.name || "").trim();
    const cslug = String(c.slug || "").trim();
    walk(cname, cslug, c.subcategories || [], []);
  }

  return rows;
}

export async function GET() {
  const rows = collectSubcategories();
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows, {
    header: ["category", "name", "slug", "fullSlug", "requiredFileName", "imageFile", "imagePath", "resolvedPath"],
  });
  XLSX.utils.book_append_sheet(wb, ws, "subcategories");
  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  try {
    const outDir = path.resolve(process.cwd(), "public", "exports");
    const outPath = path.join(outDir, "varsagel-subcategory-images.xlsx");
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(outPath, buf);
  } catch {}

  return new NextResponse(buf, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename=\"varsagel-subcategory-images.xlsx\"`,
      "Cache-Control": "no-store",
    },
  });
}
