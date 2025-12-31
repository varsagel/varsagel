import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth, getAdminUserId } from "@/auth";

export async function GET() {
  const userId = await getAdminUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { listings: true, subcategories: true }
        }
      },
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(categories);
  } catch (error) {
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
  } catch (error) {
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
