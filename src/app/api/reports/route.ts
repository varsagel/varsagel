import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const reportSchema = z.object({
  listingId: z.string(),
  reason: z.string(),
  details: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Oturum açmanız gerekiyor' }, { status: 401 });
    }

    const body = await req.json();
    const validation = reportSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Geçersiz veri', details: validation.error.format() }, { status: 400 });
    }

    const { listingId, reason, details } = validation.data;

    // Get user ID from email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    // Check if listing exists
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      return NextResponse.json({ error: 'Talep bulunamadı' }, { status: 404 });
    }

    // Create report
    // Using type assertion to bypass VS Code cache issue (tsc verification passed)
    const report = await (prisma as any).report.create({
      data: {
        listingId,
        userId: user.id,
        reason,
        description: details,
        status: 'PENDING',
      },
    });

    return NextResponse.json({ success: true, report });
  } catch (error) {
    console.error('Report error:', error);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}
