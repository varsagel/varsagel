import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUserId } from "@/auth";

export async function POST(req: Request) {
  const userId = await getAdminUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { categoryId, name, slug } = body;

    if (!categoryId || !name || !slug) {
      return NextResponse.json({ error: "Eksik alanlar" }, { status: 400 });
    }

    const subcategory = await prisma.subCategory.create({
      data: {
        categoryId,
        name,
        slug
      }
    });

    return NextResponse.json(subcategory);
  } catch {
    return NextResponse.json({ error: "Failed to create subcategory" }, { status: 500 });
  }
}
