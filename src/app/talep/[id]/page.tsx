import { auth } from '@/auth';
import TalepCard from '@/components/home/TalepCardOptimized';
import FavoriteButton from '@/components/talep/FavoriteButton';
import QuestionsSection from '@/components/talep/QuestionsSection';
import ShareListing from '@/components/talep/ShareListing';
import ListingActionButtons from '@/components/talep/ListingActionButtons';
import SafetyTips from '@/components/talep/SafetyTips';
import { prisma } from '@/lib/prisma';
import { getListings } from '@/lib/services/listingService';
import { ArrowLeft, Calendar, CheckCircle2, Eye, MapPin, ShieldCheck, User, Edit } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import Image from 'next/image';
import { metadataBase, siteUrl } from '@/lib/metadata-base';
import { buildListingSlug, parseListingIdentifier } from '@/lib/listing-url';
import { titleCaseTR } from '@/lib/title-case-tr';

const baseUrl = siteUrl;

const rtf = new Intl.RelativeTimeFormat("tr-TR", { numeric: "auto" });

function formatTimeAgoTR(date: Date) {
  const diffMs = date.getTime() - Date.now();
  const diffSeconds = Math.round(diffMs / 1000);
  const absSeconds = Math.abs(diffSeconds);

  if (absSeconds < 60) return rtf.format(diffSeconds, "second");

  const diffMinutes = Math.round(diffSeconds / 60);
  const absMinutes = Math.abs(diffMinutes);
  if (absMinutes < 60) return rtf.format(diffMinutes, "minute");

  const diffHours = Math.round(diffMinutes / 60);
  const absHours = Math.abs(diffHours);
  if (absHours < 24) return rtf.format(diffHours, "hour");

  const diffDays = Math.round(diffHours / 24);
  const absDays = Math.abs(diffDays);
  if (absDays < 7) return rtf.format(diffDays, "day");

  const diffWeeks = Math.round(diffDays / 7);
  const absWeeks = Math.abs(diffWeeks);
  if (absWeeks < 5) return rtf.format(diffWeeks, "week");

  const diffMonths = Math.round(diffDays / 30);
  const absMonths = Math.abs(diffMonths);
  if (absMonths < 12) return rtf.format(diffMonths, "month");

  const diffYears = Math.round(diffDays / 365);
  return rtf.format(diffYears, "year");
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id: raw } = await params;
  const ident = parseListingIdentifier(raw);
  const listing = await prisma.listing.findFirst({
    where: ident.code ? { code: ident.code } : ident.id ? { id: ident.id } : undefined,
    include: { category: true, subCategory: true }
  });

  if (!listing) {
    return {
      title: 'Talep Bulunamadı | Varsagel',
      metadataBase: metadataBase,
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  let attributes: Record<string, any> = {};
  try {
    const parsed = listing.attributesJson ? JSON.parse(listing.attributesJson) : {};
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) attributes = parsed;
  } catch {}

  const minRaw = attributes.minPrice ?? attributes.minBudget;
  const maxRaw = attributes.maxPrice ?? attributes.budget ?? listing.budget;
  const minPrice = typeof minRaw === 'number' || typeof minRaw === 'string' ? Number(minRaw) : null;
  const maxPrice = typeof maxRaw === 'number' || typeof maxRaw === 'string' ? Number(maxRaw) : null;

  const formatTL = (n: number) => `${n.toLocaleString('tr-TR')} TL`;

  let budgetText = '';
  const hasMin = typeof minPrice === 'number' && Number.isFinite(minPrice) && minPrice > 0;
  const hasMax = typeof maxPrice === 'number' && Number.isFinite(maxPrice) && maxPrice > 0;
  if (hasMin && hasMax) {
    budgetText = minPrice === maxPrice ? formatTL(maxPrice) : `${formatTL(minPrice)} - ${formatTL(maxPrice)}`;
  } else if (hasMax) {
    budgetText = formatTL(maxPrice);
  } else if (hasMin) {
    budgetText = formatTL(minPrice);
  }

  const location = `${listing.city}/${listing.district}`;
  const titleCore = `${titleCaseTR(listing.title)}${budgetText ? ` - ${budgetText}` : ''} - ${location}`;

  const slogan =
    "Türkiye’nin ilk alım platformu! Bütçene göre alım ilanını oluştur, satıcılar sana teklif versin.";

  const description = [
    slogan,
    `Bütçe: ${budgetText || 'Belirtilmemiş'}.`,
    `${titleCaseTR(listing.title)} talebini ${location} konumunda inceleyin.`,
  ].join(' ');

  let images: string[] = [];
  try {
    const parsed = listing.imagesJson ? JSON.parse(listing.imagesJson) : [];
    if (Array.isArray(parsed)) images = parsed;
  } catch {}
  
  const primaryImage = images[0];
  const primaryImageUrl = primaryImage
    ? (primaryImage.startsWith('http') ? primaryImage : `${baseUrl}${primaryImage}`)
    : undefined;
  const canonicalSlug = buildListingSlug({
    id: listing.id,
    code: listing.code,
    title: listing.title,
    category: listing.category,
    subCategory: listing.subCategory,
  });
  const path = `/talep/${canonicalSlug}`;

  return {
    title: `${titleCore} | Varsagel`,
    description,
    metadataBase: metadataBase,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title: `${titleCore} | Varsagel`,
      description,
      type: 'article',
      url: `${baseUrl}${path}`,
      siteName: 'Varsagel',
      images: primaryImageUrl ? [primaryImageUrl] : [`${baseUrl}/opengraph-image`],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${titleCore} | Varsagel`,
      description,
      images: primaryImageUrl ? [primaryImageUrl] : [`${baseUrl}/twitter-image`],
    },
  };
}

export default async function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: raw } = await params;
  const session = await auth();

  const ident = parseListingIdentifier(raw);
  const listing = await prisma.listing.findFirst({
    where: ident.code ? { code: ident.code } : ident.id ? { id: ident.id } : undefined,
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          createdAt: true,
          _count: {
            select: { listings: true }
          }
        }
      },
      category: true,
      subCategory: true,
      _count: {
        select: { offers: true }
      }
    }
  });

  if (!listing) return notFound();

  const canonicalSlug = buildListingSlug({
    id: listing.id,
    code: listing.code,
    title: listing.title,
    category: listing.category,
    subCategory: listing.subCategory,
  });
  const decoded = decodeURIComponent(String(raw || '')).trim();
  if (decoded !== canonicalSlug) permanentRedirect(`/talep/${canonicalSlug}`);

  // Increment view count only if listing exists
  try {
    await prisma.listing.update({
      where: { id: listing.id },
      data: { viewCount: { increment: 1 } }
    });
  } catch (error) {
    // Log error but don't break the page - view count is not critical
    console.warn('Failed to increment view count:', error);
  }

  const isOwner = session?.user?.email === listing.owner.email;
  
  let images: string[] = [];
  try {
    const parsed = listing.imagesJson ? JSON.parse(listing.imagesJson) : [];
    if (Array.isArray(parsed)) images = parsed;
  } catch {}
  
  const mainImageIndex = (() => {
    const idx = images.findIndex((img) => typeof img === 'string' && !img.startsWith('/images/defaults/'));
    return idx >= 0 ? idx : 0;
  })();
  const mainImage = images[mainImageIndex];
  const otherImages = images.filter((_, i) => i !== mainImageIndex);
  const mainIsDefault = !!mainImage && mainImage.startsWith('/images/defaults/');
  const mainIsRemote = !!mainImage && (mainImage.startsWith('http://') || mainImage.startsWith('https://'));
  const mainIsJfif = !!mainImage && (/\.jfif($|\?)/i.test(mainImage) || /\.jif($|\?)/i.test(mainImage));

  let attributes: Record<string, any> = {};
  try {
    const parsed = listing.attributesJson ? JSON.parse(listing.attributesJson) : {};
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) attributes = parsed;
  } catch {}

  const displayTitle = titleCaseTR(listing.title);

  const humanizeKeyTR = (rawKey: string) => {
    const raw = String(rawKey || '').trim();
    if (!raw) return '';
    const withSpaces = raw
      .replace(/[-_]+/g, ' ')
      .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
      .replace(/\s+/g, ' ')
      .trim();
    return titleCaseTR(withSpaces);
  };

  const labelForKey = (key: string) => {
    const map: Record<string, string> = {
      minPrice: 'Minimum Fiyat',
      maxPrice: 'Maksimum Fiyat',
      minBudget: 'Minimum Bütçe',
      budget: 'Maksimum Bütçe',
      marka: 'Marka',
      model: 'Model',
      seri: 'Motor / Seri',
      paket: 'Donanım / Paket',
      yil: 'Yıl',
      km: 'Kilometre',
      yakit: 'Yakıt',
      vites: 'Vites',
      kasaTipi: 'Kasa Tipi',
      motorGucu: 'Motor Gücü',
      motorHacmi: 'Motor Hacmi',
      plakaUyruk: 'Plaka / Uyruk',
      aracDurumu: 'Araç Durumu',
      agirhasarKayitli: 'Ağır Hasar Kayıtlı',
      aracDurumu1: 'Araç Durumu',
      motorSeri: 'Motor / Seri',
      donanimPaket: 'Donanım / Paket',
      'motor-seri': 'Motor / Seri',
      'donanim-paket': 'Donanım / Paket',
      'arac-durumu': 'Araç Durumu',
      'agirhasar-kayitli': 'Ağır Hasar Kayıtlı',
      'kasa-tipi': 'Kasa Tipi',
      'motor-gucu': 'Motor Gücü',
      'motor-hacmi': 'Motor Hacmi',
      'plaka-uyruk': 'Plaka / Uyruk',
    };
    if (map[key]) return map[key];
    return humanizeKeyTR(key);
  };

  const formatValueTR = (value: any, key?: string): string => {
    if (value === null || value === undefined) return '—';
    const noGroupForKey = (k?: string) => {
      if (!k) return false;
      return k === 'yil' || k.endsWith('yil') || k.endsWith('yilMin') || k.endsWith('yilMax');
    };
    const fmtNum = (n: number, k?: string) => {
      if (!Number.isFinite(n)) return String(n);
      if (noGroupForKey(k)) return new Intl.NumberFormat('tr-TR', { useGrouping: false }).format(n);
      return new Intl.NumberFormat('tr-TR').format(n);
    };
    if (typeof value === 'string') {
      const v = value.trim();
      if (!v) return '—';
      if (/^\d+$/.test(v)) return fmtNum(Number(v), key);
      return titleCaseTR(v);
    }
    if (typeof value === 'number') return fmtNum(value, key);
    if (typeof value === 'bigint') return fmtNum(Number(value), key);
    if (typeof value === 'boolean') return value ? 'Evet' : 'Hayır';
    if (Array.isArray(value)) return value.map((x) => formatValueTR(x, key)).filter(Boolean).join(', ') || '—';
    if (typeof value === 'object') {
      try {
        return JSON.stringify(value);
      } catch {
        return String(value);
      }
    }
    return String(value);
  };

  const detailItems = (() => {
    const reserved = new Set(['minPrice', 'maxPrice', 'minBudget', 'budget']);
    const priority = new Map<string, number>([
      ['marka', 1],
      ['model', 2],
      ['seri', 3],
      ['paket', 4],
      ['yil', 50],
      ['km', 51],
    ]);

    const ranges = new Map<string, { min?: any; max?: any; order: number }>();
    const normal: Array<{ key: string; label: string; value: string; order: number }> = [];

    const entries = Object.entries(attributes);
    for (let i = 0; i < entries.length; i++) {
      const [key, value] = entries[i];
      if (reserved.has(key)) continue;
      if (key.endsWith('Min') || key.endsWith('Max')) {
        const base = key.slice(0, -3);
        const current = ranges.get(base) || { order: i };
        if (key.endsWith('Min')) current.min = value;
        if (key.endsWith('Max')) current.max = value;
        ranges.set(base, current);
        continue;
      }
      normal.push({ key, label: labelForKey(key), value: formatValueTR(value, key), order: i });
    }

    const rangeRows: Array<{ key: string; label: string; value: string; order: number }> = [];
    for (const [base, r] of ranges.entries()) {
      const hasMin = r.min !== undefined && String(r.min).trim() !== '';
      const hasMax = r.max !== undefined && String(r.max).trim() !== '';
      if (!hasMin && !hasMax) continue;
      const minText = hasMin ? formatValueTR(r.min, base) : '';
      const maxText = hasMax ? formatValueTR(r.max, base) : '';
      const value =
        hasMin && hasMax ? `${minText} - ${maxText}` : hasMin ? `En Az ${minText}` : `En Çok ${maxText}`;
      rangeRows.push({ key: base, label: labelForKey(base), value, order: r.order });
    }

    const combined = [...normal, ...rangeRows];
    combined.sort((a, b) => {
      const pa = priority.get(a.key) ?? 1000;
      const pb = priority.get(b.key) ?? 1000;
      if (pa !== pb) return pa - pb;
      return a.order - b.order;
    });

    return combined;
  })();

  // Fetch similar listings
  const { data: similarListings } = await getListings({
    category: listing.category.slug,
    limit: 4,
    status: 'OPEN'
  });
  
  const filteredSimilar = similarListings.filter((l: any) => l.id !== listing.id).slice(0, 4);

  // Check if current user has an accepted offer
  let hasAcceptedOffer = false;
  if (session?.user?.email) {
    const acceptedOffer = await prisma.offer.findFirst({
      where: {
        listingId: listing.id,
        seller: {
          email: session.user.email
        },
        status: 'ACCEPTED'
      }
    });
    hasAcceptedOffer = !!acceptedOffer;
  }

  const budget =
    typeof listing.budget === 'bigint'
      ? Number(listing.budget)
      : Number(listing.budget || 0);

  const imageUrl = images[0]
    ? images[0].startsWith('http')
      ? images[0]
      : `${baseUrl}${images[0]}`
    : undefined;

  const questions = await prisma.question.findMany({
    where: { listingId: listing.id, answer: { not: null } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const demandJsonLd = {
    "@context": "https://schema.org",
    "@type": "Demand",
    name: listing.title,
    description: listing.description,
    url: `${baseUrl}/talep/${canonicalSlug}`,
    itemOffered: {
      "@type": "Product",
      name: listing.title,
      category: listing.subCategory
        ? `${titleCaseTR(listing.category.name)} / ${titleCaseTR(listing.subCategory.name)}`
        : titleCaseTR(listing.category.name),
    },
    areaServed: listing.city
      ? listing.district
        ? `${listing.city}, ${listing.district}`
        : listing.city
      : undefined,
    priceSpecification:
      budget > 0
        ? {
            "@type": "PriceSpecification",
            priceCurrency: "TRY",
            price: budget,
          }
        : undefined,
    datePosted: listing.createdAt.toISOString(),
    image: imageUrl ? [imageUrl] : undefined,
  };

  const faqItems = questions
    .map((q) => ({
      question: q.body.trim(),
      answer: q.answer?.trim() || "",
    }))
    .filter((q) => q.question && q.answer);

  const faqJsonLd = faqItems.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqItems.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      }
    : null;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Ana Sayfa",
        item: baseUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: titleCaseTR(listing.category.name),
        item: `${baseUrl}/kategori/${listing.category.slug}`,
      },
      listing.subCategory
        ? {
            "@type": "ListItem",
            position: 3,
            name: titleCaseTR(listing.subCategory.name),
            item: `${baseUrl}/kategori/${listing.category.slug}/${listing.subCategory.slug}`,
          }
        : {
            "@type": "ListItem",
            position: 3,
            name: listing.title,
            item: `${baseUrl}/talep/${canonicalSlug}`,
          },
      listing.subCategory
        ? {
            "@type": "ListItem",
            position: 4,
            name: listing.title,
            item: `${baseUrl}/talep/${canonicalSlug}`,
          }
        : null,
    ].filter(Boolean),
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(demandJsonLd),
        }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqJsonLd),
          }}
        />
      )}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd),
        }}
      />
      {/* Breadcrumb & Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2 text-sm text-gray-500 hidden sm:flex">
              <Link href="/" className="hover:text-cyan-600">Ana Sayfa</Link>
              <span>/</span>
              <Link href={`/kategori/${listing.category.slug}`} className="hover:text-cyan-600">{titleCaseTR(listing.category.name)}</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium line-clamp-1">{displayTitle}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <ShareListing id={listing.id} title={displayTitle} />
            <FavoriteButton listingId={listing.id} initial={false} disabled={listing.ownerId === session?.user?.id} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Gallery */}
            {images.length > 0 && (
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                {mainIsDefault ? (
                  <div className="p-8 bg-gray-50 flex items-center justify-center">
                    <Image
                      src={mainImage}
                      alt={listing.title}
                      width={420}
                      height={420}
                      unoptimized
                      quality={100}
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div className="aspect-video relative">
                    <Image
                      src={mainImage}
                      alt={listing.title}
                      fill
                      className={mainImage.startsWith('/images/brands/') ? "object-contain p-12" : "object-cover"}
                      priority
                      quality={95}
                      unoptimized={mainIsRemote || mainIsJfif}
                      sizes="(max-width: 1024px) 100vw, 66vw"
                    />
                  </div>
                )}
                {otherImages.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2">
                    {otherImages.map((img: string, i: number) => (
                      <div key={i} className="aspect-video relative rounded-lg overflow-hidden">
                        <Image
                          src={img}
                          alt={`${listing.title} - ${i + 2}`}
                          fill
                          className={`${img.startsWith('/images/brands/') ? 'object-contain p-2' : 'object-cover'} hover:scale-110 transition-transform duration-300`}
                          quality={85}
                          unoptimized={img.startsWith('http://') || img.startsWith('https://') || /\.jfif($|\?)/i.test(img) || /\.jif($|\?)/i.test(img)}
                          sizes="(max-width: 640px) 50vw, 25vw"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Title & Info */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              {listing.status === 'PENDING' && (
                <div className="mb-4 flex items-start gap-3 rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
                  <ShieldCheck className="w-4 h-4 mt-0.5" />
                  <div>
                    <p className="font-semibold">Talep admin onayı bekliyor</p>
                    <p className="text-xs text-yellow-700 mt-0.5">
                      Bu talep yayınlanmadan önce ekibimiz tarafından kontrol ediliyor. Onaylandığında teklif verebilir ve favorilere ekleyebilirsiniz.
                    </p>
                  </div>
                </div>
              )}
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 break-words">{displayTitle}</h1>
                <div className="w-full md:w-auto flex flex-row md:flex-col justify-between md:justify-start items-center md:items-end md:text-right shrink-0 bg-gray-50 md:bg-transparent p-3 md:p-0 rounded-lg md:rounded-none border md:border-none border-gray-100">
                  <p className="text-sm text-gray-500 mb-0 md:mb-1">Talep Bütçesi</p>
                  {(() => {
                    try {
                      const minP = attributes?.minPrice ? Number(attributes.minPrice) : 0;
                      const maxPAttr = attributes?.maxPrice ? Number(attributes.maxPrice) : 0;
                      const budget = typeof listing.budget === 'bigint' ? Number(listing.budget) : Number(listing.budget || 0);

                      const hasMin = minP > 0;
                      const hasMax = maxPAttr > 0;
                      const hasBudget = budget > 0;

                      let from = 0;
                      let to = 0;

                      if (hasMin && hasMax) {
                        from = minP;
                        to = maxPAttr;
                      } else if (hasMin && hasBudget) {
                        from = minP;
                        to = budget;
                      } else if (hasMin) {
                        return (
                          <p className="text-xl md:text-2xl font-bold text-cyan-600">
                            {minP.toLocaleString('tr-TR')} - ∞
                          </p>
                        );
                      } else if (hasMax) {
                        from = 0;
                        to = maxPAttr;
                      } else if (hasBudget) {
                        from = 0;
                        to = budget;
                      } else {
                        return (
                          <p className="text-xl md:text-2xl font-bold text-gray-400">
                            Belirtilmemiş
                          </p>
                        );
                      }

                      return (
                        <p className="text-xl md:text-2xl font-bold text-cyan-600">
                          {from.toLocaleString('tr-TR')} - {to.toLocaleString('tr-TR')}
                        </p>
                      );
                    } catch (error) {
                      console.error('Bütçe hesaplama hatası:', error);
                      return (
                        <p className="text-xl md:text-2xl font-bold text-gray-400">
                          Belirtilmemiş
                        </p>
                      );
                    }
                  })()}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 pb-6 border-b border-gray-100">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  {listing.city}, {listing.district}
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {formatTimeAgoTR(new Date(listing.createdAt))}
                </div>
                <div className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4" />
                  {(listing as any).viewCount} görüntülenme
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-cyan-50 text-cyan-700 rounded-full font-medium">
                  {listing._count.offers} Teklif
                </div>
              </div>

              <div className="py-6">
                <h2 className="text-lg font-bold text-gray-900 mb-3">Talep Açıklaması</h2>
                <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">{listing.description}</p>
              </div>

              {/* Attributes */}
              {detailItems.length > 0 && (
                <div className="pt-6 border-t border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Detaylar</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {detailItems.map((item) => (
                      <div key={`${item.key}-${item.order}`} className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-xl">
                        <span className="text-gray-500">{item.label}</span>
                        <span className="font-medium text-gray-900 text-right">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Questions */}
            <QuestionsSection listingId={listing.id} isOwner={isOwner} />

          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Action Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border border-gray-200">
                   {listing.owner.image ? (
                      <Image src={listing.owner.image} alt={listing.owner.name || ''} width={56} height={56} className="w-full h-full object-cover" />
                   ) : (
                      <User className="w-7 h-7 text-gray-400" />
                   )}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Talep Sahibi</p>
                  <p className="font-bold text-gray-900">{listing.owner.name}</p>
                  <div className="flex items-center gap-1 text-xs text-lime-600 mt-0.5">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Onaylı Üye</span>
                  </div>
                </div>
              </div>

              {isOwner ? (
                <div className="space-y-3">
                  <div className="p-4 bg-cyan-50 rounded-xl mb-4">
                    <p className="text-sm text-cyan-800 font-medium flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4" />
                      Bu talep size ait
                    </p>
                    <p className="text-xs text-cyan-600 mt-1">
                      Gelen teklifleri profilinizden yönetebilirsiniz.
                    </p>
                  </div>
                  <Link href={`/profil?tab=taleplerim`} className="w-full flex items-center justify-center gap-2 bg-white border-2 border-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:border-gray-300 hover:bg-gray-50 transition-all">
                    <Edit className="w-4 h-4" />
                    Talebi Düzenle
                  </Link>
                  {/* <button className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 py-3 rounded-xl font-bold hover:bg-red-100 transition-all">
                    <Trash2 className="w-4 h-4" />
                    Talebi Yayından Kaldır
                  </button> */}
                </div>
              ) : (
                <ListingActionButtons 
                  listingId={listing.id} 
                  isAuthenticated={!!session?.user} 
                  hasAcceptedOffer={hasAcceptedOffer}
                  isOpen={listing.status === 'OPEN'}
                />
              )}
            </div>

            <SafetyTips listingId={listing.id} listingTitle={displayTitle} isAuthenticated={!!session?.user} />

          </div>

        </div>

        {/* Similar Listings */}
        {filteredSimilar.length > 0 && (
          <div className="mt-16 border-t border-gray-200 pt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Benzer Talepler</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {filteredSimilar.map((l: any) => (
                <TalepCard key={l.id} listing={l} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
