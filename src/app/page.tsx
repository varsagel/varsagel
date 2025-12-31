import { getListings } from '@/lib/services/listingService';
import TechCategoryHero from '@/components/home/TechCategoryHero';
import HomeListingCard, { ListingItem } from '@/components/home/ListingCard';
import { CATEGORIES } from '@/data/categories';
import { ArrowRight, ChevronRight, Heart, X } from 'lucide-react';
import type { Metadata } from 'next';
import BRAND_LOGOS from "@/data/brand-logos.json";
import { Fragment, useMemo } from "react";
import Link from "next/link";
import { auth } from '@/auth';
import { getSubcategoryImage } from '@/data/subcategory-images';
import FavoriteButton from '@/components/ui/FavoriteButton';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.varsagel.com';

export const metadata: Metadata = {
  title: "Varsagel | Türkiye'nin İlk Alım Platformu",
  description:
    "Bütçene göre alım talebini oluştur, güvenilir satıcılardan rekabetçi teklifler al. Türkiye'nin ilk alım platformu Varsagel ile ihtiyacını yaz, onlar sana gelsin.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Varsagel | Türkiye'nin İlk Alım Platformu",
    description:
      "Aktif alım taleplerini incele, kendi talebini oluştur veya güvenilir satıcılardan teklifler al.",
    type: "website",
    url: baseUrl,
    siteName: "Varsagel",
    locale: "tr_TR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Varsagel | Türkiye'nin İlk Alım Platformu",
    description:
      "Bütçene göre alım talebini oluştur, satıcılar sana teklif versin.",
    creator: "@varsagel",
  },
};

export const revalidate = 60; // Cache for 1 minute

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

  // Get user session
  const session = await auth();
  const isAuthenticated = !!session?.user;

  // Fetch listings
  const { data: listings, pagination } = await getListings({
    page,
    limit: 12,
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

  // Construct pagination URL helper
  const createPageUrl = (newPage: number) => {
    const newParams = new URLSearchParams();
    if (q) newParams.set('q', q);
    if (category) newParams.set('category', category);
    if (subcategory) newParams.set('subcategory', subcategory);
    if (minPrice) newParams.set('minPrice', String(minPrice));
    if (maxPrice) newParams.set('maxPrice', String(maxPrice));
    if (city) newParams.set('city', city);
    if (district) newParams.set('district', district);
    if (sort) newParams.set('sort', sort);
    newParams.set('page', String(newPage));
    return `/?${newParams.toString()}`;
  };

  return (
    <div className="min-h-dvh bg-slate-50 pb-20">
      <TechCategoryHero categories={CATEGORIES} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16" id="ilanlar">
        
        {/* Listings Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 tracking-tight">
              {q ? (
                <>
                  <span className="text-slate-400 font-normal">Arama Sonuçları:</span> "{q}"
                </>
              ) : category ? (
                <>
                   {CATEGORIES.find(c => c.slug === category)?.icon} {CATEGORIES.find(c => c.slug === category)?.name || category} Talepleri
                </>
              ) : (
                'Son Alım Talepleri'
              )}
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              {pagination.total} aktif alım talebi listeleniyor
            </p>
          </div>
          
          {/* Sort Options could go here */}
        </div>

        {/* Listings Grid */}
        {listings.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
            {listings.map((listing, index) => (
              <HomeListingCard
                key={listing.id}
                listing={listing as ListingItem}
                priority={index < 4}
                isAuthenticated={isAuthenticated}
              />
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
                href={createPageUrl(page - 1)}
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
                  <Fragment key={p}>
                    {i > 0 && arr[i-1] !== p - 1 && <span className="text-gray-400">...</span>}
                    <Link
                      href={createPageUrl(p)}
                      className={`
                        w-10 h-10 flex items-center justify-center rounded-xl font-medium transition-all
                        ${p === page 
                          ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-200 scale-110' 
                          : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'}
                      `}
                    >
                      {p}
                    </Link>
                  </Fragment>
                ))}
            </div>
            {/* Mobile Pagination Simple */}
            <div className="sm:hidden px-4 py-2 bg-cyan-50 text-cyan-600 font-medium rounded-xl border border-cyan-100">
              {page} / {pagination.totalPages}
            </div>

            {page < pagination.totalPages && (
              <Link
                href={createPageUrl(page + 1)}
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
