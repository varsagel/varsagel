import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUserId } from "@/auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await getAdminUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        attributes: {
          orderBy: { order: "asc" },
          include: {
            subCategory: true,
          } as any,
        },
        subcategories: true,
      },
    });

    if (!category) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(category);
  } catch (error) {
    console.error("Admin category fetch error (primary query):", error);

    try {
      const baseCategory = await prisma.category.findUnique({
        where: { id },
      });

      if (!baseCategory) return NextResponse.json({ error: "Not found" }, { status: 404 });

      const [subcategories, attributes] = await Promise.all([
        prisma.subCategory.findMany({ where: { categoryId: id } }),
        prisma.categoryAttribute.findMany({
          where: { categoryId: id },
        }),
      ]);

      return NextResponse.json({
        ...baseCategory,
        subcategories,
        attributes,
      });
    } catch (fallbackError) {
      console.error("Admin category fetch error (fallback query):", fallbackError);
      return NextResponse.json({ error: "Error fetching category" }, { status: 500 });
    }
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await getAdminUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, slug, icon } = body;

    const category = await prisma.category.update({
      where: { id },
      data: { name, slug, icon }
    });

    return NextResponse.json(category);
  } catch {
    return NextResponse.json({ error: "Error updating category" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await getAdminUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.category.delete({
      where: { id }
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error deleting category" }, { status: 500 });
  }
}
