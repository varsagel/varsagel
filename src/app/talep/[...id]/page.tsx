import { auth } from '@/auth';
import TalepCard from '@/components/home/TalepCardOptimized';
import FavoriteButton from '@/components/talep/FavoriteButton';
import QuestionsSection from '@/components/talep/QuestionsSection';
import ShareListing from '@/components/talep/ShareListing';
import ListingActionButtons from '@/components/talep/ListingActionButtons';
import SafetyTips from '@/components/talep/SafetyTips';
import { prisma } from '@/lib/prisma';
import { getListings } from '@/lib/services/listingService';
import { ArrowLeft, Calendar, CheckCircle2, Eye, Hash, MapPin, ShieldCheck, User, Edit } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import Image from 'next/image';
import { headers } from 'next/headers';
import { metadataBase, siteUrl } from '@/lib/metadata-base';
import { buildListingSlug, parseListingIdentifier } from '@/lib/listing-url';
import { titleCaseTR } from '@/lib/title-case-tr';
import { getSubcategoryImage } from '@/data/subcategory-images';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const baseUrl = siteUrl;

const rtf = new Intl.RelativeTimeFormat("tr-TR", { numeric: "auto" });

function resolveListingIdentifier(param: string | string[]) {
  const parts = Array.isArray(param) ? param.filter(Boolean) : [param];
  const rawLast = String(parts[parts.length - 1] || '').trim();
  const rawJoined = parts.join('-');
  const lastHasCode = /^\d{6}$/.test(rawLast) || /^\d{9}$/.test(rawLast) || /-(\d{6}|\d{9})$/.test(rawLast);
  const lastHasId = /^c[a-z0-9]{24}$/.test(rawLast) || /-(c[a-z0-9]{24})$/.test(rawLast);
  if (lastHasCode || lastHasId) return parseListingIdentifier(rawLast);
  if (rawJoined) return parseListingIdentifier(rawJoined);
  return parseListingIdentifier(rawLast);
}

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
  if (absMonths < 12) return rtf.format(diffWeeks, "month");

  const diffYears = Math.round(diffDays / 365);
  return rtf.format(diffYears, "year");
}

export async function generateMetadata({ params }: { params: Promise<{ id: string | string[] }> }): Promise<Metadata> {
  const { id } = await params;
  const ident = resolveListingIdentifier(id);
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

export default async function ListingPage({ params }: { params: Promise<{ id: string | string[] }> }) {
  const { id } = await params;
  const parts = Array.isArray(id) ? id.filter(Boolean) : [id];
  const raw = parts[parts.length - 1] || '';
  const isMultiSegment = Array.isArray(id) && id.length > 1;
  const session = await auth();

  const ident = resolveListingIdentifier(id);
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
  if (!isMultiSegment) {
    const decoded = decodeURIComponent(String(raw || '')).trim();
    if (decoded !== canonicalSlug) permanentRedirect(`/talep/${canonicalSlug}`);
  }

  const isOwner = session?.user?.email === listing.owner.email;
  let viewCount = listing.viewCount || 0;
  try {
    const headerStore = await headers();
    const ipRaw = headerStore.get('x-forwarded-for') || headerStore.get('x-real-ip') || null;
    const ip = ipRaw ? ipRaw.split(',')[0].trim() : null;
    const userAgent = headerStore.get('user-agent') || null;
    const path = `/talep/${canonicalSlug}`;
    const cutoff = new Date(Date.now() - 6 * 60 * 60 * 1000);
    let duplicateFound = false;

    let safeUserId: string | null = null;
    if (session?.user?.id) {
      const userExists = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true },
      });
      safeUserId = userExists?.id || null;
    }

    if (safeUserId) {
      const existing = await prisma.visit.findFirst({
        where: {
          path,
          createdAt: { gte: cutoff },
          userId: safeUserId,
        },
      });
      if (existing) duplicateFound = true;
    } else if (ip) {
      const existing = await prisma.visit.findFirst({
        where: {
          path,
          createdAt: { gte: cutoff },
          ip,
          userAgent: userAgent || undefined,
        },
      });
      if (existing) duplicateFound = true;
    }

    if (!duplicateFound && !isOwner) {
      const updated = await prisma.listing.update({
        where: { id: listing.id },
        data: { viewCount: { increment: 1 } },
        select: { viewCount: true },
      });
      viewCount = updated.viewCount;
      if (safeUserId || ip || userAgent) {
        try {
          await prisma.visit.create({
            data: {
              path,
              userId: safeUserId,
              ip: ip || undefined,
              userAgent: userAgent || undefined,
            },
          });
        } catch {
          if (safeUserId) {
            try {
              await prisma.visit.create({
                data: {
                  path,
                  userId: null,
                  ip: ip || undefined,
                  userAgent: userAgent || undefined,
                },
              });
            } catch {}
          }
        }
      }
    }
  } catch (error) {
    console.warn('Failed to increment view count:', error);
  }

  const sessionUserId = session?.user?.id;
  const isFavorited = sessionUserId
    ? !!(await prisma.favorite.findUnique({
        where: { userId_listingId: { userId: sessionUserId, listingId: listing.id } },
        select: { id: true },
      }))
    : false;
  
  let images: string[] = [];
  try {
    const parsed = listing.imagesJson ? JSON.parse(listing.imagesJson) : [];
    if (Array.isArray(parsed)) images = parsed;
  } catch {}
  
  const normalizeImageSrc = (src?: string) => {
    const value = String(src || "").trim();
    if (!value) return value;
    if (value.startsWith("http://") || value.startsWith("https://")) return value;
    if (value.startsWith("data:")) return value;
    if (!/%[0-9A-Fa-f]{2}/.test(value)) return value;
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  };
  const isPlaceholderImage = (src?: string) => {
    const value = String(src || "").trim();
    if (!value) return true;
    const lower = value.toLowerCase();
    if (lower.includes("placeholder-image.jpg")) return true;
    if (lower.includes("/images/placeholder-1.svg")) return true;
    if (lower.startsWith("data:image/svg")) return true;
    if (/\.svg($|\?)/i.test(value)) return true;
    return false;
  };

  const categoryKey = listing.category?.slug || listing.category?.name || "";
  const subCategoryKey = listing.subCategory?.slug || listing.subCategory?.name || "";
  const fallbackImage = getSubcategoryImage(subCategoryKey, categoryKey);

  const normalizedImages = images
    .map((img) => normalizeImageSrc(img))
    .filter((img) => !isPlaceholderImage(img));
  const safeImages = normalizedImages.length > 0 ? normalizedImages : [fallbackImage];
  const mainImageIndex = (() => {
    const idx = safeImages.findIndex((img) => typeof img === 'string' && !img.startsWith('/images/defaults/'));
    return idx >= 0 ? idx : 0;
  })();
  const mainImage = safeImages[mainImageIndex];
  const otherImages = safeImages.filter((_, i) => i !== mainImageIndex);
  const isAllowedRemote = (src?: string) => {
    if (!src || !/^https?:\/\//i.test(src)) return false;
    try {
      const host = new URL(src).hostname.toLowerCase();
      return host === 'varsagel.com' || host === 'www.varsagel.com' || host === 'localhost' || host === '127.0.0.1' || host.includes(".s3.") || host.endsWith(".cloudfront.net");
    } catch {
      return false;
    }
  };
  const shouldUnoptimize = (src?: string) => {
    if (!src) return true;
    const isRemote = /^https?:\/\//i.test(src);
    const isJfif = /\.jfif($|\?)/i.test(src) || /\.jif($|\?)/i.test(src);
    if (isJfif) return true;
    if (/\.svg($|\?)/i.test(src)) return true;
    if (src.startsWith("data:")) return true;
    if (isRemote && !isAllowedRemote(src)) return true;
    return false;
  };

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

  const { data: similarListings } = await getListings({
    category: listing.category.slug,
    limit: 4,
    status: 'OPEN'
  });
  
  const filteredSimilar = similarListings.filter((l: any) => l.id !== listing.id).slice(0, 4);

  let hasAcceptedOffer = false;
  if (session?.user?.email) {
    const acceptedOffer = await prisma.offer.findFirst({
      where: {
        listingId: listing.id,
        seller: {
          email: session.user.email
        },
        status: 'ACCEPTED'
      },
      select: { id: true }
    });
    hasAcceptedOffer = !!acceptedOffer;
  }

  const canSendMessage = isOwner || hasAcceptedOffer;

  const stats = [
    { icon: Calendar, label: 'İlan Tarihi', value: new Date(listing.createdAt).toLocaleDateString('tr-TR') },
    { icon: Eye, label: 'Görüntülenme', value: viewCount.toLocaleString('tr-TR') },
    ...(listing.code ? [{ icon: Hash, label: 'Talep No', value: listing.code }] : []),
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-cyan-600 transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                  <span>Geri</span>
                </Link>
                <div className="flex items-center gap-3">
                  <ShareListing id={listing.id} title={displayTitle} slug={canonicalSlug} />
                  <FavoriteButton listingId={listing.id} initial={isFavorited} disabled={isOwner} />
                </div>
              </div>

              <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{displayTitle}</h1>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {listing.city}, {listing.district}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatTimeAgoTR(new Date(listing.createdAt))}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {listing.status === 'OPEN' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Açık
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                        Kapalı
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="px-6 pb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {stats.map((stat) => (
                    <div key={stat.label} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <stat.icon className="w-5 h-5 text-cyan-600" />
                      <div>
                        <p className="text-xs text-gray-500">{stat.label}</p>
                        <p className="text-sm font-medium text-gray-900">{stat.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="px-6 pb-6">
                <div className="rounded-xl overflow-hidden bg-gray-100">
                  {mainImage ? (
                    <Image
                      src={mainImage}
                      alt={displayTitle}
                      width={1200}
                      height={800}
                      priority
                      className="w-full h-auto object-cover"
                      unoptimized={shouldUnoptimize(mainImage)}
                    />
                  ) : (
                    <div className="w-full h-[360px] flex items-center justify-center text-gray-400">
                      Görsel bulunamadı
                    </div>
                  )}
                </div>
              </div>

              {otherImages.length > 0 && (
                <div className="px-6 pb-6">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {otherImages.map((img, idx) => (
                      <div key={`${img}-${idx}`} className="rounded-lg overflow-hidden bg-gray-100">
                        <Image
                          src={img}
                          alt={`${displayTitle} ${idx + 2}`}
                          width={400}
                          height={300}
                          className="w-full h-auto object-cover"
                          unoptimized={shouldUnoptimize(img)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="px-6 pb-8 border-t border-gray-100">
                <div className="py-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">Açıklama</h2>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {listing.description || "Açıklama bulunmuyor."}
                  </p>
                </div>

                {detailItems.length > 0 && (
                  <div className="pt-6 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-gray-900">Detaylar</h2>
                      <span className="text-xs font-semibold text-gray-500 bg-gray-50 px-2 py-1 rounded-full border border-gray-100">
                        {detailItems.length} özellik
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {detailItems.map((item) => (
                        <div key={item.key} className="rounded-xl border border-gray-100 bg-gray-50/70 p-4 flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{item.label}</div>
                            <div className="mt-2 text-sm font-semibold text-gray-900 break-words">{item.value}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <QuestionsSection listingId={listing.id} isOwner={isOwner} />
          </div>

          <div className="lg:w-1/3 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                  {listing.owner.image ? (
                    <Image
                      src={listing.owner.image}
                      alt={listing.owner.name || "Kullanıcı"}
                      width={48}
                      height={48}
                      className="w-12 h-12 object-cover"
                      unoptimized={shouldUnoptimize(listing.owner.image)}
                    />
                  ) : (
                    <User className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <div>
                  <div className="text-sm text-gray-500">Talep Sahibi</div>
                  <div className="text-base font-semibold text-gray-900">{listing.owner.name || "Anonim"}</div>
                </div>
              </div>

              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-600" />
                  <span>Üyelik tarihi: {new Date(listing.owner.createdAt).toLocaleDateString('tr-TR')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-600" />
                  <span>{listing.owner._count.listings} ilan</span>
                </div>
              </div>

              <div className="mt-6">
                <ListingActionButtons
                  listingId={listing.id}
                  isAuthenticated={!!session?.user?.id}
                  hasAcceptedOffer={hasAcceptedOffer}
                  isOpen={listing.status === 'OPEN'}
                />
              </div>

              {canSendMessage && (
                <div className="mt-4">
                  <Link
                    href={`/mesajlar?listingId=${listing.id}`}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 text-white hover:bg-cyan-700 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Mesaj Gönder
                  </Link>
                </div>
              )}
            </div>

            <SafetyTips
              listingId={listing.id}
              listingTitle={displayTitle}
              isAuthenticated={!!session?.user?.id}
            />
          </div>
        </div>
      </div>

      {filteredSimilar.length > 0 && (
        <div className="bg-white border-t border-gray-200 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Benzer Talepler</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredSimilar.map((talep: any) => (
                <TalepCard key={talep.id} listing={talep} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
