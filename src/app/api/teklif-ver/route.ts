import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail, emailTemplates } from "@/lib/email";

const getUploadScanClient = () => (prisma as any).uploadScan as
  | {
      findMany: (args: any) => Promise<any[]>;
    }
  | undefined;
let uploadScanTableAvailable: boolean | null = null;

async function hasUploadScanTable(): Promise<boolean> {
  if (uploadScanTableAvailable !== null) return uploadScanTableAvailable;
  try {
    const res: Array<{ name: string | null }> = await prisma.$queryRaw`
      SELECT to_regclass('public."UploadScan"')::text as name
    `;
    uploadScanTableAvailable = Array.isArray(res) && res.length > 0 && !!res[0]?.name;
  } catch {
    uploadScanTableAvailable = false;
  }
  return uploadScanTableAvailable;
}

async function ensureListingBlockTable() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "ListingBlock" (
      "id" TEXT PRIMARY KEY,
      "listingId" TEXT NOT NULL,
      "ownerId" TEXT NOT NULL,
      "blockedUserId" TEXT NOT NULL,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE ("listingId", "blockedUserId")
    );
  `)
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ListingBlock_listingId_idx" ON "ListingBlock" ("listingId");`)
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ListingBlock_ownerId_idx" ON "ListingBlock" ("ownerId");`)
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ListingBlock_blockedUserId_idx" ON "ListingBlock" ("blockedUserId");`)
}

async function isBlocked(listingId: string, blockedUserId: string): Promise<boolean> {
  await ensureListingBlockTable()
  const rows = await prisma.$queryRawUnsafe<Array<{ id: string }>>(
    `SELECT "id" FROM "ListingBlock" WHERE "listingId" = $1 AND "blockedUserId" = $2 LIMIT 1`,
    listingId,
    blockedUserId
  )
  return rows.length > 0
}

function startOfLocalDay(d: Date) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function safeParseJsonObject(input: any): Record<string, any> {
  if (!input || typeof input !== 'string') return {};
  try {
    const parsed = JSON.parse(input);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function isMeaningfulAttributeValue(v: any) {
  if (v === null || v === undefined) return false;
  if (typeof v === 'boolean') return true;
  if (typeof v === 'number') return Number.isFinite(v);
  const s = String(v).trim();
  return s.length > 0;
}

async function ensureUploadsClean(urls: string[]) {
  const unique = Array.from(new Set(urls.map((u) => u.trim()).filter(Boolean)));
  if (unique.length === 0) return { ok: true as const };
  let scans: Array<{ fileUrl: string; status: string | null }> = [];
  try {
    const tableOk = await hasUploadScanTable();
    if (!tableOk) return { ok: true as const };
    const uploadScan = getUploadScanClient();
    if (!uploadScan) return { ok: true as const };
    scans = await uploadScan.findMany({
      where: { fileUrl: { in: unique } },
      select: { fileUrl: true, status: true },
    });
  } catch (err: any) {
    if (err?.code === 'P2021') {
      return { ok: true as const };
    }
    throw err;
  }
  const statusByUrl = new Map(scans.map((s) => [s.fileUrl, String(s.status || '').toUpperCase()]));
  const missing = unique.filter((u) => !statusByUrl.has(u));
  if (missing.length > 0) return { ok: false as const, error: "Görsel tarama kaydı bulunamadı" };
  const infected = unique.filter((u) => statusByUrl.get(u) === "INFECTED");
  if (infected.length > 0) return { ok: false as const, error: "Görsel güvenlik taramasından geçemedi" };
  const failed = unique.filter((u) => statusByUrl.get(u) === "FAILED");
  if (failed.length > 0) return { ok: false as const, error: "Görsel taraması başarısız oldu" };
  const pending = unique.filter((u) => {
    const st = statusByUrl.get(u);
    return st === "PENDING" || st === "IN_PROGRESS";
  });
  if (pending.length > 0) return { ok: true as const };
  const unknown = unique.filter((u) => statusByUrl.get(u) !== "CLEAN");
  if (unknown.length > 0) return { ok: false as const, error: "Görsel taraması doğrulanamadı" };
  return { ok: true as const };
}

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

    const scanCheck = await ensureUploadsClean(cleanImages);
    if (!scanCheck.ok) {
      return NextResponse.json({ error: scanCheck.error }, { status: 400 });
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

    if (await isBlocked(listingId, sellerId)) {
      return NextResponse.json({ error: "Bu talep için teklif verme yetkiniz bulunmuyor" }, { status: 403 });
    }

    const listingAttrs = safeParseJsonObject(listing.attributesJson);
    const reservedKeys = new Set(['minPrice', 'maxPrice', 'minBudget', 'budget']);
    const allowedAttrKeys = new Set<string>();
    for (const [k, v] of Object.entries(listingAttrs)) {
      if (!k || reservedKeys.has(k)) continue;
      if (!isMeaningfulAttributeValue(v)) continue;
      allowedAttrKeys.add(k);
    }

    const extraKeys = Object.keys(attributes || {}).filter((k) => !allowedAttrKeys.has(k));
    if (extraKeys.length > 0) {
      return NextResponse.json(
        { error: `Talep dışı alanlar gönderilemez: ${extraKeys.slice(0, 20).join(", ")}` },
        { status: 400 }
      );
    }

    const categoryId = listing.categoryId;
    const subCategoryId = listing.subCategoryId;
    if (categoryId) {
      const dbAttrs = await prisma.categoryAttribute.findMany({
        where: {
          categoryId,
          showInRequest: true,
          OR: [{ subCategoryId: null }, { subCategoryId }],
        },
        orderBy: [{ subCategoryId: "asc" }, { order: "asc" }],
      });

      if (Array.isArray(dbAttrs) && dbAttrs.length > 0) {
        const bySlug = new Map<string, (typeof dbAttrs)[number]>();
        dbAttrs.forEach((a) => {
          if (!a?.slug) return;
          bySlug.set(a.slug, a);
        });

        const missing: string[] = [];
        for (const a of bySlug.values()) {
          if (!a.required) continue;
          const inRequest =
            allowedAttrKeys.has(a.slug) ||
            allowedAttrKeys.has(`${a.slug}Min`) ||
            allowedAttrKeys.has(`${a.slug}Max`);
          if (!inRequest) continue;
          const normalizedType = a.type === "checkbox" ? "boolean" : a.type;
          if (normalizedType === "range-number") {
            const minKey = `${a.slug}Min`;
            const maxKey = `${a.slug}Max`;
            const base = attributes[a.slug];
            const minV = attributes[minKey];
            const maxV = attributes[maxKey];
            const present =
              (base !== undefined && String(base).trim() !== "") ||
              (minV !== undefined && String(minV).trim() !== "") ||
              (maxV !== undefined && String(maxV).trim() !== "");
            if (!present) missing.push(a.slug);
            continue;
          }
          const v = attributes[a.slug];
          const present =
            normalizedType === "boolean"
              ? (a.slug in attributes)
              : (v !== undefined && String(v).trim() !== "");
          if (!present) missing.push(a.slug);
        }

        if (allowedAttrKeys.has("model") && String(attributes["marka"] || "").trim() && !String(attributes["model"] || "").trim()) {
          missing.push("model");
        }

        if (missing.length > 0) {
          return NextResponse.json(
            { error: `Eksik alanlar: ${Array.from(new Set(missing)).join(", ")}` },
            { status: 400 }
          );
        }
      }
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

    const now = new Date();
    const dayStart = startOfLocalDay(now);
    const offersToday = await prisma.offer.count({
      where: { listingId, sellerId, createdAt: { gte: dayStart } },
    });
    if (offersToday >= 2) {
      return NextResponse.json({ error: "Aynı talebe günde en fazla 2 defa teklif verebilirsiniz" }, { status: 429 });
    }

    const last = await prisma.offer.findFirst({
      where: { listingId, sellerId },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    });
    if (last) {
      const cooldownMs = 60 * 60 * 1000;
      const nextAllowed = new Date(new Date(last.createdAt).getTime() + cooldownMs);
      if (now.getTime() < nextAllowed.getTime()) {
        const remainSec = Math.max(1, Math.ceil((nextAllowed.getTime() - now.getTime()) / 1000));
        return NextResponse.json(
          { error: "Tekrar teklif vermek için 1 saat beklemelisiniz", cooldownSecondsRemaining: remainSec, nextAllowedAt: nextAllowed.toISOString() },
          { status: 429 }
        );
      }
    }

    const budget =
      typeof listing.budget === 'bigint'
        ? Number(listing.budget)
        : Number(listing.budget || 0);

    if (budget > 0 && priceNum > budget) {
      const overBudgetExisting = await prisma.offer.findFirst({
        where: { listingId, sellerId, price: { gt: BigInt(budget) } },
        select: { id: true },
      });
      if (overBudgetExisting) {
        return NextResponse.json({ error: "Bütçe üzeri teklifi bu talep için en fazla 1 defa verebilirsiniz" }, { status: 429 });
      }
    }

    const recent = await prisma.offer.findFirst({
      where: { listingId, sellerId, price: BigInt(priceNum), body: message },
      orderBy: { createdAt: "desc" },
    });
    const nowMs = Date.now();
    if (recent && nowMs - new Date(recent.createdAt).getTime() < 10000) {
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
