import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";
import { sendPasswordResetEmail } from "@/lib/email";

const PASSWORD_RESET_PREFIX = "password-reset:";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ message: "Geçersiz e-posta adresi" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      // Security: Don't reveal if user exists or not, but for UX in this project let's be helpful or generic
      // Usually we say "If an account exists, an email has been sent."
      // But to be helpful to the user:
      return NextResponse.json({ message: "Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı" }, { status: 404 });
    }

    const identifier = `${PASSWORD_RESET_PREFIX}${user.email!}`;
    const existingTokens = await prisma.verificationToken.findMany({ where: { identifier } });
    if (existingTokens.length) {
      await prisma.verificationToken.deleteMany({ where: { identifier } });
    }

    const token = randomUUID();
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.verificationToken.create({ data: { identifier, token, expires } });

    await sendPasswordResetEmail(user.email!, token);

    return NextResponse.json({ ok: true, message: "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi." });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ message: "Bir hata oluştu" }, { status: 500 });
  }
}
