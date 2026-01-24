import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminUserId } from '@/auth';

export async function GET() {
  try {
    const adminId = await getAdminUserId();
    if (!adminId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const listings = await prisma.listing.findMany({
      select: {
        id: true,
        title: true,
        category: { select: { name: true, slug: true } },
        subCategory: { select: { name: true, slug: true } },
        attributesJson: true,
        createdAt: true,
        owner: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    return NextResponse.json(listings);
  } catch (error) {
    console.error('Error fetching manual entries:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
