import { NextRequest, NextResponse } from 'next/server';
import { getListings } from '../../../lib/services/listingService';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const params: any = {};
    searchParams.forEach((value, key) => {
      if (key === 'ids') {
        params[key] = value.split(',').map(s => s.trim()).filter(Boolean);
      } else if (['page', 'limit', 'minPrice', 'maxPrice'].includes(key)) {
        params[key] = Number(value);
      } else {
        params[key] = value;
      }
    });

    const result = await getListings(params);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Listeler alınırken hata oluştu:', error);
    return NextResponse.json({ error: 'Sunucu Hatası', details: String(error) }, { status: 500 });
  }
}
