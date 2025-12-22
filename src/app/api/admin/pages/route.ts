import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUserId } from "@/auth";

export async function GET() {
  const userId = await getAdminUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const pages = await prisma.page.findMany({
      orderBy: { updatedAt: "desc" }
    });
    return NextResponse.json(pages);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch pages" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const userId = await getAdminUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, slug, content, published } = body;

    const page = await prisma.page.create({
      data: { title, slug, content, published }
    });

    return NextResponse.json(page);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create page" }, { status: 500 });
  }
}
