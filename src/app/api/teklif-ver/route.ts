import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail, emailTemplates } from "@/lib/email";

// Force TS re-evaluation

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Oturum açmanız gerekiyor" }, { status: 401 });
  }
  const sellerId = session.user.id as string;
  
  // Verify user exists in DB (handle stale sessions)
  const user = await prisma.user.findUnique({ where: { id: sellerId } });
  if (!user) {
    return NextResponse.json({ error: "Kullanıcı bulunamadı. Lütfen çıkış yapıp tekrar giriş yapın." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const listingId = String(body.listingId || "");
    const priceNum = Number(body.price);
    const message = String(body.message || "");
    const attributes = body.attributes || {};
    const images = body.images || [];
    
    if (!listingId || !priceNum || priceNum < 1 || !message) {
      return NextResponse.json({ error: "Geçersiz alanlar" }, { status: 400 });
    }
    if (images.length === 0) {
      return NextResponse.json({ error: "En az bir görsel eklemelisiniz" }, { status: 400 });
    }
    if (message.trim().length < 20) {
      return NextResponse.json({ error: "Mesaj en az 20 karakter olmalı" }, { status: 400 });
    }

    const listing = await prisma.listing.findUnique({ 
      where: { id: listingId }, 
      include: { owner: { select: { id: true, name: true, email: true } } } 
    });
    if (!listing) {
      return NextResponse.json({ error: "Talep bulunamadı" }, { status: 404 });
    }
    if (listing.status !== "OPEN") {
      return NextResponse.json({ error: "Bu talep henüz yayında değil" }, { status: 403 });
    }
    if (listing.ownerId === sellerId) {
      return NextResponse.json({ error: "Kendi talebinize teklif veremezsiniz" }, { status: 403 });
    }

    const pendingOffer = await prisma.offer.findFirst({
      where: {
        listingId,
        sellerId,
        status: "PENDING"
      }
    });

    if (pendingOffer) {
      return NextResponse.json({ error: "Bu talep için zaten bekleyen bir teklifiniz var. Talep sahibi yanıtlayana kadar yeni teklif veremezsiniz." }, { status: 400 });
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
      where: { listingId, sellerId, price: BigInt(priceNum), body: message },
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
        body: message,
        attributesJson: JSON.stringify(attributes),
        imagesJson: JSON.stringify(images),
        status: "PENDING",
      },
    });

    await prisma.notification.create({
      data: {
        userId: listing.ownerId,
        type: "offer_created",
        title: "Yeni teklif",
        body: `Talebinize yeni teklif geldi`,
        dataJson: JSON.stringify({ listingId, offerId: offer.id }),
      },
    });

    if (listing.owner?.email) {
      await sendEmail({
        to: listing.owner.email,
        subject: `Yeni Teklif: ${listing.title}`,
        html: emailTemplates.offerReceived(listing.owner.name || 'Kullanıcı', listing.title, priceNum, listing.id)
      });
    }

    return NextResponse.json({ ok: true, offerId: offer.id });
  } catch (e: any) {
    console.error("Teklif oluşturma hatası:", e);
    return NextResponse.json({ error: "Teklif oluşturulurken hata: " + (e.message || e) }, { status: 500 });
  }
}
