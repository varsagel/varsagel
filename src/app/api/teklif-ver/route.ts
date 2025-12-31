import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail, emailTemplates } from "@/lib/email";

export async function POST(request: NextRequest) {
  let session;
  if (process.env.NODE_ENV !== 'production' && request.headers.get('x-bypass-auth') === 'true') {
     session = { user: { id: request.headers.get('x-debug-user-id') } };
  } else {
     session = await auth();
  }

  if (!session?.user?.id) {
    console.log("Teklif verme yetkisiz:", {
      url: request.url,
      hasBypass: request.headers.get("x-bypass-auth") === "true",
    });
    return NextResponse.json({ error: "Oturum açmanız gerekiyor" }, { status: 401 });
  }
  const sellerId = session.user.id as string;
  
  // Verify user exists in DB (handle stale sessions)
  const user = await prisma.user.findUnique({ where: { id: sellerId } });
  if (!user) {
    console.log("Teklif verme kullanıcı bulunamadı:", { sellerId });
    return NextResponse.json({ error: "Kullanıcı bulunamadı. Lütfen çıkış yapıp tekrar giriş yapın." }, { status: 401 });
  }

  try {
    const body = await request.json();
    console.log("Teklif verme isteği:", { 
      sellerId, 
      listingId: body.listingId, 
      price: body.price, 
      imagesCount: body.images?.length 
    });

    const listingId = String(body.listingId || "");
    const priceRaw = Number(body.price);
    const priceNum = Number.isFinite(priceRaw) ? Math.floor(priceRaw) : NaN;
    const message = String(body.message || "");
    const attributes =
      body.attributes && typeof body.attributes === "object" && !Array.isArray(body.attributes)
        ? body.attributes
        : {};
    const images = Array.isArray(body.images) ? body.images : [];
    const cleanImages = images
      .map((x: any) => (typeof x === "string" ? x.trim() : ""))
      .filter((x: string) => x.length > 0);
    
    if (!listingId || !priceNum || priceNum < 1 || !message) {
      console.log("Geçersiz alanlar:", { listingId, priceNum, messageLen: message.length });
      return NextResponse.json({ error: "Geçersiz alanlar" }, { status: 400 });
    }
    if (cleanImages.length === 0) {
      console.log("Görsel eksik");
      return NextResponse.json({ error: "En az bir görsel eklemelisiniz" }, { status: 400 });
    }
    if (message.trim().length < 20) {
      console.log("Mesaj kısa:", message.length);
      return NextResponse.json({ error: "Mesaj en az 20 karakter olmalı" }, { status: 400 });
    }

    const listing = await prisma.listing.findUnique({ 
      where: { id: listingId }, 
      include: { owner: { select: { id: true, name: true, email: true } } } 
    });
    if (!listing) {
      console.log("Talep bulunamadı:", listingId);
      return NextResponse.json({ error: "Talep bulunamadı" }, { status: 404 });
    }
    console.log("Talep durumu:", listing.status);
    if (listing.status !== "OPEN") {
      return NextResponse.json({ error: "Bu talep henüz yayında değil" }, { status: 403 });
    }
    if (listing.ownerId === sellerId) {
      console.log("Kendi talebine teklif denemesi");
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
      console.log("Bekleyen teklif var:", pendingOffer.id);
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
        imagesJson: JSON.stringify(cleanImages),
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
