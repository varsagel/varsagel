import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalListings,
      newListingsToday,
      totalOffers,
      totalUsers
    ] = await Promise.all([
      prisma.listing.count({ where: { status: 'PENDING' } }), // Active listings usually
      prisma.listing.count({
        where: {
          createdAt: {
            gte: today
          }
        }
      }),
      prisma.offer.count(),
      prisma.user.count()
    ]);

    return NextResponse.json({
      totalListings,
      newListingsToday,
      totalOffers,
      totalUsers
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
