import { NextRequest, NextResponse } from "next/server";
import { ATTR_SUBSCHEMAS } from "@/data/attribute-overrides";
import { prisma } from "@/lib/prisma";

export const revalidate = 3600;
export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const searchParams = request.nextUrl.searchParams;
  const subcategorySlugRaw = searchParams.get("subcategory");

  try {
    const decodedSubcategorySlug = subcategorySlugRaw ? decodeURIComponent(subcategorySlugRaw).trim() : "";
    const normalizedSubcategorySlug = decodedSubcategorySlug.includes("/")
      ? decodedSubcategorySlug.split("/").filter(Boolean).join("-")
      : decodedSubcategorySlug;

    const keyCandidates = [
      normalizedSubcategorySlug ? `${slug}/${normalizedSubcategorySlug}` : "",
      decodedSubcategorySlug ? `${slug}/${decodedSubcategorySlug}` : "",
      slug,
    ].filter(Boolean);

    const normalize = (raw: any): string =>
      String(raw || "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .trim();

    const normalizeKey = (raw: string): string => {
      const k = String(raw || "").trim();
      if (slug === "vasita") {
        if (k === "motor-seri") return "seri";
        if (k === "donanim-paket") return "paket";
      }
      return k;
    };

    let overrideMapped: any[] | null = null;
    for (const key of keyCandidates) {
      const schema = (ATTR_SUBSCHEMAS as any)[key];
      if (!Array.isArray(schema) || schema.length === 0) continue;
      overrideMapped = schema.map((f: any, index: number) => ({
        id: `${key}:${index}`,
        name: f.label,
        slug: normalizeKey(f.key || f.slug || f.label),
        type: f.type,
        optionsJson: f.options ? JSON.stringify(f.options) : null,
        required: !!f.required,
        order: index,
        subCategoryId: null,
        showInOffer: true,
        showInRequest: true,
        subCategory: null,
        minKey: f.minKey,
        maxKey: f.maxKey,
        min: f.min,
        max: f.max,
        minLabel: f.minLabel,
        maxLabel: f.maxLabel,
      }));
      break;
    }

    let dbMapped: any[] | null = null;
    try {
      const category = await prisma.category.findUnique({
        where: { slug },
        select: { id: true },
      });
      if (category?.id) {
        const subcategoryCandidates = Array.from(
          new Set([decodedSubcategorySlug, normalizedSubcategorySlug].filter(Boolean))
        );
        let subCategory: { id: string } | null = null;
        for (const cand of subcategoryCandidates) {
          subCategory = await prisma.subCategory.findUnique({
            where: { slug: cand },
            select: { id: true },
          });
          if (subCategory?.id) break;
        }
        const subCategoryId = subCategory?.id || null;
        const subcategoryRequested = !!decodedSubcategorySlug;

        const attrs = await prisma.categoryAttribute.findMany({
          where: {
            categoryId: category.id,
            ...(subCategoryId
              ? { OR: [{ subCategoryId: null }, { subCategoryId }] }
              : subcategoryRequested
                ? { subCategoryId: null }
                : {}),
          },
          include: { subCategory: { select: { slug: true } } },
          orderBy: [{ subCategoryId: "asc" }, { order: "asc" }],
        });

        if (attrs.length > 0) {
          dbMapped = attrs.map((a) => ({
            id: a.id,
            name: a.name,
            slug: a.slug,
            type: a.type,
            optionsJson: a.optionsJson,
            required: a.required,
            order: a.order,
            subCategoryId: a.subCategoryId,
            showInOffer: a.showInOffer,
            showInRequest: a.showInRequest,
            subCategory: a.subCategory ? { slug: a.subCategory.slug } : null,
          }));
        }
      }
    } catch {}

    if (overrideMapped && overrideMapped.length > 0) {
      if (!dbMapped || dbMapped.length === 0) return NextResponse.json(overrideMapped);

      const dbBySlug = new Map<string, any>();
      for (const a of dbMapped) dbBySlug.set(normalize(a.slug), a);

      const merged = overrideMapped.map((o) => {
        const db = dbBySlug.get(normalize(o.slug));
        if (!db) return o;
        return {
          ...o,
          required: db.required,
          showInOffer: db.showInOffer,
          showInRequest: db.showInRequest,
          subCategoryId: db.subCategoryId,
          subCategory: db.subCategory,
          type: o.type || db.type,
          optionsJson: o.optionsJson || db.optionsJson,
        };
      });

      const seen = new Set(merged.map((o) => normalize(o.slug)));
      const missingRequired = dbMapped.filter((a) => a.required && !seen.has(normalize(a.slug)));
      const missingOptional = dbMapped.filter((a) => !a.required && !seen.has(normalize(a.slug)));

      const out = [
        ...missingRequired.sort((a, b) => (a.order || 0) - (b.order || 0)),
        ...merged,
        ...missingOptional.sort((a, b) => (a.order || 0) - (b.order || 0)),
      ];

      return NextResponse.json(out);
    }

    if (dbMapped && dbMapped.length > 0) return NextResponse.json(dbMapped);

    return NextResponse.json([]);
  } catch (error) {
    console.error("Error fetching attributes:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
