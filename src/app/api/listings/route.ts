import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ownerId = searchParams.get('userId');
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');
    const q = searchParams.get('q')?.trim() || '';
    const minPriceStr = searchParams.get('minPrice');
    const maxPriceStr = searchParams.get('maxPrice');
    const city = searchParams.get('city');
    const district = searchParams.get('district');
    const status = searchParams.get('status');
    const sort = searchParams.get('sort') || 'newest';
    const idsParam = searchParams.get('ids');
    const marka = searchParams.get('marka') || undefined;
    const model = searchParams.get('model') || undefined;
    const yakit = searchParams.get('yakit') || undefined;
    const vites = searchParams.get('vites') || undefined;
    const yilMinFilter = searchParams.get('yilMin');
    const yilMaxFilter = searchParams.get('yilMax');
    const kmMinFilter = searchParams.get('kmMin');
    const kmMaxFilter = searchParams.get('kmMax');

    const whereClause: any = {};

    if (ownerId) {
      whereClause.ownerId = ownerId;
    }

    if (idsParam) {
      const ids = idsParam.split(',').map((s) => s.trim()).filter(Boolean);
      if (ids.length > 0) {
        whereClause.id = { in: ids };
      }
    }

    if (status) {
      whereClause.status = status;
    } else if (!ownerId) {
      whereClause.status = 'OPEN';
    }

    if (category) {
      whereClause.category = { is: { slug: category } };
    }

    if (subcategory) {
      whereClause.subCategory = { is: { slug: subcategory } };
    }

    if (q) {
      whereClause.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
      ];
    }

    const priceFilter: any = {};
    const minPrice = minPriceStr ? Number(minPriceStr) : undefined;
    const maxPrice = maxPriceStr ? Number(maxPriceStr) : undefined;
    if (!Number.isNaN(minPrice) && minPrice !== undefined) {
      priceFilter.gte = BigInt(minPrice);
    }
    if (!Number.isNaN(maxPrice) && maxPrice !== undefined) {
      priceFilter.lte = BigInt(maxPrice);
    }
    if (priceFilter.gte !== undefined || priceFilter.lte !== undefined) {
      whereClause.budget = priceFilter;
    }

    if (city) {
      whereClause.city = { contains: city } as any;
    }
    if (district) {
      whereClause.district = { contains: district } as any;
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price-low') orderBy = { budget: 'asc' };
    else if (sort === 'price-high') orderBy = { budget: 'desc' };

    const listings = await prisma.listing.findMany({
      where: whereClause,
      include: {
        category: true,
        subCategory: true,
        owner: { select: { id: true, name: true, email: true } },
      },
      orderBy,
    });
    const baseKeys = new Set(['userId','category','subcategory','q','minPrice','maxPrice','city','district','status','sort','ids']);
    const attrFilters: Record<string, string> = {};
    for (const [key, value] of searchParams.entries()) {
      if (!baseKeys.has(key)) attrFilters[key] = value;
    }
    const safeParse = (text: string | null) => {
      if (!text) return {};
      try { return JSON.parse(text); } catch { return {}; }
    };
    const withAttrFilter = listings.filter((l: any) => {
      const attrs = safeParse(l.attributesJson);
      for (const k of Object.keys(attrFilters)) {
        const v = attrFilters[k];
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
          const reqParts = String(v).split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
          const actParts = String(actual).split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
          if (reqParts.length === 0) continue;
          const matches = reqParts.some(rp => actParts.includes(rp));
          if (!matches) return false;
        }
      }
      return true;
    });

    const session = await auth();
    const sessionUserId = session?.user?.id as string | undefined;
    let favoriteIds = new Set<string>();
    if (sessionUserId) {
      const favs = await prisma.favorite.findMany({
        where: { userId: sessionUserId },
        select: { listingId: true },
      });
      favoriteIds = new Set(favs.map((f) => f.listingId));
    }

    let formattedListings = withAttrFilter.map((listing: any) => {
      const images = (() => { try { return listing.imagesJson ? JSON.parse(listing.imagesJson) : []; } catch { return []; } })();
      return {
        id: listing.id,
        title: listing.title,
        description: listing.description,
        price: listing.budget ? Number(listing.budget) : 0,
        category: listing.category?.slug || '',
        subcategory: listing.subCategory?.slug || '',
        location: { city: listing.city || '', district: listing.district || '' },
        images,
        attributes: safeParse(listing.attributesJson),
        seller: { name: listing.owner?.name || 'Anonim', rating: 4.5 },
        createdAt: listing.createdAt,
        status: listing.status === 'OPEN' ? 'active' : 'sold',
        viewCount: 0,
        isFavorited: sessionUserId ? favoriteIds.has(listing.id) : false,
      };
    });
    if (q) {
      const normTR = (s: string) => s.toLowerCase().replace(/ş/g,'s').replace(/ç/g,'c').replace(/ğ/g,'g').replace(/ı/g,'i').replace(/ö/g,'o').replace(/ü/g,'u');
      const qlow = normTR(q);
      const qTokens = qlow.split(/\s+/).filter(Boolean);
      const synonyms: Record<string,string[]> = {
        televizyon: ['tv','televizyon','oled','qled','led'],
        telefon: ['telefon','cep','smartphone','iphone','galaxy'],
        bilgisayar: ['bilgisayar','laptop','notebook','pc','ultrabook'],
        araba: ['araba','oto','otomobil','vasita','automobile','vehicle'],
        daire: ['daire','ev','konut','apartment','flat'],
      };
      const expanded = new Set<string>(qTokens);
      for (const t of qTokens) {
        const syn = synonyms[t];
        if (syn) syn.forEach(s => expanded.add(s));
      }
      const docs = formattedListings.map((l: any) => {
        const title = normTR(String(l.title||''));
        const desc = normTR(String(l.description||''));
        const attrs = normTR(Object.values(l.attributes||{}).join(' '));
        return { l, text: `${title} ${desc} ${attrs}` };
      });
      const tokenize = (s: string) => s.split(/\s+/).filter(Boolean);
      const tokenizedDocs = docs.map(d => ({ l: d.l, tokens: tokenize(d.text) }));
      const dl = tokenizedDocs.map(d => d.tokens.length);
      const avgdl = dl.length ? dl.reduce((a,b)=> a+b, 0)/dl.length : 0;
      const k1 = 1.2, b = 0.75;
      const idf: Record<string,number> = {};
      const terms = Array.from(expanded);
      for (const term of terms) {
        const df = tokenizedDocs.reduce((acc, d) => acc + (d.tokens.includes(term) ? 1 : 0), 0);
        idf[term] = Math.log(1 + ( (tokenizedDocs.length - df + 0.5) / (df + 0.5) ));
      }
      const scores = tokenizedDocs.map((d, idx) => {
        const tf: Record<string,number> = {};
        d.tokens.forEach(t => { tf[t] = (tf[t]||0)+1; });
        let score = 0;
        for (const term of terms) {
          const f = tf[term]||0;
          const denom = f + k1*(1 - b + b*dl[idx]/(avgdl||1));
          score += idf[term] * (f*(k1+1)) / (denom||1);
        }
        // small category boost
        const cat = d.l.category;
        if (expanded.has('tv') && cat === 'alisveris') score += 0.5;
        return { l: d.l, score };
      });
      scores.sort((a,b)=> b.score - a.score);
      formattedListings = scores.map(s => s.l);
    }

    return NextResponse.json(formattedListings);
  } catch (error) {
    console.error('İlanları getirirken hata:', error);
    return NextResponse.json(
      { error: 'İlanlar getirilirken bir hata oluştu' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id as string | undefined;
    if (!userId && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
    }

    if (process.env.NODE_ENV === 'production') {
      const me = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
      if (me?.role !== 'ADMIN') return NextResponse.json({ error: 'Sadece admin silebilir' }, { status: 403 });
    }

    const deleted = {
      messages: (await prisma.message.deleteMany({})).count,
      offers: (await prisma.offer.deleteMany({})).count,
      favorites: (await prisma.favorite.deleteMany({})).count,
      listings: (await prisma.listing.deleteMany({})).count,
    };

    return NextResponse.json({ ok: true, deleted });
  } catch (error) {
    return NextResponse.json({ error: 'Toplu silme sırasında hata' }, { status: 500 });
  }
}
