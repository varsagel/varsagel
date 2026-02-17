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

    // Always create verification token to prevent user enumeration
    const token = randomUUID();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    try {
      // Check if user exists
      const existing = await prisma.user.findUnique({ where: { email } });
      
      if (existing) {
        // User already exists: ensure a fresh verification token exists
        await prisma.verificationToken.deleteMany({ where: { identifier: email } });
        // If the existing user does not have a password set, initialize it
        if (!existing.passwordHash) {
          const newHash = await bcrypt.hash(password, 10);
          await prisma.user.update({
            where: { id: existing.id },
            data: { passwordHash: newHash },
          });
        }
        await prisma.verificationToken.create({
          data: {
            identifier: email,
            token,
            expires,
          },
        });
        // Still send email to prevent enumeration (UX: user gets a valid link)
        await sendVerificationEmail(email, token);
        return NextResponse.json({ 
          message: "Kayıt işlemi başlatıldı. Lütfen e-postanızı kontrol edin.",
          ok: true 
        }, { status: 201 });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      
      // Create user
      await prisma.user.create({
        data: { name, email, passwordHash },
      });

      // Create verification token
      await prisma.verificationToken.create({
        data: {
          identifier: email,
          token,
          expires,
        },
      });

      // Send verification email
      await sendVerificationEmail(email, token);

      return NextResponse.json({ 
        message: "Kayıt işlemi başlatıldı. Lütfen e-postanızı kontrol edin.",
        ok: true 
      }, { status: 201 });

    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // Still return success to prevent enumeration
      return NextResponse.json({ 
        message: "Kayıt işlemi başlatıldı. Lütfen e-postanızı kontrol edin.",
        ok: true 
      }, { status: 201 });
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Beklenmeyen bir hata oluştu" }, { status: 500 });
  }
}
