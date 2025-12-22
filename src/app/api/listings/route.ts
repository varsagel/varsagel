import { NextRequest, NextResponse } from 'next/server';
import { getListings } from '../../../lib/services/listingService';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const searchSchema = z.object({
  page: z.coerce.number().min(1).optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  q: z.string().optional(),
  sort: z.string().optional(),
  ids: z.string().optional(), // Comma separated IDs
  status: z.string().optional(),
  userId: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Convert searchParams to object
    const paramsObj: any = {};
    searchParams.forEach((value, key) => {
      paramsObj[key] = value;
    });

    // Validate params
    const validation = searchSchema.safeParse(paramsObj);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Geçersiz parametreler', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const params: any = { ...validation.data };

    // Handle array fields
    if (params.ids) {
      params.ids = params.ids.split(',').map((s: string) => s.trim()).filter(Boolean);
    }

    const result = await getListings(params);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Listeler alınırken hata oluştu:', error);
    return NextResponse.json({ error: 'Sunucu Hatası' }, { status: 500 });
  }
}
