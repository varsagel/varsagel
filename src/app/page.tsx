import { getListings } from '@/lib/services/listingService';
import HeroSection from '@/components/home/HeroSection';
import ListingCard from '@/components/home/TalepCard';
import Link from 'next/link';
import { CATEGORIES } from '@/data/categories';
import { ArrowRight, ChevronRight } from 'lucide-react';
import React from 'react';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Home({ searchParams }: PageProps) {
  // Parse search params
  const params = await searchParams;
  
  const page = Number(params.page) || 1;
  const q = typeof params.q === 'string' ? params.q : '';
  const category = typeof params.category === 'string' ? params.category : undefined;
  const subcategory = typeof params.subcategory === 'string' ? params.subcategory : undefined;
  const minPrice = params.minPrice ? Number(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? Number(params.maxPrice) : undefined;
  const city = typeof params.city === 'string' ? params.city : undefined;
  const district = typeof params.district === 'string' ? params.district : undefined;
  const sort = typeof params.sort === 'string' ? params.sort : 'newest';

  // Fetch listings
  const { data: listings, pagination } = await getListings({
    page,
    limit: 20,
    q,
    category,
    subcategory,
    minPrice,
    maxPrice,
    city,
    district,
    sort,
    status: 'OPEN'
  });

  return (
    <div className="min-h-dvh bg-gray-50 pb-20">
      <HeroSection initialSearch={q} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Categories Section */}
        {!q && !category && (
          <div className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold text-gray-900">En Çok Arananlar</h2>
                <span className="text-sm text-gray-500 font-medium hidden sm:block">
                  Detaylı filtrelemek için kategoriye tıklayın
                </span>
              </div>
              <Link href="/#kategoriler" className="text-sm font-medium text-cyan-600 hover:text-cyan-700 flex items-center gap-1 transition-colors">
                Tümünü Gör <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {CATEGORIES.slice(0, 12).map((cat) => (
                <Link 
                  key={cat.slug} 
                  href={`/kategori/${cat.slug}`}
                  className="group flex flex-col items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-cyan-200 hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="w-14 h-14 rounded-xl bg-cyan-50 group-hover:bg-cyan-100 flex items-center justify-center text-3xl transition-colors duration-300">
                    {cat.icon}
                  </div>
                  <span className="text-sm font-semibold text-gray-700 group-hover:text-cyan-600 text-center line-clamp-1 transition-colors">
                    {cat.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Listings Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-4 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              {q ? (
                <>
                  <span className="text-gray-400 font-normal">Arama Sonuçları:</span> "{q}"
                </>
              ) : category ? (
                <>
                   {CATEGORIES.find(c => c.slug === category)?.icon} {CATEGORIES.find(c => c.slug === category)?.name || category} Talepleri
                </>
              ) : (
                'Son Alım Talepleri'
              )}
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              {pagination.total} aktif alım talebi listeleniyor
            </p>
          </div>
          
          {/* Sort Options could go here */}
        </div>

        {/* Listings Grid */}
        {listings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {listings.map((listing: any) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm text-center px-4">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <span className="text-4xl">ğŸ”</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Sonuç Bulunamadı</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-8">
              Aradığınız kriterlere uygun talep şu an mevcut değil. Arama kriterlerinizi değiştirerek tekrar deneyebilirsiniz.
            </p>
            <Link 
              href="/talep-olustur" 
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-cyan-600 hover:bg-cyan-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
              Talep Oluştur
            </Link>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-16 flex items-center justify-center gap-2">
            {page > 1 && (
              <Link
                href={`/?${new URLSearchParams({ ...params as any, page:String(page - 1) }).toString()}`}
                className="flex items-center gap-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 text-gray-700 font-medium transition-all"
              >
                <span className="rotate-180"><ArrowRight className="w-4 h-4" /></span>
                Önceki
              </Link>
            )}
            
            <div className="hidden sm:flex items-center gap-2">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === pagination.totalPages || Math.abs(p - page) <= 1)
                .map((p, i, arr) => (
                  <React.Fragment key={p}>
                    {i > 0 && arr[i-1] !== p - 1 && <span className="text-gray-400">...</span>}
                    <Link
                      href={`/?${new URLSearchParams({ ...params as any, page:String(p) }).toString()}`}
                      className={`
                        w-10 h-10 flex items-center justify-center rounded-xl font-medium transition-all
                        ${p === page 
                          ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-200 scale-110' 
                          : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'}
                      `}
                    >
                      {p}
                    </Link>
                  </React.Fragment>
                ))}
            </div>
            {/* Mobile Pagination Simple */}
            <div className="sm:hidden px-4 py-2 bg-cyan-50 text-cyan-600 font-medium rounded-xl border border-cyan-100">
              {page} / {pagination.totalPages}
            </div>

            {page < pagination.totalPages && (
              <Link
                href={`/?${new URLSearchParams({ ...params as any, page:String(page + 1) }).toString()}`}
                className="flex items-center gap-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 text-gray-700 font-medium transition-all"
              >
                Sonraki
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

