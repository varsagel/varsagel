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

export type ListingCardStatus = 'active' | 'pending' | 'sold'

export interface ListingCardItem {
  id: string
  title: string
  description: string
  price: number
  category: string
  subcategory?: string
  location: { city: string; district: string }
  images: string[]
  attributes: Record<string, any>
  buyer: { name: string; rating: number }
  createdAt: string
  status: ListingCardStatus
  viewCount: number
  isFavorited: boolean
}

type ListingWithRelations = Prisma.ListingGetPayload<{
  include: {
    category: true
    subCategory: true
    owner: { select: { id: true; name: true } }
  }
}>

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

  // Map status to Prisma Enum
  const statusMap: Record<string, 'OPEN' | 'PENDING' | 'SOLD'> = {
    'active': 'OPEN',
    'pending': 'PENDING',
    'sold': 'SOLD',
    'OPEN': 'OPEN',
    'PENDING': 'PENDING',
    'SOLD': 'SOLD'
  };

  if (params.status) {
    const mapped = statusMap[params.status];
    if (mapped) whereClause.status = mapped;
  } else if (!params.userId && (!params.ids || params.ids.length === 0)) {
    whereClause.status = 'OPEN';
  }

  if (params.category) whereClause.category = { is: { slug: params.category } };
  if (params.subcategory) whereClause.subCategory = { is: { slug: params.subcategory } };

  if (params.q) {
    whereClause.OR = [
      { title: { contains: params.q, mode: 'insensitive' } },
      { description: { contains: params.q, mode: 'insensitive' } },
      { city: { contains: params.q, mode: 'insensitive' } },
      { district: { contains: params.q, mode: 'insensitive' } },
      { category: { name: { contains: params.q, mode: 'insensitive' } } },
      { subCategory: { name: { contains: params.q, mode: 'insensitive' } } },
      { attributesJson: { contains: params.q, mode: 'insensitive' } },
      { owner: { name: { contains: params.q, mode: 'insensitive' } } },
      { code: { contains: params.q, mode: 'insensitive' } },
    ];
  }

  const priceFilter: { gte?: bigint; lte?: bigint } = {};
  if (params.minPrice !== undefined) priceFilter.gte = BigInt(params.minPrice);
  if (params.maxPrice !== undefined) priceFilter.lte = BigInt(params.maxPrice);
  if (priceFilter.gte !== undefined || priceFilter.lte !== undefined) whereClause.budget = priceFilter;

  if (params.city) whereClause.city = { contains: params.city, mode: 'insensitive' };
  if (params.district) whereClause.district = { contains: params.district, mode: 'insensitive' };

  let orderBy: Prisma.ListingOrderByWithRelationInput = { createdAt: 'desc' };
  const sort = params.sort || 'newest';
  if (sort === 'price-low') orderBy = { budget: 'asc' };
  else if (sort === 'price-high') orderBy = { budget: 'desc' };
  else if (sort === 'oldest') orderBy = { createdAt: 'asc' };
  else if (sort === 'newest') orderBy = { createdAt: 'desc' };
  else if (sort === 'buyer') orderBy = { owner: { name: 'asc' } };

  // Handle Attribute Filtering
  const baseKeys = new Set(['userId', 'category', 'subcategory', 'q', 'minPrice', 'maxPrice', 'city', 'district', 'status', 'sort', 'ids', 'page', 'limit']);
  const attrKeys = Object.keys(params).filter(k => !baseKeys.has(k));
  const hasAttrFilters = attrKeys.length > 0;

  let listings: ListingWithRelations[] = [];
  let totalCount = 0;

  if (hasAttrFilters) {
    // Pre-filtering: Add 'contains' checks for string values to reduce DB fetch size
    // This assumes attributesJson stores values in a way that 'contains' can match (e.g. JSON string)
    const attrConditions: Prisma.ListingWhereInput[] = [];
    for (const k of attrKeys) {
      const v = params[k];
      if (!v) continue;
      // Skip range keys for simple string matching
      if (k.endsWith('Min') || k.endsWith('Max')) continue;
      
      if (typeof v === 'string') {
        // We search for the value in the JSON string. 
        // This is heuristic and might return false positives, but strict JS filtering below fixes it.
        attrConditions.push({ attributesJson: { contains: v, mode: 'insensitive' } });
      }
    }

    if (attrConditions.length > 0) {
      if (!whereClause.AND) whereClause.AND = [];
      if (Array.isArray(whereClause.AND)) {
        whereClause.AND.push(...attrConditions);
      } else {
        whereClause.AND = [whereClause.AND as Prisma.ListingWhereInput, ...attrConditions];
      }
    }

    // Optimized Strategy:
    // 1. Fetch lightweight data (ID + attributesJson) for a larger set
    // We only select ID and attributesJson to minimize memory usage and allow higher limits
    const candidates = await prisma.listing.findMany({
      where: whereClause,
      select: {
        id: true,
        attributesJson: true,
      },
      orderBy,
      take: 2500 // Increased from 1000 to 2500 for better recall
    });

    const safeParse = (text: string | null) => {
      if (!text) return {};
      try {
        const parsed = JSON.parse(text);
        return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
      } catch {
        return {};
      }
    };

    const filteredIds = candidates.filter((l) => {
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
          if (actual === undefined) return false; // Strict: if filter exists, attribute must exist
          
          const reqParts = String(v).split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
          const actParts = String(actual).split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
          
          if (reqParts.length === 0) continue;
          
          // Check if ANY requested part matches ANY actual part (OR logic within field)
          const matches = reqParts.some(rp => actParts.includes(rp));
          if (!matches) return false;
        }
      }
      return true;
    }).map(l => l.id);

    totalCount = filteredIds.length;
    const pageIds = filteredIds.slice(skip, skip + limit);

    if (pageIds.length > 0) {
      // 2. Fetch full data only for the current page
      const pageListings = await prisma.listing.findMany({
        where: { id: { in: pageIds } },
        include: {
          category: true,
          subCategory: true,
          owner: { select: { id: true, name: true } },
        },
      });
      
      // Re-order to match the original sort (since 'IN' query doesn't preserve order)
      const listingMap = new Map(pageListings.map(l => [l.id, l]));
      listings = pageIds.map(id => listingMap.get(id)!).filter(Boolean);
    } else {
      listings = [];
    }
  } else {
    totalCount = await prisma.listing.count({ where: whereClause });
    listings = await prisma.listing.findMany({
      where: whereClause,
      include: {
        category: true,
        subCategory: true,
        owner: { select: { id: true, name: true } },
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

  const formattedListings: ListingCardItem[] = listings.map((listing) => {
    const images = (() => {
      try {
        const parsed = listing.imagesJson ? JSON.parse(listing.imagesJson) : [];
        return Array.isArray(parsed) ? (parsed as string[]) : [];
      } catch {
        return [];
      }
    })();
    const attributes = (() => {
      try {
        const parsed = listing.attributesJson ? JSON.parse(listing.attributesJson) : {};
        return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
      } catch {
        return {};
      }
    })();
    const status: ListingCardStatus = listing.status === 'OPEN' ? 'active' : listing.status === 'PENDING' ? 'pending' : 'sold';
    return {
      id: listing.id,
      title: listing.title,
      description: listing.description,
      price: listing.budget ? Number(listing.budget) : 0,
      category: listing.category?.slug || '',
      subcategory: listing.subCategory?.slug,
      location: { city: listing.city || '', district: listing.district || '' },
      images,
      attributes,
      buyer: { name: listing.owner?.name || 'Anonim', rating: 4.5 },
      createdAt: listing.createdAt.toISOString(),
      status,
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
