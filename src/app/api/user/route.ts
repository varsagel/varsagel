import { NextResponse } from "next/server";
import { auth } from "@/auth"; 
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Validation schema
const userUpdateSchema = z.object({
  name: z.string().min(2, "İsim en az 2 karakter olmalıdır"),
  phone: z.string().optional(),
  notificationSettings: z.object({
    newOffers: z.boolean().optional(),
    messages: z.boolean().optional(),
    marketingEmails: z.boolean().optional(),
  }).optional(),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Oturum açmanız gerekiyor" }, { status: 401 });
    }

    const user = await (prisma as any).user.findUnique({
      where: { email: session.user.email },
      select: {
        name: true,
        email: true,
        phone: true,
        preferencesJson: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
    }

    return NextResponse.json({
      ...user,
      notificationSettings: user.preferencesJson ? JSON.parse(user.preferencesJson) : {}
    });
  } catch (error) {
    console.error("User fetch error:", error);
    return NextResponse.json(
      { error: "Profil bilgileri alınamadı" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Oturum açmanız gerekiyor" }, { status: 401 });
    }

    const body = await req.json();
    
    // Validate input
    const result = userUpdateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: result.error.format() },
        { status: 400 }
      );
    }

    const { name, phone, notificationSettings } = result.data;

    const updatedUser = await (prisma as any).user.update({
      where: { email: session.user.email },
      data: {
        name,
        phone: phone,
        preferencesJson: notificationSettings ? JSON.stringify(notificationSettings) : undefined
      },
    });

    return NextResponse.json({ 
      success: true, 
      user: {
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        notificationSettings: updatedUser.preferencesJson ? JSON.parse(updatedUser.preferencesJson) : {}
      } 
    });

  } catch (error) {
    console.error("User update error:", error);
    return NextResponse.json(
      { error: "Profil güncellenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
