import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth, getAdminUserId } from '@/auth'
import { sendEmail, emailTemplates } from "@/lib/email";
import { z } from 'zod';

const patchSchema = z.object({
  offerId: z.string().min(1),
  action: z.enum(['accept', 'reject', 'withdraw', 'update']),
  rejectionReason: z.string().optional(),
});

const ensureUploadsClean = async (urls: string[]) => {
  if (urls.length === 0) return { ok: true as const };
  return { ok: true as const };
};

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'given'
    const status = searchParams.get('status') || undefined

    const where: any = {}
    if (type === 'given') {
      where.sellerId = session.user.id
    } else if (type === 'received') {
      where.listing = { ownerId: session.user.id }
    }
    if (status) where.status = status

    const offers = await prisma.offer.findMany({
      where,
      include: {
        listing: {
          include: {
            owner: { select: { id: true, name: true, email: true } },
            category: true,
            subCategory: true,
          },
        },
        seller: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' },
    })

    const formatted = offers.map((o: any) => ({
      id: o.id,
      listingId: o.listingId,
      sellerId: o.sellerId,
      listingTitle: o.listing?.title || '',
      price: o.price ? Number(o.price) : 0,
      message: o.body || '',
      status: o.status,
      createdAt: o.createdAt,
      counterpartName: type === 'given' ? (o.listing?.owner?.name || 'Anonim') : (o.seller?.name || 'Teklif Veren'),
      counterpartEmail: type === 'given' ? (o.listing?.owner?.email || '') : (o.seller?.email || ''),
      category: o.listing?.category?.slug || '',
      location: { city: o.listing?.city || '', district: o.listing?.district || '' },
      rejectionReason: o.rejectionReason || null,
    }))

    return NextResponse.json(formatted)
  } catch {
    return NextResponse.json({ error: 'Teklifler getirilirken hata' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
    const userId = session.user.id as string
    
    const body = await request.json()
    const validation = patchSchema.safeParse(body);

    if (!validation.success) {
       return NextResponse.json({ error: 'Geçersiz veri', details: validation.error.flatten() }, { status: 400 })
    }

    const { offerId, action } = validation.data;

    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
      include: { 
        listing: { select: { ownerId: true, id: true, title: true } },
        seller: { select: { id: true, name: true, email: true } }
      }
    })
    if (!offer) return NextResponse.json({ error: 'Teklif bulunamadı' }, { status: 404 })

    if (action === 'accept') {
      if (offer.listing.ownerId !== userId) return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 })
      const updated = await prisma.offer.update({ where: { id: offerId }, data: { status: 'ACCEPTED' } })
      
      // Create system message to start conversation
      await prisma.message.create({
        data: {
          listingId: offer.listingId,
          senderId: userId, // Owner (Acceptor)
          toUserId: offer.sellerId, // Buyer (Offer Maker)
          content: `Teklifinizi kabul ettim! İlan hakkında konuşabiliriz. (Teklif: ${Number(offer.price).toLocaleString('tr-TR')})`,
          read: false,
        }
      });

      await prisma.notification.create({
        data: {
          userId: offer.sellerId,
          type: 'offer_accepted',
          title: 'Teklif kabul edildi',
          body: offer.listing.title,
          dataJson: JSON.stringify({ listingId: offer.listingId, offerId }),
        },
      })

      if (offer.seller?.email) {
        await sendEmail({
          to: offer.seller.email,
          subject: `Teklifiniz Kabul Edildi: ${offer.listing.title}`,
          html: emailTemplates.offerStatusChanged(offer.seller.name || 'Kullanıcı', offer.listing.title, 'ACCEPTED', offer.listingId)
        });
      }

      return NextResponse.json({ ok: true, status: updated.status })
    }

    if (action === 'reject') {
      if (offer.listing.ownerId !== userId) return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 })
      
      const rejectionReason = body.rejectionReason;
      if (!rejectionReason || typeof rejectionReason !== 'string' || rejectionReason.trim().length === 0) {
        return NextResponse.json({ error: 'Ret sebebi belirtmelisiniz' }, { status: 400 });
      }

      const updated = await prisma.offer.update({ 
        where: { id: offerId }, 
        data: { 
          status: 'REJECTED',
          ...(rejectionReason ? { rejectionReason: rejectionReason.trim() } : {})
        } 
      })
      await prisma.notification.create({
        data: {
          userId: offer.sellerId,
          type: 'offer_rejected',
          title: 'Teklif reddedildi',
          body: `Teklifiniz reddedildi. Sebep: ${rejectionReason}`,
          dataJson: JSON.stringify({ listingId: offer.listingId, offerId }),
        },
      })

      if (offer.seller?.email) {
        await sendEmail({
          to: offer.seller.email,
          subject: `Teklifiniz Reddedildi: ${offer.listing.title}`,
          html: emailTemplates.offerStatusChanged(offer.seller.name || 'Kullanıcı', offer.listing.title, 'REJECTED', offer.listingId)
        });
      }

      return NextResponse.json({ ok: true, status: updated.status })
    }

    if (action === 'update') {
      if (offer.sellerId !== userId) return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 })
      if (offer.status !== 'PENDING') return NextResponse.json({ error: 'Sadece beklemedeki teklifler güncellenebilir' }, { status: 400 })
      const newPriceNum = Number(body.price)
      const newMessage = String(body.message ?? offer.body ?? '')
      if (!newPriceNum || newPriceNum < 1) return NextResponse.json({ error: 'Geçersiz fiyat' }, { status: 400 })

      const images = Array.isArray(body.images) ? body.images.map((x: any) => String(x)).filter(Boolean).slice(0, 10) : null
      const attributes = body.attributes && typeof body.attributes === 'object' && !Array.isArray(body.attributes) ? body.attributes : null
      if (images && images.length > 0) {
        await ensureUploadsClean(images);
      }

      const updated = await prisma.offer.update({
        where: { id: offerId },
        data: {
          price: BigInt(newPriceNum),
          body: newMessage,
          ...(images ? { imagesJson: JSON.stringify(images) } : {}),
          ...(attributes ? { attributesJson: JSON.stringify(attributes) } : {}),
          status: 'PENDING',
        }
      })

      await prisma.notification.create({
        data: {
          userId: offer.listing.ownerId,
          type: 'offer_updated',
          title: 'Teklif güncellendi',
          body: offer.listing.title,
          dataJson: JSON.stringify({ listingId: offer.listingId, offerId }),
        },
      })

      const listing = await prisma.listing.findUnique({ where: { id: offer.listingId }, include: { owner: true } });
      if (listing?.owner?.email) {
        await sendEmail({
          to: listing.owner.email,
          subject: `Teklif Güncellendi: ${listing.title}`,
          html: emailTemplates.offerReceived(listing.owner.name || 'Kullanıcı', listing.title, newPriceNum, listing.id)
        });
      }

      return NextResponse.json({ ok: true, status: updated.status })
    }

    if (action === 'withdraw') {
      if (offer.sellerId !== userId) return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 })
      const newPriceNum = Number(body.price)
      const newMessage = String(body.message || offer.body)
      if (!newPriceNum || newPriceNum < 1) return NextResponse.json({ error: 'Geçersiz fiyat' }, { status: 400 })
      if (offer.status === 'ACCEPTED') return NextResponse.json({ error: 'Kabul edilen teklif güncellenemez' }, { status: 400 })
      const twoHoursMs = 2 * 60 * 60 * 1000
      if (offer.status === 'REJECTED') {
        const elapsed = Date.now() - new Date(offer.updatedAt).getTime()
        if (elapsed < twoHoursMs && newPriceNum <= Number(offer.price as any)) {
          return NextResponse.json({ error: '2 saat bekleyiniz ve fiyatı artırınız' }, { status: 429 })
        }
      }
      const images = Array.isArray(body.images) ? body.images.map((x: any) => String(x)).filter(Boolean).slice(0, 10) : null
      const attributes = body.attributes && typeof body.attributes === 'object' && !Array.isArray(body.attributes) ? body.attributes : null
      if (images && images.length > 0) {
        await ensureUploadsClean(images);
      }
      const updated = await prisma.offer.update({
        where: { id: offerId },
        data: {
          price: BigInt(newPriceNum),
          body: newMessage,
          ...(images ? { imagesJson: JSON.stringify(images) } : {}),
          ...(attributes ? { attributesJson: JSON.stringify(attributes) } : {}),
          status: 'PENDING'
        }
      })
      await prisma.notification.create({
        data: {
          userId: offer.listing.ownerId,
          type: 'offer_updated',
          title: 'Teklif güncellendi',
          body: offer.listing.title,
          dataJson: JSON.stringify({ listingId: offer.listingId, offerId }),
        },
      })
      
      const listing = await prisma.listing.findUnique({ where: { id: offer.listingId }, include: { owner: true } });
      if (listing?.owner?.email) {
        await sendEmail({
          to: listing.owner.email,
          subject: `Teklif Güncellendi: ${listing.title}`,
          html: emailTemplates.offerReceived(listing.owner.name || 'Kullanıcı', listing.title, newPriceNum, listing.id)
        });
      }

      return NextResponse.json({ ok: true, status: updated.status })
    }

    return NextResponse.json({ error: 'Desteklenmeyen işlem' }, { status: 400 })
  } catch {
    return NextResponse.json({ error: 'Teklif güncellenirken hata' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const adminId = await getAdminUserId();
    if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const offerId = (searchParams.get("offerId") || searchParams.get("id") || "").trim();
    if (!offerId) return NextResponse.json({ error: "offerId gerekli" }, { status: 400 });

    await prisma.offer.delete({ where: { id: offerId } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Teklif silinirken hata" }, { status: 500 });
  }
}
