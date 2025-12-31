import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

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

    const listing = await prisma.listing.findUnique({ where: { id: listingId }, select: { ownerId: true } });
    if (!listing) return NextResponse.json({ error: "Talep bulunamadı" }, { status: 404 });

    // Talep sahibi ile herkes mesajlaşabilir (soru sorma)
    // Veya talep sahibi başkasına cevap verebilir
    const ownerId = listing.ownerId;
    const isAuthorized = (senderId === ownerId) || (toUserId === ownerId);
    
    if (!isAuthorized) return NextResponse.json({ error: "Yetkisiz: Sadece talep sahibi ile mesajlaşabilirsiniz" }, { status: 403 });

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
