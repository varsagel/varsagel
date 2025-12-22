import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CATEGORIES } from "@/data/categories";

export const dynamic = "force-dynamic";

async function loadCategoriesWithRelations() {
  const categories = await prisma.category.findMany({
    include: {
      subcategories: true,
      attributes: {
        orderBy: { order: "asc" },
        include: {
          subCategory: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });
  return categories;
}

export async function GET() {
  try {
    let categories = await loadCategoriesWithRelations();

    if (!categories.length) {
      for (const cat of CATEGORIES) {
        const created = await prisma.category.upsert({
          where: { slug: cat.slug },
          update: {},
          create: {
            name: cat.name,
            slug: cat.slug,
            icon: cat.icon || null,
          },
        });

        if (cat.subcategories && cat.subcategories.length) {
          await prisma.subCategory.createMany({
            data: cat.subcategories.map((s) => ({
              name: s.name,
              slug: s.slug,
              categoryId: created.id,
            })),
            skipDuplicates: true,
          });
        }
      }

      categories = await loadCategoriesWithRelations();
    }

    return NextResponse.json(
      categories.map((c: any) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        icon: c.icon,
        subcategories: c.subcategories.map((s: any) => ({
          id: s.id,
          name: s.name,
          slug: s.slug,
        })),
        attributes: c.attributes,
      }))
    );
  } catch (err) {
    console.error("GET /api/categories failed, falling back to static categories", err);

    return NextResponse.json(
      CATEGORIES.map((c) => ({
        id: c.slug,
        name: c.name,
        slug: c.slug,
        icon: c.icon,
        subcategories: c.subcategories.map((s: any) => ({
          id: s.id || s.slug,
          name: s.name,
          slug: s.slug,
        })),
        attributes: [],
      }))
    );
  }
}
