import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CATEGORIES } from "@/data/categories";

export const revalidate = 3600;

async function loadCategoriesWithRelations() {
  const categories = await prisma.category.findMany({
    include: {
      subcategories: { orderBy: { name: "asc" } },
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

async function syncStaticCategoryRoots() {
  for (const cat of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, icon: cat.icon || null },
      create: { name: cat.name, slug: cat.slug, icon: cat.icon || null },
    });
  }
}

export async function GET() {
  if (process.env.NEXT_PHASE === "phase-production-build") {
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
          fullSlug: s.fullSlug || undefined,
        })),
        attributes: [],
      }))
    );
  }

  try {
    const g = globalThis as any;
    if (!g.__varsagel_static_categories_synced) {
      g.__varsagel_static_categories_synced = true;
      await syncStaticCategoryRoots();
    }
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
          });
        }
      }

      categories = await loadCategoriesWithRelations();
    }

    // Filter out "İş Talepleri"
    categories = categories.filter((c: any) => 
      c.slug !== 'is-talepleri' && 
      c.name !== 'İş Talepleri'
    );

    const toApiNode = (dbIdBySlug: Map<string, string>) => {
      const walk = (s: any): any => {
        const subcats = Array.isArray(s?.subcategories) ? s.subcategories : [];
        return {
          id: dbIdBySlug.get(s.slug) || s.id || s.fullSlug || s.slug,
          name: s.name,
          slug: s.slug,
          fullSlug: s.fullSlug || undefined,
          subcategories: subcats.length ? subcats.map(walk) : undefined,
        };
      };
      return walk;
    };

    return NextResponse.json(
      categories.map((c: any) => {
        const staticCat = CATEGORIES.find((sc) => sc.slug === c.slug);
        const dbIdBySlug = new Map<string, string>((c.subcategories || []).map((s: any) => [s.slug, s.id]));
        const walker = toApiNode(dbIdBySlug);
        const subs = (staticCat?.subcategories?.length ? staticCat.subcategories : c.subcategories || []).map(walker);

        return {
          id: c.id,
          name: staticCat?.name ?? c.name,
          slug: c.slug,
          icon: staticCat?.icon ?? c.icon,
          subcategories: subs,
          attributes: c.attributes,
        };
      })
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
          fullSlug: s.fullSlug || undefined,
        })),
        attributes: [],
      }))
    );
  }
}
