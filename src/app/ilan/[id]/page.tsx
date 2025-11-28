import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Gallery from '@/components/Gallery';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

function formatDate(date: Date) {
  const now = new Date().getTime();
  const d = new Date(date).getTime();
  const diffDays = Math.ceil(Math.abs(now - d) / (1000 * 60 * 60 * 24));
  if (diffDays === 1) return 'Dün';
  if (diffDays < 7) return `${diffDays} gün önce`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} hafta önce`;
  return new Date(date).toLocaleDateString('tr-TR');
}

export default async function IlanDetayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: slug } = await params;
  if (!slug) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center text-white">
          <h1 className="text-3xl font-bold mb-2">İlan bulunamadı</h1>
          <Link href="/" className="text-blue-400 hover:text-blue-300">Ana sayfaya dön</Link>
        </div>
      </div>
    );
  }
  const isCode = /^\d{6}$/.test(slug);
  const listing = await prisma.listing.findFirst({
    where: isCode ? { code: slug } : { id: slug },
    include: {
      category: true,
      subCategory: true,
      owner: { select: { name: true, email: true } },
      offers: {
        select: {
          id: true,
          price: true,
          message: true,
          createdAt: true,
          status: true,
          sellerId: true,
          seller: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  });

  if (!listing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center text-white">
          <h1 className="text-3xl font-bold mb-2">İlan bulunamadı</h1>
          <Link href="/" className="text-blue-400 hover:text-blue-300">Ana sayfaya dön</Link>
        </div>
      </div>
    );
  }

  const price = listing.budget ? Number(listing.budget as any) : null;
  const gallery = listing.imagesJson ? (JSON.parse(listing.imagesJson) as string[]) : ['/images/placeholder-1.svg'];
  const attributes = listing.attributesJson ? JSON.parse(listing.attributesJson) as Record<string, any> : null;
  const hasAccepted = Array.isArray(listing.offers) && listing.offers.some((o: any) => o.status === 'ACCEPTED');
  const offerNums = Array.isArray(listing.offers) ? listing.offers.map((o:any)=> Number(o.price as any)).filter((n)=> !Number.isNaN(n)) : [];
  const minOffer = offerNums.length ? Math.min(...offerNums) : null;
  const maxOffer = offerNums.length ? Math.max(...offerNums) : null;
  const attrPairs: Record<string, { min?: any; max?: any }> = {};
  if (attributes) {
    Object.keys(attributes).forEach((k) => {
      if (k.endsWith('Min')) {
        const base = k.slice(0, -3);
        attrPairs[base] = attrPairs[base] || {}; attrPairs[base].min = attributes[k];
      } else if (k.endsWith('Max')) {
        const base = k.slice(0, -3);
        attrPairs[base] = attrPairs[base] || {}; attrPairs[base].max = attributes[k];
      }
    });
  }
  const label = (key: string) => {
    const map: Record<string, string> = { marka: 'Marka', model: 'Model', yakit: 'Yakıt', vites: 'Vites', yil: 'Yıl', km: 'Kilometre', hizmetKapsami: 'Hizmet Kapsamı' };
    return map[key] || key.charAt(0).toUpperCase() + key.slice(1);
  };

  const similar = await prisma.listing.findMany({
    where: {
      status: 'OPEN',
      categoryId: listing.categoryId,
      subCategoryId: listing.subCategoryId ?? undefined,
      NOT: { id: listing.id },
    },
    orderBy: [{ offers: { _count: 'desc' } }, { createdAt: 'desc' }],
    take: 8,
    include: { category: true },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href={`/kategori/${listing.category.slug}/${listing.subCategory?.slug ?? ''}`}
                className="text-blue-400 hover:text-blue-300 mb-2 inline-block flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Geri Dön
              </Link>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{listing.title}</h1>
              {listing.code && <p className="text-gray-500 text-sm">İlan Kodu: {listing.code}</p>}
              <div className="flex items-center gap-3 flex-wrap">
                {price !== null && (
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-lg text-lg font-semibold">
                    ₺{price.toLocaleString('tr-TR')}
                  </span>
                )}
                {minOffer !== null && (
                  <span className="text-gray-700 text-sm bg-gray-100 px-2 py-1 rounded">Min: ₺{minOffer.toLocaleString('tr-TR')}</span>
                )}
                {maxOffer !== null && (
                  <span className="text-gray-700 text-sm bg-gray-100 px-2 py-1 rounded">Max: ₺{maxOffer.toLocaleString('tr-TR')}</span>
                )}
                <span className="text-gray-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  {listing.city}{listing.district ? `, ${listing.district}` : ''}
                </span>
                <span className="text-gray-700 text-sm bg-gray-100 px-2 py-1 rounded">
                  {listing.category.name}{listing.subCategory ? ` • ${listing.subCategory.name}` : ''}
                </span>
                <span className="text-gray-700 text-sm bg-gray-100 px-2 py-1 rounded">
                  {listing.status}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-gray-500 text-sm">{formatDate(listing.createdAt)}</p>
              {hasAccepted && (
                <Link href={`/mesajlar/${listing.id}`} className="mt-2 inline-block bg-green-600 text-white px-3 py-1 rounded-lg text-sm font-semibold hover:bg-green-700">
                  Mesajlaşmayı Aç
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Gallery images={gallery} alt={listing.title} />
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Açıklama</h2>
              <p className="text-gray-700 leading-relaxed">{listing.description}</p>
            </div>
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'Product',
                  name: listing.title,
                  description: listing.description,
                  category: listing.category?.name,
                  offers: price !== null ? {
                    '@type': 'Offer',
                    priceCurrency: 'TRY',
                    price: price,
                    availability: listing.status === 'OPEN' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
                  } : undefined,
                  areaServed: listing.city,
                  brand: attributes?.marka,
                })
              }}
            />
            {attributes && (
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">İlan Özellikleri</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(attrPairs).map(([base, v]) => (
                    (v.min || v.max) ? (
                      <div key={base} className="flex items-center justify-between text-gray-700">
                        <span className="font-semibold text-gray-900">{label(base)}</span>
                        <span className="text-gray-600">{v.min ?? '—'}{(v.min || v.max) ? ' – ' : ''}{v.max ?? '—'}</span>
                      </div>
                    ) : null
                  ))}
                  {Object.entries(attributes).filter(([k]) => !k.endsWith('Min') && !k.endsWith('Max')).map(([k, v]) => {
                    if (v === undefined || v === '') return null;
                    const s = String(v);
                    const parts = s.split(',').map(p => p.trim()).filter(Boolean);
                    return (
                      <div key={k} className="text-gray-700">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-900">{label(k)}</span>
                          {parts.length <= 1 ? (
                            <span className="text-gray-600">{s}</span>
                          ) : (
                            <div className="flex flex-wrap gap-2 justify-end">
                              {parts.map((p) => (
                                <span key={p} className="text-gray-700 text-xs bg-gray-100 px-2 py-1 rounded">{p}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Son Teklifler</h2>
              <div className="space-y-3">
                {(!listing.offers || listing.offers.length === 0) ? (
                  <p className="text-gray-500">Henüz teklif yok</p>
                ) : (
                  listing.offers.map((o: any) => (
                    <div key={o.id} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-3">
                      <div className="text-gray-900">
                        <p className="font-semibold">{o.seller?.name ?? 'Satıcı'}</p>
                        <p className="text-gray-600 text-sm line-clamp-2">{o.message}</p>
                      </div>
                      <div className="text-gray-800 font-semibold">₺{Number(o.price as any).toLocaleString('tr-TR')}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Benzer İlanlar</h2>
              {similar.length === 0 ? (
                <p className="text-gray-500">Benzer ilan bulunamadı</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {similar.map((s) => (
                    <Link key={s.id} href={`/ilan/${s.id}`} className="block bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <p className="text-gray-900 font-semibold line-clamp-1">{s.title}</p>
                      <p className="text-gray-600 text-sm line-clamp-2">{s.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-gray-700 text-sm">{s.category.name}</span>
                        <span className="text-gray-700 text-sm">{s.city}</span>
                      </div>
                      {s.budget && <p className="text-gray-800 font-semibold mt-1">₺{Number(s.budget as any).toLocaleString('tr-TR')}</p>}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">İlan Sahibi</h3>
              <div className="space-y-2">
                <p className="text-gray-900 font-medium">{listing.owner?.name ?? 'Anonim'}</p>
                <p className="text-gray-600 text-sm">{listing.owner?.email ?? ''}</p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Link href={`/teklif-ver/${listing.id}`} className="text-center bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700">
                  Teklif Ver
                </Link>
                <Link href={`/profil`} className="text-center bg-gray-100 border border-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200">
                  Profil
                </Link>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Detaylar</h3>
              <div className="space-y-2 text-gray-700">
                <p>Durum: {listing.status}</p>
                <p>Konum: {listing.city}{listing.district ? `, ${listing.district}` : ''}</p>
                <p>Kategori: {listing.category.name}{listing.subCategory ? ` • ${listing.subCategory.name}` : ''}</p>
                {price !== null && <p>Bütçe: ₺{price.toLocaleString('tr-TR')}</p>}
                {attributes?.minPrice || attributes?.maxPrice ? (
                  <p>Bütçe Aralığı: {attributes?.minPrice ? `₺${Number(attributes.minPrice).toLocaleString('tr-TR')}` : '—'} – {attributes?.maxPrice ? `₺${Number(attributes.maxPrice).toLocaleString('tr-TR')}` : '—'}</p>
                ) : null}
                <p>Yayın: {formatDate(listing.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
