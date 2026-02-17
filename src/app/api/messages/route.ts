import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { validateContent } from "@/lib/content-filter";

async function ensureListingBlockTable() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "ListingBlock" (
      "id" TEXT PRIMARY KEY,
      "listingId" TEXT NOT NULL,
      "ownerId" TEXT NOT NULL,
      "blockedUserId" TEXT NOT NULL,
      "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE ("listingId", "blockedUserId")
    );
  `);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ListingBlock_listingId_idx" ON "ListingBlock" ("listingId");`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ListingBlock_ownerId_idx" ON "ListingBlock" ("ownerId");`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ListingBlock_blockedUserId_idx" ON "ListingBlock" ("blockedUserId");`);
}

async function isBlocked(listingId: string, blockedUserId: string): Promise<boolean> {
  await ensureListingBlockTable();
  const rows = await prisma.$queryRawUnsafe<Array<{ id: string }>>(
    `SELECT "id" FROM "ListingBlock" WHERE "listingId" = $1 AND "blockedUserId" = $2 LIMIT 1`,
    listingId,
    blockedUserId
  );
  return rows.length > 0;
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Oturum açmanız gerekiyor" }, { status: 401 });
  const senderId = session.user.id as string;
  try {
    const body = await request.json();
    const listingId = String(body.listingId || "");
    const toUserId = String(body.toUserId || "");
    const content = String(body.content || "");
    if (!listingId || !toUserId || !content) return NextResponse.json({ error: "Geçersiz alanlar" }, { status: 400 });
    const validation = validateContent(content, { blockComplaint: true });
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const listing = await prisma.listing.findUnique({ where: { id: listingId }, select: { ownerId: true } });
    if (!listing) return NextResponse.json({ error: "Talep bulunamadı" }, { status: 404 });

    // Talep sahibi ile herkes mesajlaşabilir (soru sorma)
    // Veya talep sahibi başkasına cevap verebilir
    const ownerId = listing.ownerId;
    const isAuthorized = (senderId === ownerId) || (toUserId === ownerId);
    
    if (!isAuthorized) return NextResponse.json({ error: "Yetkisiz: Sadece talep sahibi ile mesajlaşabilirsiniz" }, { status: 403 });

    const blockedSender = await isBlocked(listingId, senderId);
    const blockedReceiver = await isBlocked(listingId, toUserId);
    if (blockedSender || blockedReceiver) {
      return NextResponse.json({ error: "Bu talep için mesajlaşma engellendi" }, { status: 403 });
    }

    const msg = await prisma.message.create({ data: { listingId, senderId, toUserId, content, read: false } });
    await prisma.notification.create({ data: { userId: toUserId, type: "message", title: "Yeni mesaj", body: content.slice(0, 120), dataJson: JSON.stringify({ listingId, messageId: msg.id }), read: false } });
    return NextResponse.json({ ok: true, messageId: msg.id });
  } catch {
    return NextResponse.json({ error: "Mesaj gönderilirken hata" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Oturum açmanız gerekiyor" }, { status: 401 });
  const userId = session.user.id as string;
  try {
    const { searchParams } = new URL(request.url);
    const listingId = searchParams.get('listingId') || undefined;
    const contactId = searchParams.get('contactId') || undefined;
    const countOnly = searchParams.get('count') === '1';
    const unreadOnly = searchParams.get('unread') === '1';

    const where: any = {};

    if (contactId) {
      // Specific conversation between me and contactId
      where.AND = [
        { listingId },
        {
          OR: [
            { senderId: userId, toUserId: contactId },
            { senderId: contactId, toUserId: userId }
          ]
        }
      ];
    } else {
      // All my messages (optionally filtered by listingId)
      where.OR = [{ senderId: userId }, { toUserId: userId }];
      if (listingId) where.listingId = listingId;
    }

    if (unreadOnly) {
      where.toUserId = userId;
      where.read = false;
    }
    
    if (countOnly) {
      const count = await prisma.message.count({ where });
      return NextResponse.json({ count });
    }
    const messages = await prisma.message.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return NextResponse.json(messages);
  } catch {
    return NextResponse.json({ error: "Mesajlar getirilirken hata" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Oturum açmanız gerekiyor" }, { status: 401 });
  const userId = session.user.id as string;

  const body = await request.json().catch(() => ({}));
  const listingId = typeof body?.listingId === 'string' ? body.listingId.trim() : '';
  const contactId = typeof body?.contactId === 'string' ? body.contactId.trim() : '';

  const whereMsg: any = { toUserId: userId, read: false };
  if (listingId) whereMsg.listingId = listingId;
  if (contactId) whereMsg.senderId = contactId;

  const msgResult = await prisma.message.updateMany({
    where: whereMsg,
    data: { read: true },
  });

  const whereNotif: any = { userId, type: 'message', read: false };
  if (listingId) {
    whereNotif.dataJson = { contains: `"listingId":"${listingId}"` };
  }
  const notifResult = await prisma.notification.updateMany({
    where: whereNotif,
    data: { read: true },
  });

  return NextResponse.json({ ok: true, messagesMarked: msgResult.count, notificationsMarked: notifResult.count });
}
