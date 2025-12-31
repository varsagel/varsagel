import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUserId } from "@/auth";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const userId = await getAdminUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { role } = body;
    const nextRole = String(role || "").toUpperCase();
    if (!["ADMIN", "USER"].includes(nextRole)) {
      return NextResponse.json({ error: "Geçersiz rol" }, { status: 400 });
    }

    const target = await prisma.user.findUnique({ where: { id: params.id }, select: { email: true } });
    if (!target) return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
    if (target.email === "varsagel.com@gmail.com") {
      return NextResponse.json({ error: "Süper yönetici rolü değiştirilemez" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data: { role: nextRole }
    });

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const adminId = await getAdminUserId();
  if (!adminId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const target = await prisma.user.findUnique({ where: { id: params.id }, select: { email: true } });
    if (!target) return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
    if (target.email === "varsagel.com@gmail.com") {
      return NextResponse.json({ error: "Süper yönetici silinemez" }, { status: 400 });
    }

    await prisma.user.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
