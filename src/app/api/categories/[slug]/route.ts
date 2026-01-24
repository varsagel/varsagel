import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const revalidate = 3600;

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        subcategories: {
            orderBy: { name: "asc" }
        },
        attributes: {
          orderBy: { order: "asc" },
          include: {
            subCategory: true,
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error("Error fetching category:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
