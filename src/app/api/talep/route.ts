import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth, getAdminUserId } from '@/auth'
import { revalidatePath } from "next/cache";
import { sendEmail, emailTemplates } from "@/lib/email";

export async function GET(request: NextRequest) {
  try {
    const parseJsonArray = (text: string | null) => {
      try {
        const parsed = text ? JSON.parse(text) : [];
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    };

    const parseJsonObject = (text: string | null) => {
      try {
        const parsed = text ? JSON.parse(text) : {};
        return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
      } catch {
        return {};
      }
    };

    const { searchParams } = new URL(request.url)
    const slug = (searchParams.get('id') || '').trim()
    if (!slug) return NextResponse.json({ error: 'id gerekli' }, { status: 400 })
    
    const isCode = /^\d{6}$/.test(slug) || /^\d{9}$/.test(slug)
    const session = await auth();
    const adminId = await getAdminUserId();

    const listing = await prisma.listing.findFirst({
      where: isCode ? { code: slug } : { id: slug },
      include: {
        category: true,
        subCategory: true,
        owner: { select: { id: true, name: true } },
        offers: {
          select: { id: true, price: true, body: true, createdAt: true, status: true, sellerId: true, seller: { select: { name: true } } },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    })

    if (!listing) return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 })

    const accepted = await prisma.offer.findFirst({ where: { listingId: listing.id, status: 'ACCEPTED' }, include: { seller: { select: { id: true, name: true } } }, orderBy: { updatedAt: 'desc' } })

    // If not OPEN, check permissions
    if (listing.status !== 'OPEN') {
       let authorized = false;
       if (session?.user?.id) {
          if (listing.ownerId === session.user.id) {
             authorized = true;
          } else if (adminId) {
             authorized = true;
          } else if (accepted?.sellerId && accepted.sellerId === session.user.id) {
             authorized = true;
          }
       }
       
       if (!authorized) {
          return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 });
       }
    }
    const images = parseJsonArray(listing.imagesJson)
    const price = listing.budget ? Number(listing.budget as any) : null
    const attributes = parseJsonObject(listing.attributesJson)
    return NextResponse.json({
      id: listing.id,
      code: listing.code,
      status: listing.status,
      currentUserId: session?.user?.id || null,
      title: listing.title,
      description: listing.description,
      price,
      category: { slug: listing.category.slug, name: listing.category.name },
      subCategory: listing.subCategory ? { slug: listing.subCategory.slug, name: listing.subCategory.name } : null,
      owner: listing.owner,
      location: { city: listing.city || '', district: listing.district || '' },
      createdAt: listing.createdAt,
      images,
      attributes,
      attributesJson: listing.attributesJson,
      offers: listing.offers.map((o: any) => ({ id: o.id, price: Number(o.price as any), message: o.body, createdAt: o.createdAt, status: o.status, sellerId: o.sellerId, sellerName: o.seller?.name || 'Teklif Veren' })),
      acceptedOffer: accepted ? { id: accepted.id, price: Number(accepted.price as any), message: accepted.body, createdAt: accepted.createdAt, sellerId: accepted.sellerId, sellerName: accepted.seller?.name || 'Teklif Veren', attributes: parseJsonObject(accepted.attributesJson || null) } : null,
    })
  } catch (e) {
    console.error('Talep detay hatası:', e);
    return NextResponse.json({ error: 'Talep detay getirilirken hata' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Yetkisiz işlem' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID gerekli' }, { status: 400 });

    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing) return NextResponse.json({ error: 'Talep bulunamadı' }, { status: 404 });

    const adminId = await getAdminUserId();
    const isAdmin = !!adminId;

    if (listing.ownerId !== session.user.id && !isAdmin) {
      return NextResponse.json({ error: 'Bu talebi silme yetkiniz yok' }, { status: 403 });
    }

    // Manually delete related records to avoid foreign key constraints
    await prisma.$transaction([
      prisma.favorite.deleteMany({ where: { listingId: id } }),
      prisma.offer.deleteMany({ where: { listingId: id } }),
      prisma.message.deleteMany({ where: { listingId: id } }),
      prisma.report.deleteMany({ where: { listingId: id } }),
      prisma.listing.delete({ where: { id } })
    ]);

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Silme işlemi başarısız' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Yetkisiz işlem' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID gerekli' }, { status: 400 });

    const body = await request.json();
    
    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing) return NextResponse.json({ error: 'Talep bulunamadı' }, { status: 404 });

    const adminId = await getAdminUserId();
    const isAdmin = !!adminId;

    if (listing.ownerId !== session.user.id && !isAdmin) {
      return NextResponse.json({ error: 'Bu talebi düzenleme yetkiniz yok' }, { status: 403 });
    }

    // Prepare update data
    const updateData: any = {};
    if (typeof body.status === "string") {
      if (!isAdmin) {
        return NextResponse.json({ error: 'Bu durumu değiştirme yetkiniz yok' }, { status: 403 });
      }
      const nextStatus = body.status.toUpperCase();
      if (!["OPEN", "REJECTED", "PENDING"].includes(nextStatus)) {
        return NextResponse.json({ error: 'Geçersiz durum' }, { status: 400 });
      }
      updateData.status = nextStatus;
    }
    if (body.title) updateData.title = body.title;
    if (body.description) updateData.description = body.description;
    
    // Kategori güncellemesi
    if (body.category) {
      // Mevcut kategori değişiyor mu? Kontrol etmeye gerek yok, Prisma handle eder.
      updateData.category = { connect: { slug: body.category } };
    }

    // Alt kategori güncellemesi
    // Eğer body.subcategory varsa connect et, yoksa ve özellikle gönderildiyse (boş string) disconnect et
    if (body.subcategory) {
      updateData.subCategory = { connect: { slug: body.subcategory } };
    } else if (body.subcategory === '') {
      // Eğer boş string gönderildiyse ve mevcut bir alt kategori varsa, bağlantıyı kes
      updateData.subCategory = { disconnect: true };
    }

    if (body.city) updateData.city = body.city;
    if (body.district) updateData.district = body.district;
    
    // Özellikler ve Bütçe
    if (body.attributes) {
      updateData.attributesJson = JSON.stringify(body.attributes);
      
      // Bütçe mantığı: 
      // Eğer minPrice varsa onu kullan, yoksa ve maxPrice varsa onu kullan.
      // Ancak talep-olustur sayfası ayrıca 'budget' alanını (maxPrice) gönderiyor.
      // Listing modelindeki 'budget' alanı sıralama için kullanılır.
      // En mantıklısı 'minPrice'ı baz almaktır çünkü "en az X TL" bütçem var demektir.
      // Ancak mevcut mantıkta 'budget' parametresi maxPrice olarak geliyor.
      
      if (body.attributes.minPrice) {
        const val = Number(body.attributes.minPrice);
        if (!isNaN(val)) updateData.budget = BigInt(Math.floor(val));
      }
    }
    
    // Eğer talep-olustur sayfasından 'budget' (Max Price) geliyorsa ve yukarıda set edilmediyse
    // Veya 'talep-olustur' mantığına göre ana bütçe bu ise:
    if (body.budget) {
       const val = Number(body.budget);
       if (!isNaN(val)) {
         // Eğer minPrice yoksa veya budget alanını ana referans kabul ediyorsak
         // Listing.budget genellikle sıralama için kullanıldığından,
         // Alıcı taleplerinde "En Yüksek Bütçe" daha belirleyici olabilir.
         // Ancak önceki kodda minPrice varsa o kullanılıyordu.
         // Çakışmayı önlemek için: minPrice varsa onu, yoksa maxPrice'ı (body.budget) kullanalım.
         // Fakat talep-olustur sayfasında her ikisi de gönderiliyor.
         
         // Karar: Listing.budget alanı "sıralama değeri"dir.
         // Alıcı taleplerinde genellikle "En Yüksek Fiyat"a göre sıralama yapılır mı?
         // Yoksa "En Düşük Fiyat"a göre mi?
         // Kullanıcı "En az 1000, En çok 2000" diyor.
         // Listeleme sayfasında "1000 - 2000 TL" gözüküyor.
         // Sıralama "Fiyata göre artan" ise 1000'i baz almalı.
         // "Fiyata göre azalan" ise 2000'i baz almalı.
         // Tek bir kolon olduğu için genellikle "minPrice" (taban fiyat) daha güvenlidir.
         // Ancak body.budget (maxPrice) geliyor.
         
         // Önceki kodda:
         // if (body.attributes.minPrice) updateData.budget = BigInt(...)
         // if (body.budget) updateData.budget = BigInt(...) -> Bu eziyordu.
         
         // Eğer minPrice varsa onu kullanalım (Taban Fiyat).
         // Eğer yoksa body.budget (Tavan Fiyat) kullanalım.
         
         if (!updateData.budget) {
            updateData.budget = BigInt(Math.floor(val));
         }
       }
    }
    
    if (body.images) updateData.imagesJson = JSON.stringify(body.images);

    const updated = await prisma.listing.update({
      where: { id },
      data: updateData,
    });

    if (isAdmin && updateData.status === "OPEN") {
      const owner = await prisma.user.findUnique({
        where: { id: updated.ownerId },
        select: { name: true, email: true },
      });
      if (owner?.email) {
        await sendEmail({
          to: owner.email,
          subject: `Talebiniz Yayında: ${updated.title}`,
          html: emailTemplates.listingPublished(owner.name || "Kullanıcı", updated.title, updated.id),
        });
      }
      revalidatePath("/admin/talepler");
      revalidatePath("/");
    } else if (isAdmin && typeof updateData.status === "string") {
      revalidatePath("/admin/talepler");
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error('Listing update error:', e);
    // Hata detayını döndür (güvenlik açısından sadece development'ta veya genel bir mesajla)
    // Prisma hataları genellikle 'code' veya 'meta' içerir.
    const errorMessage = e?.message || 'Güncelleme işlemi sırasında bir hata oluştu';
    return NextResponse.json({ error: errorMessage, details: e }, { status: 500 });
  }
}
