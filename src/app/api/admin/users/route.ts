import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUserId } from "@/auth";

export async function GET(req: Request) {
  const userId = await getAdminUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";

  try {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: q } },
          { email: { contains: q } }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        createdAt: true,
        _count: {
          select: { listings: true, offers: true }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 50
    });

    return NextResponse.json(users);
  } catch {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
