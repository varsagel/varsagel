import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = typeof body?.token === "string" ? body.token : "";
    const email = typeof body?.email === "string" ? body.email.toLowerCase().trim() : "";
    const authHeader = request.headers.get("authorization") || "";
    const adminSecret = (process.env.ADMIN_VERIFY_SECRET || process.env.CRON_SECRET || "").trim();
    const isAdmin = !!adminSecret && authHeader === `Bearer ${adminSecret}`;

    if (isAdmin && email) {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return NextResponse.json({ message: "Kullanıcı bulunamadı" }, { status: 400 });
      }
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      });
      await prisma.verificationToken.deleteMany({ where: { identifier: email } });
      return NextResponse.json({ ok: true, message: "E-posta başarıyla doğrulandı" });
    }

    if (!token) {
      return NextResponse.json({ message: "Geçersiz token" }, { status: 400 });
    }

    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      return NextResponse.json({ message: "Geçersiz veya süresi dolmuş token" }, { status: 400 });
    }

    if (new Date() > verificationToken.expires) {
      await prisma.verificationToken.delete({ where: { token } });
      return NextResponse.json({ message: "Token süresi dolmuş" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: verificationToken.identifier },
    });

    if (!user) {
      return NextResponse.json({ message: "Kullanıcı bulunamadı" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() },
    });

    await prisma.verificationToken.delete({ where: { token } });

    return NextResponse.json({ ok: true, message: "E-posta başarıyla doğrulandı" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Bir hata oluştu" }, { status: 500 });
  }
}
