import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import type { Prisma } from '@prisma/client';

export interface ListingSearchParams {
  page?: number;
  limit?: number;
  userId?: string;
  category?: string;
  subcategory?: string;
  q?: string;
  minPrice?: number;
  maxPrice?: number;
  city?: string;
  district?: string;
  status?: string;
  sort?: string;
  ids?: string[];
  [key: string]: string | number | boolean | string[] | undefined;
}

export async function getListings(params: ListingSearchParams) {
  const page = Math.max(1, params.page || 1);
  const limit = Math.max(1, Math.min(50, params.limit || 20));
  const skip = (page - 1) * limit;

  // Build Prisma Where Clause
  const whereClause: Prisma.ListingWhereInput = {};

  if (params.userId) whereClause.ownerId = params.userId;

  if (params.ids && params.ids.length > 0) {
    whereClause.id = { in: params.ids };
  }

  if (params.status) {
    whereClause.status = params.status;
  } else if (!params.userId && (!params.ids || params.ids.length === 0)) {
    whereClause.status = 'OPEN';
  }

  if (params.category) whereClause.category = { is: { slug: params.category } };
  if (params.subcategory) whereClause.subCategory = { is: { slug: params.subcategory } };

  if (params.q) {
    whereClause.OR = [
      { title: { contains: params.q } },
      { description: { contains: params.q } },
      { city: { contains: params.q } },
      { district: { contains: params.q } },
      { category: { name: { contains: params.q } } },
      { subCategory: { name: { contains: params.q } } },
      { attributesJson: { contains: params.q } },
      { owner: { name: { contains: params.q } } },
      { code: { contains: params.q } },
    ];
  }

  const priceFilter: { gte?: bigint; lte?: bigint } = {};
  if (params.minPrice !== undefined) priceFilter.gte = BigInt(params.minPrice);
  if (params.maxPrice !== undefined) priceFilter.lte = BigInt(params.maxPrice);
  if (priceFilter.gte !== undefined || priceFilter.lte !== undefined) whereClause.budget = priceFilter;

  if (params.city) whereClause.city = { contains: params.city };
  if (params.district) whereClause.district = { contains: params.district };

  let orderBy: Prisma.ListingOrderByWithRelationInput = { createdAt: 'desc' };
  const sort = params.sort || 'newest';
  if (sort === 'price-low') orderBy = { budget: 'asc' };
  else if (sort === 'price-high') orderBy = { budget: 'desc' };
  else if (sort === 'oldest') orderBy = { createdAt: 'asc' };
  else if (sort === 'newest') orderBy = { createdAt: 'desc' };
  else if (sort === 'buyer') orderBy = { owner: { name: 'asc' } };

  // Handle Attribute Filtering
  // Identify attribute keys (keys not in standard list)
  const baseKeys = new Set(['userId','category','subcategory','q','minPrice','maxPrice','city','district','status','sort','ids', 'page', 'limit']);
  const attrKeys = Object.keys(params).filter(k => !baseKeys.has(k));
  const hasAttrFilters = attrKeys.length > 0;

  let listings;
  let totalCount = 0;

  if (hasAttrFilters) {
    // Fetch more for in-memory filtering
    const allMatches = await prisma.listing.findMany({
      where: whereClause,
      include: {
        category: true,
        subCategory: true,
        owner: { select: { id: true, name: true, email: true } },
      },
      orderBy,
      take: 500 
    });

    const safeParse = (text: string | null) => {
      if (!text) return {};
      try { return JSON.parse(text); } catch { return {}; }
    };

    const filtered = allMatches.filter((l) => {
      const attrs = safeParse(l.attributesJson);
      for (const k of attrKeys) {
        const v = params[k];
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

    totalCount = filtered.length;
    listings = filtered.slice(skip, skip + limit);
  } else {
    totalCount = await prisma.listing.count({ where: whereClause });
    listings = await prisma.listing.findMany({
      where: whereClause,
      include: {
        category: true,
        subCategory: true,
        owner: { select: { id: true, name: true, email: true } },
      },
      orderBy,
      take: limit,
      skip: skip,
    });
  }

  const session = await auth();
  const sessionUserId = session?.user?.id;
  let favoriteIds = new Set<string>();
  if (sessionUserId) {
    const favs = await prisma.favorite.findMany({
      where: { userId: sessionUserId },
      select: { listingId: true },
    });
    favoriteIds = new Set(favs.map((f) => f.listingId));
  }

  const formattedListings = listings.map((listing) => {
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
      attributes: listing.attributesJson ? JSON.parse(listing.attributesJson) : {},
      buyer: { name: listing.owner?.name || 'Anonim', rating: 4.5 },
      createdAt: listing.createdAt.toISOString(),
      status: listing.status === 'OPEN' ? 'active' : listing.status === 'PENDING' ? 'pending' : 'sold',
      viewCount: listing.viewCount || 0,
      isFavorited: sessionUserId ? favoriteIds.has(listing.id) : false,
    };
  });

  return {
    data: formattedListings,
    pagination: {
      page,
      limit,
      total: totalCount,
      totalPages: Math.ceil(totalCount / limit)
    }
  };
}
