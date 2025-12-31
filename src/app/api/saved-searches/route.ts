import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().optional(),
  query: z.string().optional(),
  categorySlug: z.string().optional().nullable(),
  subcategorySlug: z.string().optional().nullable(),
  minPrice: z.number().optional().nullable(),
  maxPrice: z.number().optional().nullable(),
  city: z.string().optional().nullable(),
  district: z.string().optional().nullable(),
  filtersJson: z.any().optional(),
  isAlarm: z.boolean().optional(),
  emailNotification: z.boolean().optional(),
  siteNotification: z.boolean().optional(),
  frequency: z.enum(["INSTANT", "DAILY", "WEEKLY"]).optional(),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = createSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const data = validation.data;
    const name = data.name || (data.query ? `"${data.query}" Araması` : (data.categorySlug ? `${data.categorySlug} Kategorisi` : "Kaydedilmiş Arama"));

    // Check limit (max 10 saved searches per user)
    const count = await prisma.savedSearch.count({
      where: { userId: session.user.id },
    });

    if (count >= 10) {
      return NextResponse.json(
        { error: "En fazla 10 arama kaydedebilirsiniz." },
        { status: 400 }
      );
    }

    const savedSearch = await prisma.savedSearch.create({
      data: {
        userId: session.user.id,
        name,
        query: data.query || null,
        categorySlug: data.categorySlug || null,
        subcategorySlug: data.subcategorySlug || null,
        minPrice: data.minPrice || null,
        maxPrice: data.maxPrice || null,
        city: data.city || null,
        district: data.district || null,
        filtersJson: data.filtersJson || null,
        isAlarm: data.isAlarm ?? false,
        emailNotification: data.emailNotification ?? false,
        siteNotification: data.siteNotification ?? true,
        frequency: data.frequency || "INSTANT",
        matchMode: data.filtersJson ? "FILTERS" : (data.categorySlug ? "CATEGORY" : "TITLE"),
      },
    });

    return NextResponse.json(savedSearch);
  } catch (error: any) {
    console.error("SavedSearch create error:", error);
    return NextResponse.json(
      { error: "Bir hata oluştu" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const savedSearches = await prisma.savedSearch.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(savedSearches);
  } catch (error) {
    console.error("SavedSearch list error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
