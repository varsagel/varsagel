import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Oturum açmanız gerekiyor" }, { status: 401 });
  }
  const sellerId = session.user.id as string;
  try {
    const body = await request.json();
    const listingId = String(body.listingId || "");
    const priceNum = Number(body.price);
    const message = String(body.message || "");
    const attributes = body.attributes || {};
    if (!listingId || !priceNum || priceNum < 1 || !message) {
      return NextResponse.json({ error: "Geçersiz alanlar" }, { status: 400 });
    }
    if (message.trim().length < 20) {
      return NextResponse.json({ error: "Mesaj en az 20 karakter olmalı" }, { status: 400 });
    }

    const listing = await prisma.listing.findUnique({ where: { id: listingId }, select: { ownerId: true } });
    if (!listing) {
      return NextResponse.json({ error: "İlan bulunamadı" }, { status: 404 });
    }
    if (listing.ownerId === sellerId) {
      return NextResponse.json({ error: "Kendi ilanınıza teklif veremezsiniz" }, { status: 403 });
    }

    const last = await prisma.offer.findFirst({
      where: { listingId, sellerId },
      orderBy: { createdAt: "desc" },
    });

    if (last && last.status === "REJECTED") {
      const twoHoursMs = 2 * 60 * 60 * 1000;
      const elapsed = Date.now() - new Date(last.updatedAt).getTime();
      if (elapsed < twoHoursMs && priceNum <= Number(last.price as any)) {
        return NextResponse.json({ error: "2 saat bekleyiniz ve fiyatı artırınız" }, { status: 429 });
      }
    }

    const recent = await prisma.offer.findFirst({
      where: { listingId, sellerId, price: BigInt(priceNum), message },
      orderBy: { createdAt: "desc" },
    });
    const now = Date.now();
    if (recent && now - new Date(recent.createdAt).getTime() < 10000) {
      return NextResponse.json({ ok: true, offerId: recent.id });
    }

    const offer = await prisma.offer.create({
      data: {
        listingId,
        sellerId,
        price: BigInt(priceNum),
        message,
        attributesJson: JSON.stringify(attributes),
        status: "PENDING",
      },
    });

    await prisma.notification.create({
      data: {
        userId: listing.ownerId,
        type: "offer_created",
        title: "Yeni teklif",
        body: `İlanınıza yeni teklif geldi`,
        dataJson: JSON.stringify({ listingId, offerId: offer.id }),
      },
    });

    return NextResponse.json({ ok: true, offerId: offer.id });
  } catch (e) {
    return NextResponse.json({ error: "Teklif oluşturulurken hata" }, { status: 500 });
  }
}
