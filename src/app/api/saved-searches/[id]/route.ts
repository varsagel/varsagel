import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const savedSearch = await prisma.savedSearch.findUnique({
      where: { id },
    });

    if (!savedSearch) {
      return NextResponse.json({ error: "Kayıt bulunamadı" }, { status: 404 });
    }

    if (savedSearch.userId !== session.user.id) {
      return NextResponse.json({ error: "Yetkisiz işlem" }, { status: 403 });
    }

    await prisma.savedSearch.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("SavedSearch delete error:", error);
    return NextResponse.json(
      { error: "Bir hata oluştu" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const savedSearch = await prisma.savedSearch.findUnique({
      where: { id },
    });

    if (!savedSearch) {
      return NextResponse.json({ error: "Kayıt bulunamadı" }, { status: 404 });
    }

    if (savedSearch.userId !== session.user.id) {
      return NextResponse.json({ error: "Yetkisiz işlem" }, { status: 403 });
    }

    const updated = await prisma.savedSearch.update({
      where: { id },
      data: {
        isAlarm: body.isAlarm !== undefined ? body.isAlarm : savedSearch.isAlarm,
        emailNotification: body.emailNotification !== undefined ? body.emailNotification : savedSearch.emailNotification,
        frequency: body.frequency || savedSearch.frequency,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("SavedSearch update error:", error);
    return NextResponse.json(
      { error: "Bir hata oluştu" },
      { status: 500 }
    );
  }
}
