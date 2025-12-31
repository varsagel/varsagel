import { NextRequest, NextResponse } from 'next/server';
import { getBrands, getModels, getSeries, getTrims } from '@/lib/vehicle-data';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const category = searchParams.get('category');
  const brand = searchParams.get('brand');
  const model = searchParams.get('model');
  const series = searchParams.get('series');

  if (!category) {
    return NextResponse.json({ error: 'Category required' }, { status: 400 });
  }

  try {
    if (type === 'brands') {
      const data = getBrands(category);
      return NextResponse.json(data);
    }
    
    if (type === 'models') {
      if (!brand) return NextResponse.json({ error: 'Brand required' }, { status: 400 });
      const data = getModels(category, brand);
      return NextResponse.json(data);
    }

    if (type === 'series') {
      if (!brand || !model) return NextResponse.json({ error: 'Brand and Model required' }, { status: 400 });
      const data = getSeries(category, brand, model);
      return NextResponse.json(data);
    }

    if (type === 'trims') {
      if (!brand || !model || !series) return NextResponse.json({ error: 'Brand, Model and Series required' }, { status: 400 });
      const data = getTrims(category, brand, model, series);
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error) {
    console.error('Vehicle data error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
