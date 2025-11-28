import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/auth';
import { ATTR_SCHEMAS } from '@/data/attribute-schemas';
import { ATTR_SUBSCHEMAS } from '@/data/attribute-overrides';

const prisma = new PrismaClient();

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
        return NextResponse.json(
          { error: 'Eksik alanlar: minPrice,maxPrice' },
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
      return NextResponse.json(
        { error: 'Geçersiz kategori' },
        { status: 400 }
      );
    }

    // Yeni ilan oluştur
    const newListing = await prisma.$transaction(async (tx) => {
      const seq = await tx.sequence.upsert({
        where: { key: 'listing' },
        create: { key: 'listing', value: 1 },
        update: { value: { increment: 1 } },
      });
      const code = String(seq.value).padStart(6, '0');
      return tx.listing.create({
      data: {
        title,
        description,
        budget: BigInt(budget),
        city,
        district,
        status: 'OPEN',
        ownerId: user.id,
        categoryId: categoryRecord.id,
        subCategoryId: subCategoryRecord?.id || null,
        imagesJson: imagesArr.length ? JSON.stringify(imagesArr) : null,
        attributesJson: body.attributes ? JSON.stringify(body.attributes) : null,
        code,
      }
      });
    });

    const safeListing = {
      ...newListing,
      budget: newListing.budget ? Number(newListing.budget as any) : null,
      images: newListing.imagesJson ? JSON.parse(newListing.imagesJson) : [],
      attributes: newListing.attributesJson ? JSON.parse(newListing.attributesJson) : {},
    } as any;

    return NextResponse.json(
      {
        success: true,
        message: 'İlanınız başarıyla oluşturuldu!',
        data: safeListing,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('İlan oluşturma hatası:', error);
    return NextResponse.json(
      { error: 'İlan oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
