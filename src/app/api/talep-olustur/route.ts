import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { ATTR_SCHEMAS } from '@/data/attribute-schemas';
import { ATTR_SUBSCHEMAS } from '@/data/attribute-overrides';
import { sendEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    // Kullanıcı oturumunu kontrol et - EN BAŞTA
    let session;
    try {
      session = await auth();
      console.log('Session:', session);
    } catch (authError) {
      console.error('Auth hatası:', authError);
      return NextResponse.json(
        { error: 'Oturum kontrolü başarısız oldu' },
        { status: 401 }
      );
    }
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('Request body:', body);
    const { title, description, category, subcategory, city, district, budget, images } = body;

    // Validasyon - detaylı kontrol
    const missingFields = [];
    if (!title) missingFields.push('title');
    if (!description) missingFields.push('description');
    if (!category) missingFields.push('category');
    if (!subcategory) missingFields.push('subcategory');
    if (!city) missingFields.push('city');
    if (!district) missingFields.push('district');
    if (!budget) missingFields.push('budget');

    // Kategoriye özel zorunlu alanlar
    const attrs: Record<string, any> = body.attributes || {};
    const overrideKey = `${category}/${subcategory || ''}`;
    const combined = [ ...(ATTR_SCHEMAS[category] || []), ...((ATTR_SUBSCHEMAS[overrideKey] || [])) ];
    combined.forEach((f: any) => {
      if (!f?.required) return;
      if (f.type === 'range-number' && f.minKey && f.maxKey) {
        const a = attrs[f.minKey];
        const b = attrs[f.maxKey];
        const hasA = a !== undefined && String(a) !== '';
        const hasB = b !== undefined && String(b) !== '';
        if (!hasA) missingFields.push(f.minKey);
        if (!hasB) missingFields.push(f.maxKey);
      } else if (f.key) {
        const v = attrs[f.key];
        const present = f.type === 'boolean' ? (f.key in attrs) : (v !== undefined && String(v).trim() !== '');
        if (!present) missingFields.push(f.key);
      }
    });
    if (String(attrs['marka'] || '').trim() && !String(attrs['model'] || '').trim()) missingFields.push('model');
    
    if (missingFields.length > 0) {
      console.log('Validation failed. Missing fields:', missingFields);
      return NextResponse.json(
        { error: `Eksik alanlar: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }
    // Bütçe aralığı tutarlılığı
    const minPrice = body.attributes?.minPrice;
    const maxPrice = body.attributes?.maxPrice;
    if (minPrice !== undefined && maxPrice !== undefined) {
      const a = Number(minPrice); const b = Number(maxPrice);
      if (!Number.isNaN(a) && !Number.isNaN(b) && a > b) {
        console.log('Validation failed. Min price > Max price');
        return NextResponse.json(
          { error: 'Minimum fiyat, maksimum fiyattan büyük olamaz' },
          { status: 400 }
        );
      }
    }

    let imagesArr: string[] = [];
    if (Array.isArray(images)) {
      imagesArr = images
        .filter((u: any) => typeof u === 'string')
        .slice(0, 10);
    }

    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // Kategorileri bul
    const categoryRecord = await prisma.category.findFirst({
      where: { slug: category }
    });

    const subCategoryRecord = await prisma.subCategory.findFirst({
      where: { slug: subcategory }
    });

    if (!categoryRecord) {
      console.log(`Category not found in DB: ${category}`);
      return NextResponse.json(
        { error: 'Geçersiz kategori' },
        { status: 400 }
      );
    }

    // Yeni talep oluştur
    const newListing = await prisma.$transaction(async (tx) => {
      // Sequence tablosu yoksa hata vermemesi için basit bir çözüm veya sequence modelini kontrol et
      // Şimdilik Listing tablosundaki en yüksek code değerini alıp artıralım veya code'u random üretelim.
      // Ancak sequence tablosu varsa onu kullan.
      // Varsayılan olarak Sequence modelini schema'da görmedim, o yüzden burada hata olabilir.
      // Schema'da sequence yoktu. O yüzden burayı düzeltmemiz lazım.
      // Listing modelinde code alanı unique.
      
      // Sequence tablosu olmadığı için code üretimini değiştirelim.
      // const seq = await tx.sequence.upsert(...) -> Bu kısım hata verebilir.
      
      // Alternatif: Listing sayısını alıp +1 yapabiliriz (race condition riski var ama MVP için ok)
      // Veya UUID kullanıyoruz zaten id olarak, code sadece gösterim içinse rastgele sayı üretebiliriz.
      const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      return tx.listing.create({
      data: {
        title,
        description,
        budget: BigInt(budget),
        city,
        district,
        status: 'PENDING',
        ownerId: user.id,
        categoryId: categoryRecord.id,
        subCategoryId: subCategoryRecord?.id || null,
        imagesJson: imagesArr.length ? JSON.stringify(imagesArr) : null,
        attributesJson: body.attributes ? JSON.stringify(body.attributes) : null,
        code: randomCode,
      }
      });
    });

    const safeListing = {
      ...newListing,
      budget: newListing.budget ? Number(newListing.budget as any) : null,
      images: newListing.imagesJson ? JSON.parse(newListing.imagesJson) : [],
      attributes: newListing.attributesJson ? JSON.parse(newListing.attributesJson) : {},
    } as any;

    try {
      const titleLower = title.toLocaleLowerCase('tr');

      const relevantSavedSearches = await prisma.savedSearch.findMany({
        where: {
          OR: [
            { categorySlug: category },
            { categorySlug: null }
          ]
        },
        include: { user: true }
      });

      const notificationsToCreate = [];

      const baseFilters = new Set([
        'minPrice',
        'maxPrice',
        'city',
        'district',
        'status',
        'sort',
        'page',
        'limit',
        'userId',
        'category',
        'subcategory',
        'q',
        'ids'
      ]);

      const matchesFilters = (filters: any) => {
        if (!filters || typeof filters !== 'object') return true;

        const listingBudget = budget ? Number(budget) : undefined;
        if (typeof filters.minPrice === 'number' && typeof listingBudget === 'number') {
          if (listingBudget < filters.minPrice) return false;
        }
        if (typeof filters.maxPrice === 'number' && typeof listingBudget === 'number') {
          if (listingBudget > filters.maxPrice) return false;
        }

        if (filters.city && city && city !== filters.city) return false;
        if (filters.district && district && district !== filters.district) return false;

        const attrs = body.attributes || {};
        const filterKeys = Object.keys(filters).filter((k) => !baseFilters.has(k));

        for (const k of filterKeys) {
          const v = filters[k];
          if (k.endsWith('Min')) {
            const base = k.slice(0, -3);
            const actual = attrs[base + 'Min'] ?? attrs[base];
            if (actual !== undefined && Number(actual) < Number(v)) return false;
          } else if (k.endsWith('Max')) {
            const base = k.slice(0, -3);
            const actual = attrs[base + 'Max'] ?? attrs[base];
            if (actual !== undefined && Number(actual) > Number(v)) return false;
          } else {
            const actual = attrs[k];
            if (actual === undefined) continue;
            const reqParts = String(v).split(',').map((s: string) => s.trim().toLowerCase()).filter(Boolean);
            const actParts = String(actual).split(',').map((s: string) => s.trim().toLowerCase()).filter(Boolean);
            if (reqParts.length === 0) continue;
            const ok = reqParts.some((rp) => actParts.includes(rp));
            if (!ok) return false;
          }
        }

        return true;
      };

      for (const search of relevantSavedSearches) {
        if (search.userId === user.id) continue;

        const filters = (search as any).filtersJson as any || {};
        const mode = (search as any).matchMode as 'TITLE' | 'CATEGORY' | 'FILTERS' | null;
        const effectiveMode: 'TITLE' | 'CATEGORY' | 'FILTERS' =
          mode === 'CATEGORY' || mode === 'FILTERS' ? mode : 'TITLE';

        const queryLower = search.query.toLocaleLowerCase('tr');

        let isMatch = false;

        if (effectiveMode === 'CATEGORY') {
          isMatch = true;
        } else if (effectiveMode === 'FILTERS') {
          isMatch = matchesFilters(filters);
        } else {
          if (!queryLower || titleLower.includes(queryLower)) {
            const filtersOk = matchesFilters(filters);
            if (filtersOk) isMatch = true;
          }
        }

        if (!isMatch) continue;

        notificationsToCreate.push({
          userId: search.userId,
          type: 'SAVED_SEARCH_MATCH',
          title: 'Aradığınız ürün için yeni talep!',
          body: `"${search.query}" aramanızla eşleşen yeni bir talep açıldı: ${title}`,
          link: `/talep/${newListing.id}`,
          dataJson: JSON.stringify({ listingId: newListing.id, searchId: search.id })
        });

        if (search.user.email) {
          await sendEmail({
            to: search.user.email,
            subject: `Yeni İlan Alarmı: "${search.query}"`,
            html: `
              <h2>Aradığınız kriterlere uygun yeni bir talep var!</h2>
              <p>Merhaba ${search.user.name || 'Kullanıcı'},</p>
              <p><strong>"${search.query}"</strong> aramanızla eşleşen yeni bir alım talebi oluşturuldu:</p>
              <div style="padding: 15px; border: 1px solid #eee; border-radius: 8px; margin: 15px 0;">
                <h3 style="margin-top: 0;">${title}</h3>
                <p style="color: #666;">${description.substring(0, 100)}...</p>
                <p><strong>Bütçe:</strong> ${budget ? Number(budget).toLocaleString('tr-TR') + ' TL' : 'Belirtilmemiş'}</p>
                <p><strong>Konum:</strong> ${city}, ${district}</p>
              </div>
              <p><a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.varsagel.com'}/talep/${newListing.id}" style="background: #0891b2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Talebi İncele</a></p>
              <br>
              <p>Bu alarmı "Kayıtlı Aramalarım" sayfasından yönetebilirsiniz.</p>
            `
          });
        }
      }

      if (notificationsToCreate.length > 0) {
        await prisma.notification.createMany({
          data: notificationsToCreate
        });
      }
    } catch (err) {
      console.error('Notification trigger error:', err);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Talebiniz başarıyla oluşturuldu!',
        data: safeListing,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Talep oluşturma hatası:', error);
    return NextResponse.json(
      { error: 'Talep oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
}
