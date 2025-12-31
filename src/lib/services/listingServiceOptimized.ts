import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { createModuleLogger } from "@/lib/logger";

const logger = createModuleLogger('listing-service');

export interface ListingFilters {
  category?: string;
  subcategory?: string;
  locationCity?: string;
  locationDistrict?: string;
  priceMin?: number;
  priceMax?: number;
  search?: string;
  [key: string]: any; // For dynamic attributes
}

export interface ListingWithRelations extends Prisma.ListingGetPayload<{
  include: {
    category: true;
    subCategory: true;
    owner: { select: { id: true; name: true; email: true } };
  };
}> {}

// Build database-level filtering for attributes
function buildAttributeWhereClause(filters: ListingFilters): Prisma.ListingWhereInput {
  const where: Prisma.ListingWhereInput = {};
  
  // Basic filters
  if (filters.category) {
    where.category = { slug: filters.category };
  }
  
  if (filters.subcategory) {
    where.subCategory = { slug: filters.subcategory };
  }
  
  if (filters.locationCity) {
    where.city = filters.locationCity;
  }
  
  if (filters.locationDistrict) {
    where.district = filters.locationDistrict;
  }
  
  if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
    where.budget = {};
    if (filters.priceMin !== undefined) {
      where.budget.gte = BigInt(filters.priceMin);
    }
    if (filters.priceMax !== undefined) {
      where.budget.lte = BigInt(filters.priceMax);
    }
  }
  
  // Search functionality
  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
    ];
  }
  
  // Dynamic attribute filtering at database level
  const attributeFilters: any[] = [];
  
  for (const [key, value] of Object.entries(filters)) {
    if (key.startsWith('attr_') && value !== undefined && value !== null && value !== '') {
      const attrKey = key.replace('attr_', '');
      
      // Handle numeric ranges
      if (attrKey.endsWith('Min')) {
        const baseKey = attrKey.slice(0, -3);
        attributeFilters.push({
          attributesJson: {
            path: ['$.' + baseKey],
            gte: value
          }
        } as any);
      } else if (attrKey.endsWith('Max')) {
        const baseKey = attrKey.slice(0, -3);
        attributeFilters.push({
          attributesJson: {
            path: ['$.' + baseKey],
            lte: value
          }
        } as any);
      } else {
        // Handle exact matches and arrays
        if (typeof value === 'string' && value.includes(',')) {
          const values = value.split(',').map(v => v.trim()).filter(Boolean);
          attributeFilters.push({
            OR: values.map(v => ({
              attributesJson: {
                path: ['$.' + attrKey],
                string_contains: v
              }
            }))
          } as any);
        } else {
          attributeFilters.push({
            attributesJson: {
              path: ['$.' + attrKey],
              equals: value
            }
          } as any);
        }
      }
    }
  }
  
  if (attributeFilters.length > 0) {
    const existingAnd = where.AND ? (Array.isArray(where.AND) ? where.AND : [where.AND]) : [];
    where.AND = [...existingAnd, ...attributeFilters];
  }
  
  return where;
}

export async function getListings(
  filters: ListingFilters = {},
  options: {
    skip?: number;
    take?: number;
    orderBy?: Prisma.ListingOrderByWithRelationInput;
  } = {}
): Promise<{
  listings: ListingWithRelations[];
  totalCount: number;
}> {
  try {
    const { skip = 0, take = 20, orderBy = { createdAt: 'desc' } } = options;
    
    // Build where clause with database-level filtering
    const whereClause = buildAttributeWhereClause(filters);
    
    logger.debug('Listing query', { filters, whereClause, skip, take });
    
    // Get total count
    const totalCount = await prisma.listing.count({ where: whereClause });
    
    // Get paginated results
    const listings = await prisma.listing.findMany({
      where: whereClause,
      include: {
        category: true,
        subCategory: true,
        owner: { select: { id: true, name: true, email: true } },
      },
      orderBy,
      skip,
      take,
    });
    
    logger.info(`Retrieved ${listings.length} listings out of ${totalCount} total`);
    
    return {
      listings,
      totalCount,
    };
  } catch (error) {
    logger.error('Failed to get listings', { error: error instanceof Error ? error.message : 'Unknown error', filters });
    throw new Error('Failed to retrieve listings');
  }
}

// Legacy function for backward compatibility
export async function getListingsLegacy(
  params: Record<string, string>,
  options: {
    skip?: number;
    take?: number;
    orderBy?: Prisma.ListingOrderByWithRelationInput;
  } = {}
): Promise<{
  listings: ListingWithRelations[];
  totalCount: number;
}> {
  try {
    const { skip = 0, take = 20, orderBy = { createdAt: 'desc' } } = options;
    
    // Extract category, subcategory, location from params
    const filters: ListingFilters = {};
    
    if (params.category) filters.category = params.category;
    if (params.subcategory) filters.subcategory = params.subcategory;
    if (params.locationCity) filters.locationCity = params.locationCity;
    if (params.locationDistrict) filters.locationDistrict = params.locationDistrict;
    if (params.search) filters.search = params.search;
    
    // Extract price range
    if (params.priceMin) filters.priceMin = Number(params.priceMin);
    if (params.priceMax) filters.priceMax = Number(params.priceMax);
    
    // Extract dynamic attributes
    for (const [key, value] of Object.entries(params)) {
      if (!['category', 'subcategory', 'locationCity', 'locationDistrict', 'priceMin', 'priceMax', 'search', 'skip', 'limit'].includes(key)) {
        filters[key] = value;
      }
    }
    
    return getListings(filters, { skip, take, orderBy });
  } catch (error) {
    logger.error('Legacy listing query failed', { error: error instanceof Error ? error.message : 'Unknown error', params });
    throw error;
  }
}

export { getListings as default };