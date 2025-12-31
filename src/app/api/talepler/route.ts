import { NextRequest, NextResponse } from 'next/server';
import { getListings } from '@/lib/services/listingService';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const listingQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  ids: z.string().optional().transform(val => val ? val.split(',').map(s => s.trim()).filter(Boolean) : undefined),
  q: z.string().optional(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  status: z.string().optional(),
  sort: z.string().optional(),
  userId: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawParams: Record<string, string> = {};
    
    searchParams.forEach((value, key) => {
      rawParams[key] = value;
    });

    // Validate known parameters
    const parsed = listingQuerySchema.safeParse(rawParams);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Geçersiz parametreler', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Merge validated params with dynamic attributes (unknown keys)
    // We explicitly exclude known keys from "attributes" to avoid duplication/overwrite issues
    const knownKeys = new Set(Object.keys(listingQuerySchema.shape));
    const dynamicParams: Record<string, any> = {};
    
    Object.keys(rawParams).forEach(key => {
      if (!knownKeys.has(key)) {
        dynamicParams[key] = rawParams[key];
      }
    });

    const finalParams = {
      ...parsed.data,
      ...dynamicParams
    };

    const result = await getListings(finalParams);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Listeler alınırken hata oluştu:', error);
    return NextResponse.json({ error: 'Sunucu Hatası' }, { status: 500 });
  }
}
