import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
// @ts-ignore
import bcrypt from "bcrypt";

const PASSWORD_RESET_PREFIX = "password-reset:";

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json({ message: "Token ve şifre gereklidir" }, { status: 400 });
    }

    const resetToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      return NextResponse.json({ message: "Geçersiz veya süresi dolmuş token" }, { status: 400 });
    }

    if (!resetToken.identifier.startsWith(PASSWORD_RESET_PREFIX)) {
      return NextResponse.json({ message: "Geçersiz veya süresi dolmuş token" }, { status: 400 });
    }

    if (new Date() > resetToken.expires) {
      await prisma.verificationToken.delete({ where: { token } });
      return NextResponse.json({ message: "Token süresi dolmuş" }, { status: 400 });
    }

    const email = resetToken.identifier.slice(PASSWORD_RESET_PREFIX.length);

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ message: "Kullanıcı bulunamadı" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    await prisma.verificationToken.delete({ where: { token } });

    return NextResponse.json({ ok: true, message: "Şifreniz başarıyla güncellendi" });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ message: "Bir hata oluştu" }, { status: 500 });
  }
}
