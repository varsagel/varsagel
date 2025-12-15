import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
// @ts-ignore
import bcrypt from "bcrypt";
import { z } from "zod";
import { randomUUID } from "crypto";
import { sendVerificationEmail } from "@/lib/email";

const RegisterSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().transform((v) => v.toLowerCase().trim()),
  password: z.string().min(6).max(100),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = RegisterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: "Geçersiz alanlar" }, { status: 400 });
    }
    const { name, email, password } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ message: "Bu e-posta zaten kayıtlı" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    
    // Create user
    await prisma.user.create({
      data: { name, email, passwordHash },
    });

    // Create verification token
    const token = randomUUID();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    });

    // Send email
    try {
      await sendVerificationEmail(email, token);
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // Continue even if email fails, but maybe warn? 
      // For now, we assume it works or user can request resend later (feature for later)
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Beklenmeyen bir hata oluştu" }, { status: 500 });
  }
}