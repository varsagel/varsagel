import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth, getAdminUserId } from "@/auth";
import { CATEGORIES } from "@/data/categories";

export async function GET() {
  const userId = await getAdminUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const g = globalThis as any;
    if (!g.__varsagel_admin_categories_synced) {
      g.__varsagel_admin_categories_synced = true;
      for (const cat of CATEGORIES) {
        await prisma.category.upsert({
          where: { slug: cat.slug },
          update: { name: cat.name, icon: cat.icon || null },
          create: { name: cat.name, slug: cat.slug, icon: cat.icon || null },
        });
      }
    }

    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { listings: true, subcategories: true }
        }
      },
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(categories);
  } catch {
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  // @ts-ignore
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, slug, icon } = body;

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        icon
      }
    });

    return NextResponse.json(category);
  } catch {
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
