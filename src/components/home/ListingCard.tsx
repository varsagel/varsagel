import Link from "next/link";
import Image from "next/image";
import FavoriteButton from '@/components/ui/FavoriteButton';
import { getCategoryImage, getSubcategoryImage } from '@/data/subcategory-images';
import BRAND_LOGOS from "@/data/brand-logos.json";
import { Eye, MapPin } from "lucide-react";
import { listingHref } from '@/lib/listing-url';
import { titleCaseTR } from '@/lib/title-case-tr';

// Formatters moved outside to avoid recreation on every render
const tryFormatter = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

function formatTryLocal(price: number) {
  return tryFormatter.format(price);
}

const normalizeImageSrc = (src: string) => {
  const value = String(src || "").trim();
  if (!value) return value;
  if (!/%[0-9A-Fa-f]{2}/.test(value)) return value;
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

export interface ListingItem {
  id: string;
  code?: string | null;
  title: string;
  description: string;
  price: number;
  category: string;
  subcategory?: string;
  location: { city: string; district: string };
  images: string[];
  attributes: Record<string, any>;
  buyer: { name: string; rating: number };
  createdAt: string;
  status: "active" | "pending" | "sold";
  viewCount: number;
  isFavorited: boolean;
}

function BrandBadge({ category, subcategory, attributes }: { category: string; subcategory?: string; attributes: Record<string, any> }) {
  const brandKey =
    typeof attributes?.marka === "string"
      ? attributes.marka
      : typeof attributes?.brand === "string"
        ? attributes.brand
        : "";

  const logoSrc = brandKey && (BRAND_LOGOS as Record<string, string>)[brandKey] ? (BRAND_LOGOS as Record<string, string>)[brandKey] : null;
  if (!logoSrc && !brandKey && !subcategory) return null;

  return (
    <div className="mt-3 pt-2 border-t border-slate-100">
      <div className="flex items-center gap-1.5">
        {logoSrc ? (
          <div
            role="img"
            aria-label={brandKey || "Marka"}
            className="w-4 h-4 bg-center bg-no-repeat bg-contain"
            style={{ backgroundImage: `url(${logoSrc})` }}
          />
        ) : (
          <div className="w-4 h-4 flex items-center justify-center rounded-full bg-slate-100 text-[9px] font-bold text-slate-500">
            {String(category || "K").slice(0, 1).toUpperCase()}
          </div>
        )}
        <span className="text-[11px] font-medium text-slate-600 truncate">
          {brandKey || subcategory || ""}
        </span>
      </div>
    </div>
  );
}

export default function ListingCard({ listing, priority }: { listing: ListingItem; priority?: boolean }) {
  const href = listingHref({
    id: listing.id,
    code: listing.code,
    title: listing.title,
    category: listing.category,
    subcategory: listing.subcategory,
  });

  const subcategoryImage = getSubcategoryImage(listing.subcategory || "", listing.category);
  const categoryImage = getCategoryImage(listing.category);
  const initialSrc = listing.images?.[0] || subcategoryImage || categoryImage || "";
  const displaySrc = normalizeImageSrc(initialSrc);
  const isDefaultImage = displaySrc.startsWith('/images/defaults/') || displaySrc.startsWith('/images/subcategories/');
  const isRemoteImage = displaySrc.startsWith('http://') || displaySrc.startsWith('https://');
  const isJfifImage = /\.jfif($|\?)/i.test(displaySrc) || /\.jif($|\?)/i.test(displaySrc);
  let isS3Host = false;
  let isCloudFrontHost = false;
  let isAllowedRemote = false;
  if (isRemoteImage) {
    try {
      const host = new URL(displaySrc).hostname.toLowerCase();
      isS3Host = host.includes(".s3.");
      isCloudFrontHost = host.endsWith(".cloudfront.net");
      isAllowedRemote =
        host === 'varsagel.com' ||
        host === 'www.varsagel.com' ||
        host === 'localhost' ||
        host === '127.0.0.1' ||
        isS3Host ||
        isCloudFrontHost;
    } catch {
      isAllowedRemote = false;
    }
  }

  const minPrice = listing.attributes?.minPrice;
  const maxPrice = listing.attributes?.maxPrice;
  let priceText = formatTryLocal(listing.price);
  if (minPrice && maxPrice) {
    const min = typeof minPrice === 'string' ? parseFloat(minPrice) : minPrice;
    const max = typeof maxPrice === 'string' ? parseFloat(maxPrice) : maxPrice;
    priceText = `${formatTryLocal(min)} - ${formatTryLocal(max)}`;
  } else if (minPrice) {
    const min = typeof minPrice === 'string' ? parseFloat(minPrice) : minPrice;
    priceText = `En Az ${formatTryLocal(min)}`;
  } else if (maxPrice) {
    const max = typeof maxPrice === 'string' ? parseFloat(maxPrice) : maxPrice;
    priceText = `En Çok ${formatTryLocal(max)}`;
  }

  const s = String(listing.status || "").toLowerCase();
  const statusBadge =
    s === "active"
      ? { label: "Aktif", className: "bg-emerald-500/95 text-white border border-white/30" }
      : s === "pending"
        ? { label: "Onay Bekliyor", className: "bg-amber-500/95 text-white border border-white/30" }
        : s === "sold"
          ? { label: "Kapandı", className: "bg-slate-700/95 text-white border border-white/20" }
          : null;

  const parts: string[] = [];
  const mahalle = typeof (listing.attributes as any)?.mahalle === "string" ? String((listing.attributes as any)?.mahalle).trim() : "";
  if (listing.category === "emlak" && mahalle) parts.push(mahalle);
  if (listing.location?.district) parts.push(listing.location.district);
  if (listing.location?.city) parts.push(listing.location.city);
  const locationText = parts.filter(Boolean).join(", ");

  return (
    <div className="group bg-white rounded-xl border border-slate-200 hover:border-[#85C0CA] shadow-sm hover:shadow-lg hover:shadow-[#3E849E]/10 transition-all duration-300 overflow-hidden relative flex flex-col h-full">
      <Link href={href} prefetch={false} className="block relative aspect-[4/3] overflow-hidden bg-slate-100">
        <Image
          src={displaySrc}
          alt={listing.title}
          priority={priority}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
          unoptimized={isDefaultImage || isJfifImage || (isRemoteImage && !isAllowedRemote)}
          quality={isDefaultImage ? 90 : 75}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

        {/* Price Badge */}
        <div suppressHydrationWarning className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs font-bold text-slate-900 shadow-sm">
          {priceText}
        </div>

        {/* Category Badge */}
        <div className="absolute top-2 right-2 flex items-center gap-1.5">
          {statusBadge && (
            <div className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide backdrop-blur-md ${statusBadge.className}`}>
              {statusBadge.label}
            </div>
          )}
          <div className="bg-black/40 backdrop-blur-md border border-white/20 text-white px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide">
            {titleCaseTR(listing.category)}
          </div>
        </div>
      </Link>
      
      <div className="absolute top-2 left-2 z-10">
        <FavoriteButton listingId={listing.id} isFavorited={listing.isFavorited} />
      </div>

      <div className="p-4 flex flex-col flex-1">
        <Link href={href} prefetch={false} className="block flex-1">
          <h3 className="font-semibold text-slate-900 mb-2 text-sm leading-snug line-clamp-2 group-hover:text-[#1E4355] transition-colors">
            {listing.title}
          </h3>
        </Link>

        <div className="mt-auto space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span suppressHydrationWarning className="truncate max-w-[100px]">
                {locationText}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              <span className="tabular-nums">{listing.viewCount ?? 0}</span>
            </div>
          </div>

          <BrandBadge category={listing.category} subcategory={listing.subcategory} attributes={listing.attributes} />
        </div>
      </div>
    </div>
  );
}
