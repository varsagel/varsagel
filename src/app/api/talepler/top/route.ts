import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const listings = await prisma.listing.findMany({
      where: { status: "OPEN" },
      include: {
        category: { select: { slug: true } },
        _count: { select: { offers: true } },
      },
      orderBy: [{ offers: { _count: "desc" } }, { createdAt: "desc" }],
      take: 10,
    });

    const payload = listings.map((l) => ({
      id: l.id,
      title: l.title,
      description: l.description,
      price: l.budget ? Number(l.budget as any) : null,
      category: l.category?.slug || "",
      location: { city: l.city, district: l.district },
      offersCount: l._count.offers,
      createdAt: l.createdAt,
    }));

    return NextResponse.json(payload);
  } catch (err) {
    return NextResponse.json({ error: "Popüler talepler yüklenemedi" }, { status: 500 });
  }
}
