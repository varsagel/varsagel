import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUserId } from "@/auth";

export async function POST(req: Request) {
  const adminId = await getAdminUserId();
  if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const ids = Array.isArray(body?.ids) ? body.ids.map((id: any) => String(id).trim()).filter(Boolean) : [];
  if (ids.length === 0) return NextResponse.json({ error: "IDs gerekli" }, { status: 400 });

  const result = await prisma.listing.updateMany({
    where: { id: { in: ids }, status: "PENDING" },
    data: { status: "OPEN" },
  });

  return NextResponse.json({ updated: result.count });
}
