import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Oturum açmanız gerekiyor" }, { status: 401 });
  const fromUserId = session.user.id as string;
  try {
    const body = await request.json();
    const listingId = String(body.listingId || "");
    const toUserId = String(body.toUserId || "");
    const content = String(body.content || "");
    if (!listingId || !toUserId || !content) return NextResponse.json({ error: "Geçersiz alanlar" }, { status: 400 });

    const listing = await prisma.listing.findUnique({ where: { id: listingId }, select: { ownerId: true } });
    if (!listing) return NextResponse.json({ error: "İlan bulunamadı" }, { status: 404 });

    const accepted = await prisma.offer.findFirst({ where: { listingId, status: "ACCEPTED" }, select: { sellerId: true } });
    if (!accepted) return NextResponse.json({ error: "Mesajlaşma aktif değil" }, { status: 403 });

    const partyA = listing.ownerId;
    const partyB = accepted.sellerId;
    const isAuthorized = (fromUserId === partyA && toUserId === partyB) || (fromUserId === partyB && toUserId === partyA);
    if (!isAuthorized) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });

    const msg = await prisma.message.create({ data: { listingId, fromUserId, toUserId, content } });
    await prisma.notification.create({ data: { userId: toUserId, type: "message", title: "Yeni mesaj", body: content.slice(0, 120), dataJson: JSON.stringify({ listingId, messageId: msg.id }) } });
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
    const where: any = {
      OR: [{ fromUserId: userId }, { toUserId: userId }],
    };
    if (listingId) where.listingId = listingId;
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
